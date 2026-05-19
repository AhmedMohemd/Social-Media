"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResponse = exports.storyViewersResponse = exports.storyMutationResponse = exports.myStories = exports.storyFeed = exports.StoryFeedGroupType = exports.OneStoryType = exports.StoryReactionType = exports.StoryViewType = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
exports.StoryViewType = new graphql_1.GraphQLObjectType({
    name: "StoryViewType",
    fields: {
        userId: { type: user_types_gql_1.OneUserType },
        viewedAt: { type: graphql_1.GraphQLString },
    },
});
exports.StoryReactionType = new graphql_1.GraphQLObjectType({
    name: "StoryReactionType",
    fields: {
        userId: { type: user_types_gql_1.OneUserType },
        type: { type: graphql_1.GraphQLString },
    },
});
exports.OneStoryType = new graphql_1.GraphQLObjectType({
    name: "OneStoryType",
    fields: {
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        folderId: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        attachment: { type: graphql_1.GraphQLString },
        backgroundColor: { type: graphql_1.GraphQLString },
        textColor: { type: graphql_1.GraphQLString },
        views: { type: new graphql_1.GraphQLList(exports.StoryViewType) },
        reactions: { type: new graphql_1.GraphQLList(exports.StoryReactionType) },
        createdBy: { type: user_types_gql_1.OneUserType },
        expiresAt: { type: graphql_1.GraphQLString },
        isExpired: { type: graphql_1.GraphQLBoolean },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
    },
});
exports.StoryFeedGroupType = new graphql_1.GraphQLObjectType({
    name: "StoryFeedGroupType",
    fields: {
        user: { type: user_types_gql_1.OneUserType },
        stories: { type: new graphql_1.GraphQLList(exports.OneStoryType) },
    },
});
exports.storyFeed = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "StoryFeedResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: new graphql_1.GraphQLList(exports.StoryFeedGroupType) },
    },
}));
exports.myStories = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "MyStoriesResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: new graphql_1.GraphQLList(exports.OneStoryType) },
    },
}));
exports.storyMutationResponse = new graphql_1.GraphQLObjectType({
    name: "StoryMutationResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneStoryType },
    },
});
exports.storyViewersResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "StoryViewersResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "StoryViewersData",
                fields: {
                    viewsCount: { type: graphql_1.GraphQLInt },
                    views: { type: new graphql_1.GraphQLList(exports.StoryViewType) },
                },
            }),
        },
    },
}));
exports.deleteResponse = new graphql_1.GraphQLObjectType({
    name: "StoryDeleteResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    },
});
