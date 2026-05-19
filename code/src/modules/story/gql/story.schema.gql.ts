import * as StoryGQLTypes from "./story.types.gql";
import * as StoryGQLArgs from "./story.args.gql";
import { storyResolver, StoryResolver } from "./story.resolver";
export class StoryGQLSchema {
    private storyResolver: StoryResolver;
    constructor() {
        this.storyResolver = storyResolver;
    }
    registerQuery() {
        return {
            storyFeed: {
                type: StoryGQLTypes.storyFeed,
                args: {},
                description: "Get stories feed grouped by friends",
                resolve: this.storyResolver.storyFeed,
            },
            myStories: {
                type: StoryGQLTypes.myStories,
                args: {},
                description: "Get my own stories (including expired ones)",
                resolve: this.storyResolver.myStories,
            },
            storyViewers: {
                type: StoryGQLTypes.storyViewersResponse,
                args: StoryGQLArgs.storyParams,
                description: "Get viewers of a story (owner only)",
                resolve: this.storyResolver.storyViewers,
            },
        };
    }
    registerMutation() {
        return {
            createStory: {
                type: StoryGQLTypes.storyMutationResponse,
                args: StoryGQLArgs.createStory,
                description:
                    "Create a text story. For media stories use REST POST /story",
                resolve: this.storyResolver.createStory,
            },
            viewStory: {
                type: StoryGQLTypes.storyMutationResponse,
                args: StoryGQLArgs.storyParams,
                description: "Mark a story as viewed",
                resolve: this.storyResolver.viewStory,
            },
            reactStory: {
                type: StoryGQLTypes.storyMutationResponse,
                args: StoryGQLArgs.reactStory,
                description: 'React to a story: "love" | "0" to remove',
                resolve: this.storyResolver.reactStory,
            },
            deleteStory: {
                type: StoryGQLTypes.deleteResponse,
                args: StoryGQLArgs.storyParams,
                description: "Delete your story",
                resolve: this.storyResolver.deleteStory,
            },
        };
    }
}
export const storyGQLSchema = new StoryGQLSchema();