"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactStory = exports.StoryReactGQLEnum = exports.createStory = exports.storyParams = void 0;
const graphql_1 = require("graphql");
exports.storyParams = {
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
exports.createStory = {
    content: { type: graphql_1.GraphQLString },
    backgroundColor: { type: graphql_1.GraphQLString },
    textColor: { type: graphql_1.GraphQLString },
};
exports.StoryReactGQLEnum = new graphql_1.GraphQLEnumType({
    name: "StoryReactEnum",
    values: {
        LOVE: { value: "love" },
        REMOVE: { value: "0" },
    },
});
exports.reactStory = {
    storyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    react: { type: new graphql_1.GraphQLNonNull(exports.StoryReactGQLEnum) },
};
