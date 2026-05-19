"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyResolver = exports.StoryResolver = void 0;
const story_service_1 = require("../story.service");
const middleware_1 = require("../../../middleware");
const story_validation_1 = require("../story.validation");
class StoryResolver {
    storyService;
    constructor() {
        this.storyService = story_service_1.storyService;
    }
    storyFeed = async (parent, args, { user }) => {
        const data = await this.storyService.getStoriesFeed(user);
        return { message: "Done", data };
    };
    myStories = async (parent, args, { user }) => {
        const data = await this.storyService.getMyStories(user);
        return { message: "Done", data };
    };
    storyViewers = async (parent, { storyId }, { user }) => {
        await (0, middleware_1.GQLValidation)(story_validation_1.storyParamsGQL, { storyId });
        const data = await this.storyService.storyViewers(storyId, user);
        return { message: "Done", data };
    };
    createStory = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(story_validation_1.createStoryGQL, args);
        const data = await this.storyService.createStory(args, user);
        return { message: "Story created", data };
    };
    viewStory = async (parent, { storyId }, { user }) => {
        await (0, middleware_1.GQLValidation)(story_validation_1.storyParamsGQL, { storyId });
        const data = await this.storyService.viewStory(storyId, user);
        return { message: "Done", data };
    };
    reactStory = async (parent, { storyId, react }, { user }) => {
        await (0, middleware_1.GQLValidation)(story_validation_1.reactStoryGQL, { storyId, react });
        const data = await this.storyService.reactStory(storyId, react, user);
        return { message: "Done", data };
    };
    deleteStory = async (parent, { storyId }, { user }) => {
        await (0, middleware_1.GQLValidation)(story_validation_1.storyParamsGQL, { storyId });
        return (await this.storyService.deleteStory(storyId, user));
    };
}
exports.StoryResolver = StoryResolver;
exports.storyResolver = new StoryResolver();
