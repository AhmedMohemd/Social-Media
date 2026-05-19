"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactOnPost = exports.postList = exports.ReactGQLEnumType = void 0;
const graphql_1 = require("graphql");
exports.ReactGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ReactEnum",
    values: {
        LIKE: { value: "like" },
        LOVE: { value: "love" },
        HAHA: { value: "haha" },
        WOW: { value: "wow" },
        SAD: { value: "sad" },
        ANGRY: { value: "angry" },
        REMOVE: { value: "0" },
    },
});
exports.postList = {
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString },
};
exports.reactOnPost = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    react: { type: new graphql_1.GraphQLNonNull(exports.ReactGQLEnumType) },
};
