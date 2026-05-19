import { HydratedDocument } from "mongoose";
import { IStory, IUser } from "../../common/interfaces";
import { StoryRepository } from "../../DB/repository";
import { s3Service, S3Service } from "../../common/services";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
export class StoryService {
  private readonly storyRepository: StoryRepository;
  private readonly s3: S3Service;
  constructor() {
    this.storyRepository = new StoryRepository();
    this.s3 = s3Service;
  }
  async createStory(
    {
      content,
      backgroundColor,
      textColor,
      file,
    }: {
      content?: string;
      backgroundColor?: string;
      textColor?: string;
      file?: Express.Multer.File;
    },
    user: HydratedDocument<IUser>,
  ): Promise<IStory> {
    if (!content && !file) {
      throw new BadRequestException("Content or attachment is required");
    }
    const folderId = randomUUID();
    let attachment: string | undefined;
    if (file) {
      const keys = await this.s3.uploadAssets({
        files: [file],
        path: `Stories/${user._id.toString()}/${folderId}`,
      });
      attachment = keys[0];
    }
    const story = await this.storyRepository.createOne({
      data: {
        folderId,
        content,
        attachment,
        backgroundColor,
        textColor,
        createdBy: user._id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    if (!story) {
      if (attachment) await this.s3.deleteAsset({ Key: attachment });
      throw new BadRequestException("Failed to create story");
    }
    return story.toJSON();
  }
  async getStoriesFeed(user: HydratedDocument<IUser>): Promise<object[]> {
    const friendIds = (user.friends as Types.ObjectId[]) || [];
    const authorIds = [user._id, ...friendIds];
    const stories = await this.storyRepository.find({
      filter: {
        createdBy: { $in: authorIds },
        expiresAt: { $gt: new Date() },
      },
      options: {
        populate: [
          {
            path: "createdBy",
          },
          {
            path: "views.userId",
          },
          {
            path: "reactions.userId",
          },
        ],
      },
    });
    const grouped: Record<string, { user: object; stories: object[] }> = {};
    for (const story of stories) {
      const storyJson = story.toJSON() as any;
      const authorId =
        storyJson.createdBy?._id?.toString() ||
        story.createdBy.toString();
      if (!grouped[authorId]) {
        grouped[authorId] = {
          user: storyJson.createdBy,
          stories: [],
        };
      }
      grouped[authorId]!.stories.push(storyJson);
    }
    return Object.values(grouped);
  }
  async getMyStories(user: HydratedDocument<IUser>): Promise<object[]> {
    const stories = await this.storyRepository.find({
      filter: { createdBy: user._id },
      options: {
        populate: [
          {
            path: "createdBy",
          },
          {
            path: "views.userId",
          },
          {
            path: "reactions.userId",
          },
        ],
      },
    });
    return stories.map((expirStory) => ({
      ...expirStory.toJSON(),
      isExpired: expirStory.expiresAt < new Date(),
    }));
  }
  async viewStory(
    storyId: string,
    user: HydratedDocument<IUser>,
  ): Promise<IStory> {
    const story = await this.storyRepository.findOneAndUpdate({
      filter: {
        _id: storyId,
        "views.userId": { $ne: user._id },
      },
      update: {
        $addToSet: { views: { userId: user._id, viewedAt: new Date() } },
      },
    });
    if (!story) {
      const existing = await this.storyRepository.findOne({
        filter: { _id: storyId },
      });
      if (!existing) throw new NotFoundException("Story not found or expired");
      return existing.toJSON();
    }
    return story.toJSON();
  }
  async reactStory(
    storyId: string,
    react: string,
    user: HydratedDocument<IUser>,
  ): Promise<IStory> {
    const story = await this.storyRepository.findOneAndUpdate({
      filter: { _id: storyId },
      update:
        react === "0"
          ? { $pull: { reactions: { userId: user._id } } }
          : [
            {
              $set: {
                reactions: {
                  $concatArrays: [
                    {
                      $filter: {
                        input: { $ifNull: ["$reactions", []] },
                        as: "r",
                        cond: { $ne: ["$$r.userId", user._id] },
                      },
                    },
                    [{ userId: user._id, type: react }],
                  ],
                },
              },
            },
          ],
    });
    if (!story) throw new NotFoundException("Story not found");
    return story.toJSON();
  }
  async deleteStory(
    storyId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    const story = await this.storyRepository.findOne({
      filter: { _id: storyId, createdBy: user._id },
    });
    if (!story) throw new NotFoundException("Story not found");
    await this.storyRepository.deleteOne({ filter: { _id: storyId } });
    if (story.attachment) {
      await this.s3.deleteAsset({ Key: story.attachment });
    }
    return { message: "Story deleted" };
  }
  async storyViewers(
    storyId: string,
    user: HydratedDocument<IUser>,
  ): Promise<object> {
    const story = await this.storyRepository.findOne({
      filter: { _id: storyId, createdBy: user._id },
      options: {
        populate: [
          {
            path: "views.userId",
          },
        ],
      },
    });

    if (!story) throw new NotFoundException("Story not found");
    return {
      viewsCount: story.views?.length || 0,
      views: story.views,
    };
  }
}
export const storyService = new StoryService();