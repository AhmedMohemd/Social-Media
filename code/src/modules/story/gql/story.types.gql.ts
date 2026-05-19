import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";
export const StoryViewType = new GraphQLObjectType({
    name: "StoryViewType",
    fields: {
        userId: { type: OneUserType },
        viewedAt: { type: GraphQLString },
    },
});
export const StoryReactionType = new GraphQLObjectType({
    name: "StoryReactionType",
    fields: {
        userId: { type: OneUserType },
        type: { type: GraphQLString },
    },
});
export const OneStoryType = new GraphQLObjectType({
    name: "OneStoryType",
    fields: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        folderId: { type: GraphQLString },
        content: { type: GraphQLString },
        attachment: { type: GraphQLString },
        backgroundColor: { type: GraphQLString },
        textColor: { type: GraphQLString },
        views: { type: new GraphQLList(StoryViewType) },
        reactions: { type: new GraphQLList(StoryReactionType) },
        createdBy: { type: OneUserType },
        expiresAt: { type: GraphQLString },
        isExpired: { type: GraphQLBoolean },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
    },
});
export const StoryFeedGroupType = new GraphQLObjectType({
    name: "StoryFeedGroupType",
    fields: {
        user: { type: OneUserType },
        stories: { type: new GraphQLList(OneStoryType) },
    },
});
export const storyFeed = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "StoryFeedResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: { type: new GraphQLList(StoryFeedGroupType) },
        },
    }),
);
export const myStories = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "MyStoriesResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: { type: new GraphQLList(OneStoryType) },
        },
    }),
);
export const storyMutationResponse = new GraphQLObjectType({
    name: "StoryMutationResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneStoryType },
    },
});
export const storyViewersResponse = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "StoryViewersResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLObjectType({
                    name: "StoryViewersData",
                    fields: {
                        viewsCount: { type: GraphQLInt },
                        views: { type: new GraphQLList(StoryViewType) },
                    },
                }),
            },
        },
    }),
);
export const deleteResponse = new GraphQLObjectType({
    name: "StoryDeleteResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
    },
});