"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyService = exports.StoryService = void 0;
const repository_1 = require("../../DB/repository");
const services_1 = require("../../common/services");
const exceptions_1 = require("../../common/exceptions");
const node_crypto_1 = require("node:crypto");
class StoryService {
    storyRepository;
    s3;
    constructor() {
        this.storyRepository = new repository_1.StoryRepository();
        this.s3 = services_1.s3Service;
    }
    async createStory({ content, backgroundColor, textColor, file, }, user) {
        if (!content && !file) {
            throw new exceptions_1.BadRequestException("Content or attachment is required");
        }
        const folderId = (0, node_crypto_1.randomUUID)();
        let attachment;
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
            if (attachment)
                await this.s3.deleteAsset({ Key: attachment });
            throw new exceptions_1.BadRequestException("Failed to create story");
        }
        return story.toJSON();
    }
    async getStoriesFeed(user) {
        const friendIds = user.friends || [];
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
        const grouped = {};
        for (const story of stories) {
            const storyJson = story.toJSON();
            const authorId = storyJson.createdBy?._id?.toString() ||
                story.createdBy.toString();
            if (!grouped[authorId]) {
                grouped[authorId] = {
                    user: storyJson.createdBy,
                    stories: [],
                };
            }
            grouped[authorId].stories.push(storyJson);
        }
        return Object.values(grouped);
    }
    async getMyStories(user) {
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
    async viewStory(storyId, user) {
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
            if (!existing)
                throw new exceptions_1.NotFoundException("Story not found or expired");
            return existing.toJSON();
        }
        return story.toJSON();
    }
    async reactStory(storyId, react, user) {
        const story = await this.storyRepository.findOneAndUpdate({
            filter: { _id: storyId },
            update: react === "0"
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
        if (!story)
            throw new exceptions_1.NotFoundException("Story not found");
        return story.toJSON();
    }
    async deleteStory(storyId, user) {
        const story = await this.storyRepository.findOne({
            filter: { _id: storyId, createdBy: user._id },
        });
        if (!story)
            throw new exceptions_1.NotFoundException("Story not found");
        await this.storyRepository.deleteOne({ filter: { _id: storyId } });
        if (story.attachment) {
            await this.s3.deleteAsset({ Key: story.attachment });
        }
        return { message: "Story deleted" };
    }
    async storyViewers(storyId, user) {
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
        if (!story)
            throw new exceptions_1.NotFoundException("Story not found");
        return {
            viewsCount: story.views?.length || 0,
            views: story.views,
        };
    }
}
exports.StoryService = StoryService;
exports.storyService = new StoryService();
