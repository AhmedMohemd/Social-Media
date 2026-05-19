"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactOnPost = exports.postList = exports.OnePostType = exports.AvailabilityGQLEnumType = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const enums_1 = require("../../../common/enums");
exports.AvailabilityGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "AvailabilityEnum",
    values: {
        Public: { value: enums_1.AvailabilityEnum.PUBLIC },
        Friends: { value: enums_1.AvailabilityEnum.FRIENDS },
        Only_me: { value: enums_1.AvailabilityEnum.ONLY_ME },
    },
});
exports.OnePostType = new graphql_1.GraphQLObjectType({
    name: "OnePostType",
    fields: {
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        folderId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        likes: { type: new graphql_1.GraphQLList(user_types_gql_1.ReactType) },
        tags: { type: new graphql_1.GraphQLList(user_types_gql_1.OneUserType) },
        availability: { type: exports.AvailabilityGQLEnumType },
        createdBy: { type: user_types_gql_1.OneUserType },
        updatedBy: { type: user_types_gql_1.OneUserType },
        createdAt: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    },
});
exports.postList = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "PostListResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "PostPaginationResponse",
                fields: {
                    docs: { type: new graphql_1.GraphQLList(exports.OnePostType) },
                    currentPage: { type: graphql_1.GraphQLInt },
                    pages: { type: graphql_1.GraphQLInt },
                    size: { type: graphql_1.GraphQLInt },
                },
            }),
        },
    },
}));
exports.reactOnPost = new graphql_1.GraphQLObjectType({
    name: "ReactOnPostResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OnePostType },
    },
});
