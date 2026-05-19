import { HydratedDocument, Types } from "mongoose";
import {
  CreatePostBodyDto,
  ReactPostParamsDto,
  ReactPostQueryDto,
  UpdatePostBodyDto,
  UpdatePostParamsDto,
} from "./post.dto";
import { IPaginate, IPost, IUser } from "../../common/interfaces";
import {
  notificationService,
  NotificationService,
  redisService,
  RedisService,
  s3Service,
  S3Service,
} from "../../common/services";
import { PostRepository, UserRepository } from "../../DB/repository";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { getAvailability } from "./../../common/utils/postFunction";
import { PaginateDto } from "../../common/validation/general.validation";
import { toObjectId } from "../../common/utils/object.Id";
import { RoleEnum } from "../../common/enums";
import { realtimeGateway, RealtimeGateway } from "../realtime";

export class PostService {
  // private populate: PopulateOptions[] = [
  //   { path: "likes" },
  //   { path: "createdBy" },
  //   { path: "tags" },
  //   { path: "updatedBy" },
  //   { path: "comments", populate: [{ path: "reply", populate: [{ path: "reply", }] }] }
  // ]
  private readonly redis: RedisService;
  private readonly userRepository: UserRepository;
  private readonly postRepository: PostRepository;
  private readonly notification: NotificationService;
  private readonly s3: S3Service;
  private realTime: RealtimeGateway;

