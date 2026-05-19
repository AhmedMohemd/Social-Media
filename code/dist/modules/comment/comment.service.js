"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const services_1 = require("../../common/services");
const repository_1 = require("../../DB/repository");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("../../common/exceptions");
const postFunction_1 = require("../../common/utils/postFunction");
class CommentService {
    redis;
    userRepository;
    commentRepository;
    postRepository;
    notification;
    s3;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.postRepository = new repository_1.PostRepository();
        this.commentRepository = new repository_1.CommentRepository();
        this.redis = services_1.redisService;
        this.s3 = services_1.s3Service;
        this.notification = services_1.notificationService;
    }
    async listComments(postId, { page, size }, user) {
        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: (0, postFunction_1.getAvailability)(user),
            },
        });
        if (!post) {
            throw new exceptions_1.NotFoundException("Fail to find matching post");
        }
        return await this.commentRepository.paginate({
            filter: {
                postId,
                commentId: { $exists: false },
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "createdBy",
                    },
                    {
                        path: "tags",
                    },
                    {
                        path: "reply",
                        populate: [
                            {
                                path: "createdBy",
                            },
                            {
                                path: "reply",
                                populate: [
                                    {
                                        path: "createdBy",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        });
    }
    async createComment({ postId }, { content, files = [], tags }, user) {
        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: (0, postFunction_1.getAvailability)(user),
            },
        });
        if (!post) {
            throw new exceptions_1.NotFoundException("Fail to find matching post");
        }
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new exceptions_1.NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).forEach((token) => FCM_Tokens.push(token));
            }
        }
        const folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `Post/${folderId}`,
            });
        }
        const comment = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content,
                attachments,
                postId: post._id,
                tags: mentions,
            },
        });
        if (!comment) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => ({ Key: ele })),
                });
            }
            throw new exceptions_1.BadRequestException("Fail to create comment");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in his comment`,
                        postId: post._id,
                        commentId: comment._id,
                    }),
                },
            });
        }
        return comment.toJSON();
    }
    async replyOnComment({ postId, commentId }, { content, files = [], tags }, user) {
        const comment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: { $or: (0, postFunction_1.getAvailability)(user) },
                    },
                ],
            },
        });
        if (!comment?.postId) {
            throw new exceptions_1.NotFoundException("Fail to find matching comment");
        }
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new exceptions_1.NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).forEach((token) => FCM_Tokens.push(token));
            }
        }
        const post = comment.postId;
        const folderId = post.folderId;
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `Post/${folderId}`,
            });
        }
        const reply = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content,
                attachments,
                postId: post._id,
                commentId: comment._id,
                tags: mentions,
            },
        });
        if (!reply) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => ({ Key: ele })),
                });
            }
            throw new exceptions_1.BadRequestException("Fail to create reply");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Comment mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in a reply`,
                        postId: post._id,
                        commentId: comment._id,
                        replyId: reply._id,
                    }),
                },
            });
        }
        return reply.toJSON();
    }
    async reactComment({ postId, commentId }, { react }, user) {
        const comment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId, postId },
            update: react === "0"
                ? { $pull: { likes: { userId: user._id } } }
                : [
                    {
                        $set: {
                            likes: {
                                $concatArrays: [
                                    {
                                        $filter: {
                                            input: "$likes",
                                            as: "like",
                                            cond: { $ne: ["$$like.userId", user._id] },
                                        },
                                    },
                                    [{ userId: user._id, type: react }],
                                ],
                            },
                        },
                    },
                ],
        });
        if (!comment) {
            throw new exceptions_1.NotFoundException("Fail to find matching comment");
        }
        return comment.toJSON();
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
