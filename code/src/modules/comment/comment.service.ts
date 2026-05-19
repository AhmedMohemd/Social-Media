import { HydratedDocument } from "mongoose";
import {
  notificationService,
  NotificationService,
  redisService,
  RedisService,
  s3Service,
  S3Service,
} from "../../common/services";
import {
  CommentRepository,
  PostRepository,
  UserRepository,
} from "../../DB/repository";
import {
  CreateCommentBodyDto,
  CreateCommentParamsDto,
  CreateReplyOnCommentParamsDto,
} from "./comment.dto";
import { IComment, IPaginate, IPost, IUser } from "../../common/interfaces";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { getAvailability } from "../../common/utils/postFunction";
import { PaginateDto } from "../../common/validation";
export class CommentService {
  private readonly redis: RedisService;
  private readonly userRepository: UserRepository;
  private readonly commentRepository: CommentRepository;
  private readonly postRepository: PostRepository;
  private readonly notification: NotificationService;
  private readonly s3: S3Service;
  constructor() {
    this.userRepository = new UserRepository();
    this.postRepository = new PostRepository();
    this.commentRepository = new CommentRepository();
    this.redis = redisService;
    this.s3 = s3Service;
    this.notification = notificationService;
  }
  async listComments(
    postId: string,
    { page, size }: Pick<PaginateDto, "page" | "size">,
    user: HydratedDocument<IUser>,
  ): Promise<IPaginate<IComment>> {
    const post = await this.postRepository.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(user),
      },
    });
    if (!post) {
      throw new NotFoundException("Fail to find matching post");
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
  async createComment(
    { postId }: CreateCommentParamsDto,
    { content, files = [], tags }: CreateCommentBodyDto,
    user: HydratedDocument<IUser>,
  ): Promise<IComment> {
    const post = await this.postRepository.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(user),
      },
    });
    if (!post) {
      throw new NotFoundException("Fail to find matching post");
    }
    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];
    if (tags?.length) {
      const mentionedAccounts = await this.userRepository.find({
        filter: { _id: { $in: tags } },
      });
      if (mentionedAccounts.length !== tags.length) {
        throw new NotFoundException(
          "Fail to find some or all mentioned accounts",
        );
      }
      for (const tag of tags) {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        ((await this.redis.getFCMs(tag)) || []).forEach((token) =>
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
    const comment = await this.commentRepository.createOne({
      data: {
        createdBy: user._id,
        content: content as string,
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
      throw new BadRequestException("Fail to create comment");
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
  async replyOnComment(
    { postId, commentId }: CreateReplyOnCommentParamsDto,
    { content, files = [], tags }: CreateCommentBodyDto,
    user: HydratedDocument<IUser>,
  ): Promise<IComment> {
    const comment = await this.commentRepository.findOne({
      filter: { _id: commentId, postId },
      options: {
        populate: [
          {
            path: "postId",
            match: { $or: getAvailability(user) },
          },
        ],
      },
    });

    if (!comment?.postId) {
      throw new NotFoundException("Fail to find matching comment");
    }
    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];
    if (tags?.length) {
      const mentionedAccounts = await this.userRepository.find({
        filter: { _id: { $in: tags } },
      });
      if (mentionedAccounts.length !== tags.length) {
        throw new NotFoundException(
          "Fail to find some or all mentioned accounts",
        );
      }
      for (const tag of tags) {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        ((await this.redis.getFCMs(tag)) || []).forEach((token) =>
          FCM_Tokens.push(token),
        );
      }
    }
    const post = comment.postId as HydratedDocument<IPost>;
    const folderId = post.folderId;
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadAssets({
        files: files as Express.Multer.File[],
        path: `Post/${folderId}`,
      });
    }
    const reply = await this.commentRepository.createOne({
      data: {
        createdBy: user._id,
        content: content as string,
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
      throw new BadRequestException("Fail to create reply");
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
  async reactComment(
    { postId, commentId }: { postId: string; commentId: string },
    { react }: { react: string },
    user: HydratedDocument<IUser>,
  ): Promise<IComment> {
    const comment = await this.commentRepository.findOneAndUpdate({
      filter: { _id: commentId, postId },
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
    if (!comment) {
      throw new NotFoundException("Fail to find matching comment");
    }
    return comment.toJSON();
  }
}
export const commentService = new CommentService();