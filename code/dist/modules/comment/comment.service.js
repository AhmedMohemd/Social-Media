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
    async updateComment({ postId, commentId }, { content, files = [] }, user) {
        const comment = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                postId,
                createdBy: user._id,
            },
        });
        if (!comment) {
            throw new exceptions_1.NotFoundException("Comment not found or not authorized");
        }
        let newAttachments = [];
        if (files?.length) {
            const post = await this.postRepository.findOne({ filter: { _id: postId } });
            if (!post)
                throw new exceptions_1.NotFoundException("Post not found");
            newAttachments = await this.s3.uploadAssets({
                files,
                path: `Post/${post.folderId}`,
            });
        }
        const updated = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId, createdBy: user._id },
            update: {
                ...(content ? { content } : {}),
                ...(newAttachments.length ? { $push: { attachments: { $each: newAttachments } } } : {}),
                updatedBy: user._id,
            },
        });
        if (!updated) {
            if (newAttachments.length) {
                await this.s3.deleteAssets({ Keys: newAttachments.map((k) => ({ Key: k })) });
            }
            throw new exceptions_1.BadRequestException("Failed to update comment");
        }
        return updated.toJSON();
    }
    async deleteComment({ postId, commentId }, user) {
        const ownerFilter = user.role === 1
            ? { _id: commentId, postId }
            : { _id: commentId, postId, createdBy: user._id };
        const comment = await this.commentRepository.findOne({ filter: ownerFilter });
        if (!comment) {
            throw new exceptions_1.NotFoundException("Comment not found or not authorized");
        }
        const replies = await this.commentRepository.find({
            filter: { commentId: comment._id },
        });
        for (const reply of replies) {
            await this.commentRepository.findOneAndUpdate({
                filter: { _id: reply._id },
                update: { deletedAt: new Date() },
            });
            if (reply.attachments?.length) {
                await this.s3.deleteAssets({
                    Keys: reply.attachments.map((k) => ({ Key: k })),
                });
            }
        }
        await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId },
            update: { deletedAt: new Date() },
        });
        if (comment.attachments?.length) {
            await this.s3.deleteAssets({
                Keys: comment.attachments.map((k) => ({ Key: k })),
            });
        }
        return { message: "Comment deleted successfully" };
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
