import { storyService, StoryService } from "../story.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLValidation } from "../../../middleware";
import {
    createStoryGQL,
    reactStoryGQL,
    storyParamsGQL,
} from "../story.validation";
import { IStory } from "../../../common/interfaces";
export class StoryResolver {
    private readonly storyService: StoryService;
    constructor() {
        this.storyService = storyService;
    }
    storyFeed = async (
        parent: unknown,
        args: unknown,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: object[] }> => {
        const data = await this.storyService.getStoriesFeed(user);
        return { message: "Done", data };
    };
    myStories = async (
        parent: unknown,
        args: unknown,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: object[] }> => {
        const data = await this.storyService.getMyStories(user);
        return { message: "Done", data };
    };
    storyViewers = async (
        parent: unknown,
        { storyId }: { storyId: string },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: object }> => {
        await GQLValidation(storyParamsGQL, { storyId });
        const data = await this.storyService.storyViewers(storyId, user);
        return { message: "Done", data };
    };
    createStory = async (
        parent: unknown,
        args: {
            content?: string;
            backgroundColor?: string;
            textColor?: string;
        },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IStory }> => {
        await GQLValidation(createStoryGQL, args);
        const data = await this.storyService.createStory(args, user);
        return { message: "Story created", data };
    };
    viewStory = async (
        parent: unknown,
        { storyId }: { storyId: string },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IStory }> => {
        await GQLValidation(storyParamsGQL, { storyId });
        const data = await this.storyService.viewStory(storyId, user);
        return { message: "Done", data };
    };
    reactStory = async (
        parent: unknown,
        { storyId, react }: { storyId: string; react: string },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IStory }> => {
        await GQLValidation(reactStoryGQL, { storyId, react });
        const data = await this.storyService.reactStory(storyId, react, user);
        return { message: "Done", data };
    };
    deleteStory = async (
        parent: unknown,
        { storyId }: { storyId: string },
        { user }: IAuthUser,
    ): Promise<{ message: string }> => {
        await GQLValidation(storyParamsGQL, { storyId });
        return (await this.storyService.deleteStory(storyId, user)) as {
            message: string;
        };
    };
}
export const storyResolver = new StoryResolver();