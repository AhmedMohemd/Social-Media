"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const mongoose_1 = require("mongoose");
const services_1 = require("../../common/services");
const repository_1 = require("../../DB/repository");
const exceptions_1 = require("../../common/exceptions");
const node_crypto_1 = require("node:crypto");
const postFunction_1 = require("./../../common/utils/postFunction");
const object_Id_1 = require("../../common/utils/object.Id");
const enums_1 = require("../../common/enums");
const realtime_1 = require("../realtime");
class PostService {
    redis;
    userRepository;
    postRepository;
    notification;
    s3;
    realTime;
    constructor() {
        this.userRepository = new repository_1.UserRepository();
        this.postRepository = new repository_1.PostRepository();
        this.redis = services_1.redisService;
        this.notification = services_1.notificationService;
        this.s3 = services_1.s3Service;
        this.realTime = realtime_1.realtimeGateway;
    }
    async vewsFeed({ page, search, size }, user) {
        return await this.postRepository.paginate({
            filter: {
                $or: (0, postFunction_1.getAvailability)(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "createdBy",
                    },
                    {
                        path: "comments",
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
                    { path: "tags" },
                ],
            },
        });
    }
    async profilePost({ page, search, size }, user) {
        const posts = await this.postRepository.paginate({
            filter: {
                createdBy: user._id,
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "comments",
                        populate: [
                            {
                                path: "createdBy",
                            },
                        ],
                    },
                    { path: "tags" },
                ],
            },
        });
        const stats = await this.profileStats(user._id.toString());
        return { posts, stats };
    }
    async userProfilePost(userId, { page, search, size }, currentUser) {
        const targetUser = await this.userRepository.findOne({
            filter: { _id: userId },
            projection: "firstName lastName profilePicture profileCoverPictures slug friends",
        });
        if (!targetUser)
            throw new exceptions_1.NotFoundException("User not found");
        const isFriend = targetUser.friends?.some((f) => f.toString() === currentUser._id.toString());
        const visibilityFilter = isFriend
            ? { $in: [0, 1] }
            : { $in: [0] };
        const posts = await this.postRepository.paginate({
            filter: {
                createdBy: (0, object_Id_1.toObjectId)(userId),
                availability: visibilityFilter,
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "createdBy",
                        select: "firstName lastName profilePicture slug",
                    },
                    { path: "tags" },
                ],
            },
        });
        const stats = await this.profileStats(userId);
        return {
            posts,
            stats,
            user: {
                _id: targetUser._id,
                name: `${targetUser.firstName} ${targetUser.lastName}`,
                profilePicture: targetUser.profilePicture,
                profileCoverPictures: targetUser.profileCoverPictures,
                slug: targetUser.slug,
                isFriend,
                friendsCount: targetUser.friends?.length || 0,
            },
        };
    }
    async taggedPosts({ page, search, size }, user) {
        return await this.postRepository.paginate({
            filter: {
                tags: { $in: [user._id] },
                $or: (0, postFunction_1.getAvailability)(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "createdBy",
                    },
                    { path: "tags" },
                ],
            },
        });
    }
    async profileDashboard(user) {
        const userId = user._id.toString();
        const [myPostsCount, taggedCount, totalLikes, totalComments, friendsCount] = await Promise.all([
            this.postRepository
                .find({
                filter: { createdBy: userId },
            })
                .then((p) => p.length),
            this.postRepository
                .find({
                filter: { tags: { $in: [userId] } },
            })
                .then((p) => p.length),
            this.postRepository
                .find({ filter: { createdBy: userId } })
                .then((posts) => posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)),
            this.postRepository
                .find({
                filter: { createdBy: userId },
                options: {
                    populate: [{ path: "comments" }],
                },
            })
                .then((posts) => posts.reduce((acc, post) => {
                const comments = Array.isArray(post.comments)
                    ? post.comments
                    : [];
                return acc + comments.length;
            }, 0)),
            Promise.resolve(user.friends?.length || 0),
        ]);
        return {
            myPostsCount,
            taggedCount,
            totalLikes,
            totalComments,
            friendsCount,
            profileCompleteness: this.calcProfileCompleteness(user),
        };
    }
    async profileStats(userId) {
        const posts = await this.postRepository.find({
            filter: { createdBy: (0, object_Id_1.toObjectId)(userId) },
        });
        const totalLikes = posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
        return {
            postsCount: posts.length,
            totalLikes,
        };
    }
    calcProfileCompleteness(user) {
        const fields = [
            user.firstName,
            user.lastName,
            user.profilePicture,
            user.phone,
            user.DOB,
            user.profileCoverPictures?.length > 0,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }
    async softDeletePost(postId, user) {
        const filter = user.role === enums_1.RoleEnum.ADMIN
            ? { _id: postId }
            : { _id: postId, createdBy: user._id };
        const post = await this.postRepository.findOneAndUpdate({
            filter,
            update: { deletedAt: new Date() },
        });
        if (!post)
            throw new exceptions_1.NotFoundException("Post not found");
        return { message: "Post deleted successfully" };
    }
    async restorePost(postId, user) {
        const filter = user.role === enums_1.RoleEnum.ADMIN
            ? { _id: postId, paranoid: false }
            : { _id: postId, createdBy: user._id, paranoid: false };
        const post = await this.postRepository.findOneAndUpdate({
            filter,
            update: { restoredAt: new Date() },
        });
        if (!post)
            throw new exceptions_1.NotFoundException("Post not found or not deleted");
        return { message: "Post restored successfully" };
    }
    async hardDeletePost(postId, user) {
        const post = await this.postRepository.findOne({
            filter: { _id: postId, paranoid: false },
        });
        if (!post)
            throw new exceptions_1.NotFoundException("Post not found");
        if (user.role !== enums_1.RoleEnum.ADMIN &&
            post.createdBy.toString() !== user._id.toString()) {
            throw new exceptions_1.ForbiddenException("Not authorized");
        }
        await this.postRepository.findOneAndDelete({
            filter: { _id: postId, force: true },
        });
        if (post.folderId) {
            await this.s3.deleteFolderByPrefix({ prefix: `Post/${post.folderId}` });
        }
        return { message: "Post permanently deleted" };
    }
    async postList({ page, search, size }, user) {
        const posts = await this.postRepository.paginate({
            filter: {
                $or: (0, postFunction_1.getAvailability)(user),
                ...(search ? { content: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [
                    {
                        path: "comments",
                        populate: [{ path: "reply", populate: [{ path: "reply" }] }],
                    },
                ],
            },
        });
        return posts;
    }
    async createPost({ availability, content, files = [], tags }, user) {
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (mentionedAccounts.length != tags.length) {
                throw new exceptions_1.NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => FCM_Tokens.push(token));
            }
        }
        const folderId = (0, node_crypto_1.randomUUID)();
        let attachments = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files,
                path: `Post/${folderId}`,
            });
        }
        const post = await this.postRepository.createOne({
            data: {
                createdBy: user._id,
                content: content,
                attachments,
                folderId,
                availability,
                tags: mentions,
            },
        });
        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new exceptions_1.BadRequestException("Fail");
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in his post`,
                        postId: post._id,
                    }),
                },
            });
        }
        return post.toJSON();
    }
    async updatePost({ postId }, { availability, content, files = [], tags = [], removeFiles = [], removeTags = [], }, user) {
        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id },
        });
        if (!post) {
            throw new exceptions_1.NotFoundException("Fail to find matching post");
        }
        console.log({ post });
        if (!post.content &&
            !content &&
            !files?.length &&
            post.attachments?.length == removeFiles.length) {
            throw new exceptions_1.BadRequestException("We cannot leave empty post");
        }
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (mentionedAccounts.length != tags.length) {
                throw new exceptions_1.NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push((0, object_Id_1.toObjectId)(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => FCM_Tokens.push(token));
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
        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                createdBy: user._id,
            },
            update: [
                {
                    $set: {
                        content: content || post.content,
                        availability: Number(availability || post.availability),
                        updatedBy: user._id,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: ["$attachments", removeFiles],
                                },
                                attachments,
                            ],
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map((ele) => {
                                            return (0, object_Id_1.toObjectId)(ele);
                                        }),
                                    ],
                                },
                                mentions,
                            ],
                        },
                    },
                },
            ],
        });
        if (!updatePost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map((ele) => {
                        return { Key: ele };
                    }),
                });
            }
            throw new exceptions_1.BadRequestException("Fail");
        }
        if (removeFiles.length) {
            await this.s3.deleteAssets({
                Keys: removeFiles.map((ele) => {
                    return { Key: ele };
                }),
            });
        }
        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in his post`,
                        postId: post._id,
                    }),
                },
            });
        }
        return updatePost.toJSON();
    }
    async reactPost({ postId }, { react }, user) {
        const post = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, postFunction_1.getAvailability)(user),
            },
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
        if (!post) {
            throw new exceptions_1.NotFoundException("Fail to find matching post");
        }
        const owner = post.createdBy;
        const socketIds = await this.redis.getSockets(owner._id);
        if (socketIds.length && Number(react) || 0 > 0) {
            this.realTime.getIo().to(socketIds).emit("likePost", { postId, userId: user._id, react });
        }
        return post.toJSON();
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
