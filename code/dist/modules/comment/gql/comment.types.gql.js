"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactOnCommentResponse = exports.commentMutationResponse = exports.commentList = exports.OneCommentType = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
exports.OneCommentType = new graphql_1.GraphQLObjectType({
    name: "OneCommentType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        likes: { type: new graphql_1.GraphQLList(user_types_gql_1.ReactType) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType) },
        postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        commentId: { type: graphql_1.GraphQLID },
        createdBy: { type: user_types_gql_1.OneUserType },
        updatedBy: { type: user_types_gql_1.OneUserType },
        reply: { type: new graphql_1.GraphQLList(exports.OneCommentType) },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
    }),
});
exports.commentList = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "CommentListResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "CommentPaginationResponse",
                fields: {
                    docs: { type: new graphql_1.GraphQLList(exports.OneCommentType) },
                    currentPage: { type: graphql_1.GraphQLInt },
                    pages: { type: graphql_1.GraphQLInt },
                    size: { type: graphql_1.GraphQLInt },
                },
            }),
        },
    },
}));
exports.commentMutationResponse = new graphql_1.GraphQLObjectType({
    name: "CommentMutationResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneCommentType },
    },
});
exports.reactOnCommentResponse = new graphql_1.GraphQLObjectType({
    name: "ReactOnCommentResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneCommentType },
    },
});
