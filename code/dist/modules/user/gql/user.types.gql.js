"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileResponse = exports.profile = exports.ProfileStatsType = exports.ReactType = exports.OneUserType = exports.RoleGQLEnumType = exports.ProviderGQLEnumType = exports.GenderGQLEnumType = void 0;
const graphql_1 = require("graphql");
const enums_1 = require("../../../common/enums");
exports.GenderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: enums_1.GenderEnum.MALE },
        Female: { value: enums_1.GenderEnum.FEMALE },
    },
});
exports.ProviderGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Google: { value: enums_1.ProviderEnum.GOOGLE },
        System: { value: enums_1.ProviderEnum.SYSTEM },
    },
});
exports.RoleGQLEnumType = new graphql_1.GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        Admin: { value: enums_1.RoleEnum.ADMIN },
        User: { value: enums_1.RoleEnum.USER },
    },
});
exports.OneUserType = new graphql_1.GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        username: { type: graphql_1.GraphQLString },
        slug: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        phone: { type: graphql_1.GraphQLString },
        profilePicture: { type: graphql_1.GraphQLString },
        profileCoverPictures: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        friends: { type: new graphql_1.GraphQLList(exports.OneUserType) },
        gender: { type: exports.GenderGQLEnumType },
        role: { type: exports.RoleGQLEnumType },
        provider: { type: exports.ProviderGQLEnumType },
        changeCredentialsTime: { type: graphql_1.GraphQLString },
        DOB: { type: graphql_1.GraphQLString },
        confirmEmail: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
    }),
});
exports.ReactType = new graphql_1.GraphQLObjectType({
    name: "ReactType",
    fields: {
        userId: { type: exports.OneUserType },
        type: { type: graphql_1.GraphQLString },
    },
});
exports.ProfileStatsType = new graphql_1.GraphQLObjectType({
    name: "ProfileStatsType",
    fields: {
        postsCount: { type: graphql_1.GraphQLInt },
        totalLikes: { type: graphql_1.GraphQLInt },
        friendsCount: { type: graphql_1.GraphQLInt },
    },
});
exports.profile = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "ProfileResponse",
    description: "",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "ProfileData",
                fields: {
                    user: { type: exports.OneUserType },
                    stats: { type: exports.ProfileStatsType },
                },
            }),
        },
    },
}));
exports.updateProfileResponse = new graphql_1.GraphQLObjectType({
    name: "UpdateProfileResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneUserType },
    },
});
