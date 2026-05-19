"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentParams = exports.reactOnComment = exports.replyOnComment = exports.createComment = exports.commentList = void 0;
const graphql_1 = require("graphql");
exports.commentList = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
};
exports.createComment = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    content: { type: graphql_1.GraphQLString },
    tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
};
exports.replyOnComment = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    commentId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    content: { type: graphql_1.GraphQLString },
    tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
};
exports.reactOnComment = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    commentId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    react: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.commentParams = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    commentId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
