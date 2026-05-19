"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const user_1 = require("../user");
const post_1 = require("../post");
const comment_1 = require("../comment");
const story_1 = require("../story");
const notification_1 = require("../notification");
const query = new graphql_1.GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "Root query for Social Media API",
    fields: {
        ...user_1.userGQLSchema.registerQuery(),
        ...post_1.postGQLSchema.registerQuery(),
        ...comment_1.commentGQLSchema.registerQuery(),
        ...story_1.storyGQLSchema.registerQuery(),
        ...notification_1.notificationGQLSchema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "Root mutation for Social Media API",
    fields: {
        ...user_1.userGQLSchema.registerMutation(),
        ...post_1.postGQLSchema.registerMutation(),
        ...comment_1.commentGQLSchema.registerMutation(),
        ...story_1.storyGQLSchema.registerMutation(),
        ...notification_1.notificationGQLSchema.registerMutation(),
    },
});
exports.schema = new graphql_1.GraphQLSchema({ query, mutation });