  constructor() {
    this.userRepository = new UserRepository();
    this.postRepository = new PostRepository();
    this.redis = redisService;
    this.notification = notificationService;
    this.s3 = s3Service;
    this.realTime = realtimeGateway;
  }
  async vewsFeed(
    { page, search, size }: PaginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPaginate<IPost>> {
    return await this.postRepository.paginate({
      filter: {
        $or: getAvailability(user),
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
  async profilePost(
    { page, search, size }: PaginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<{ posts: IPaginate<IPost>; stats: object }> {
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
  async userProfilePost(
    userId: string,
    { page, search, size }: PaginateDto,
    currentUser: HydratedDocument<IUser>,
  ): Promise<{ posts: IPaginate<IPost>; stats: object; user: object }> {
    const targetUser = await this.userRepository.findOne({
      filter: { _id: userId },
      projection:
        "firstName lastName profilePicture profileCoverPictures slug friends",
    });
    if (!targetUser) throw new NotFoundException("User not found");
    const isFriend = (targetUser.friends as Types.ObjectId[])?.some(
      (f) => f.toString() === currentUser._id.toString(),
    );
    const visibilityFilter = isFriend
      ? { $in: [0, 1] }
      : { $in: [0] };
    const posts = await this.postRepository.paginate({
      filter: {
        createdBy: toObjectId(userId),
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
        friendsCount: (targetUser.friends as [])?.length || 0,
      },
    };
  }
  async taggedPosts(
    { page, search, size }: PaginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPaginate<IPost>> {
    return await this.postRepository.paginate({
      filter: {
        tags: { $in: [user._id] },
        $or: getAvailability(user),
        ...(search ? { content: { $regex: search, $options: "i" } } : {}),
      },
      page,
      size,
      options: {
        populate: [
          {
            path: "createdBy",
          },
          { path: "tags"},
        ],
      },
    });
  }
  async profileDashboard(user: HydratedDocument<IUser>): Promise<object> {
    const userId = user._id.toString();

    const [myPostsCount, taggedCount, totalLikes, totalComments, friendsCount] =
      await Promise.all([
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
          .then((posts) =>
            posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0),
          ),
        this.postRepository
          .find({
            filter: { createdBy: userId },
            options: {
              populate: [{ path: "comments" }],
            },
          })
          .then((posts) =>
            posts.reduce((acc, post: any) => {
              const comments = Array.isArray(post.comments)
                ? post.comments
                : [];
              return acc + comments.length;
            }, 0),
          ),
        Promise.resolve((user.friends as [])?.length || 0),
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
  private async profileStats(userId: string): Promise<object> {
    const posts = await this.postRepository.find({
      filter: { createdBy: toObjectId(userId) },
    });
    const totalLikes = posts.reduce(
      (acc, post) => acc + (post.likes?.length || 0),
      0,
    );
    return {
      postsCount: posts.length,
      totalLikes,
    };
  }
  private calcProfileCompleteness(user: HydratedDocument<IUser>): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.profilePicture,
      user.phone,
      user.DOB,
      (user.profileCoverPictures as string[])?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }
  async softDeletePost(
    postId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    const filter =
      user.role === RoleEnum.ADMIN
        ? { _id: postId }
        : { _id: postId, createdBy: user._id };
    const post = await this.postRepository.findOneAndUpdate({
      filter,
      update: { deletedAt: new Date() },
    });
    if (!post) throw new NotFoundException("Post not found");
    return { message: "Post deleted successfully" };
  }
  async restorePost(
    postId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    const filter =
      user.role === RoleEnum.ADMIN
        ? { _id: postId, paranoid: false }
        : { _id: postId, createdBy: user._id, paranoid: false };
    const post = await this.postRepository.findOneAndUpdate({
      filter,
      update: { restoredAt: new Date() },
    });
    if (!post) throw new NotFoundException("Post not found or not deleted");
    return { message: "Post restored successfully" };
  }
  async hardDeletePost(
    postId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    const post = await this.postRepository.findOne({
      filter: { _id: postId, paranoid: false },
    });
    if (!post) throw new NotFoundException("Post not found");
    if (
      user.role !== RoleEnum.ADMIN &&
      post.createdBy.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException("Not authorized");
    }
    await this.postRepository.findOneAndDelete({
      filter: { _id: postId, force: true },
    });
    if (post.folderId) {
      await this.s3.deleteFolderByPrefix({ prefix: `Post/${post.folderId}` });
    }
    return { message: "Post permanently deleted" };
  }
  // async postList({ page, search, size }: PaginateDto, user: HydratedDocument<IUser>): Promise<IPaginate<IPost>> {
  //   const posts = await this.postRepository.paginate({
  //     filter: {
  //       $or: getAvailability(user),
  //       ...(search ? { content: { $regex: search, $options: "i" } } : {})
  //     },
  //     page, size,
  //     options: {
  //       populate: this.populate
  //     }
  //   })
  //   return posts
  // }
  async postList(
    { page, search, size }: PaginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPaginate<IPost>> {
    const posts = await this.postRepository.paginate({
      filter: {
        $or: getAvailability(user),
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
  async createPost(
    { availability, content, files = [], tags }: CreatePostBodyDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];
    if (tags?.length) {
      const mentionedAccounts = await this.userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });
      if (mentionedAccounts.length != tags.length) {
        throw new NotFoundException(
          "Fail to find some or all mentioned accounts",
        );
      }
      for (const tag of tags) {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        ((await this.redis.getFCMs(tag)) || []).map((token) =>
          FCM_Tokens.push(token),
        );
      }
    }
    const folderId = randomUUID();
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
        path: `Post/${folderId}`,
      });
    }
    const post = await this.postRepository.createOne({
      data: {
        createdBy: user._id,
        content: content as string,
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
      throw new BadRequestException("Fail");
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
  async updatePost(
    { postId }: UpdatePostParamsDto,
    {
      availability,
      content,
      files = [],
      tags = [],
      removeFiles = [],
      removeTags = [],
    }: UpdatePostBodyDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const post = await this.postRepository.findOne({
      filter: { _id: postId, createdBy: user._id },
    });
    if (!post) {
      throw new NotFoundException("Fail to find matching post");
    }
    console.log({ post });
    if (
      !post.content &&
      !content &&
      !files?.length &&
      post.attachments?.length == removeFiles.length
    ) {
      throw new BadRequestException("We cannot leave empty post");
    }
    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];
    if (tags?.length) {
      const mentionedAccounts = await this.userRepository.find({
        filter: {
          _id: { $in: tags },
        },
      });
      if (mentionedAccounts.length != tags.length) {
        throw new NotFoundException(
          "Fail to find some or all mentioned accounts",
        );
      }
      for (const tag of tags) {
        mentions.push(toObjectId(tag));
        ((await this.redis.getFCMs(tag)) || []).map((token) =>
          FCM_Tokens.push(token),
        );
      }
    }
    const folderId = post.folderId;
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
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
                      return toObjectId(ele);
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
      throw new BadRequestException("Fail");
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
  async reactPost(
    { postId }: ReactPostParamsDto,
    { react }: ReactPostQueryDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const post = await this.postRepository.findOneAndUpdate({
      filter: {
        _id: postId,
        $or: getAvailability(user),
      },
      update:
        react === "0"
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
      throw new NotFoundException("Fail to find matching post");
    }
    const owner = post.createdBy as HydratedDocument<IUser>
    const socketIds = await this.redis.getSockets(owner._id)
    if (socketIds.length && Number(react) || 0 > 0) {
      this.realTime.getIo().to(socketIds).emit("likePost", { postId, userId: user._id, react })
    }
    return post.toJSON();
  }
  // async reactPost({ postId }: ReactPostParamsDto, { react }: ReactPostQueryDto, user: HydratedDocument<IUser>): Promise<IPost> {
  //   const post = await this.postRepository.findOneAndUpdate({
  //     filter: {
  //       _id: postId,
  //       $or: getAvailability(user),
  //     },
  //     update: {
  //       ...(Number(react) > 0 ? { $addToSet: { likes: user._id } } : { $pull: { likes: user._id } })
  //     },
  //     populate: this.populate
  //   })
  //   if (!post) {
  //     throw new NotFoundException("Fail to find matching post")
  //   }
  //   return post.toJSON()
  // }
}
export const postService = new PostService();