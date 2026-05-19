"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyGQLSchema = exports.StoryGQLSchema = void 0;
const StoryGQLTypes = __importStar(require("./story.types.gql"));
const StoryGQLArgs = __importStar(require("./story.args.gql"));
const story_resolver_1 = require("./story.resolver");
class StoryGQLSchema {
    storyResolver;
    constructor() {
        this.storyResolver = story_resolver_1.storyResolver;
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
                description: "Create a text story. For media stories use REST POST /story",
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
exports.StoryGQLSchema = StoryGQLSchema;
exports.storyGQLSchema = new StoryGQLSchema();
