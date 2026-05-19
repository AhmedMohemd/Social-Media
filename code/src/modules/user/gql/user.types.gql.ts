import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../common/enums";
export const GenderGQLEnumType = new GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: GenderEnum.MALE },
        Female: { value: GenderEnum.FEMALE },
    },
});
export const ProviderGQLEnumType = new GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Google: { value: ProviderEnum.GOOGLE },
        System: { value: ProviderEnum.SYSTEM },
    },
});
export const RoleGQLEnumType = new GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        Admin: { value: RoleEnum.ADMIN },
        User: { value: RoleEnum.USER },
    },
});
export const OneUserType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        username: { type: GraphQLString },
        slug: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        profilePicture: { type: GraphQLString },
        profileCoverPictures: { type: new GraphQLList(GraphQLString) },
        friends: { type: new GraphQLList(OneUserType) },
        gender: { type: GenderGQLEnumType },
        role: { type: RoleGQLEnumType },
        provider: { type: ProviderGQLEnumType },
        changeCredentialsTime: { type: GraphQLString },
        DOB: { type: GraphQLString },
        confirmEmail: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
    }),
});
export const ReactType = new GraphQLObjectType({
    name: "ReactType",
    fields: {
        userId: { type: OneUserType },
        type: { type: GraphQLString },
    },
});
export const ProfileStatsType = new GraphQLObjectType({
    name: "ProfileStatsType",
    fields: {
        postsCount: { type: GraphQLInt },
        totalLikes: { type: GraphQLInt },
        friendsCount: { type: GraphQLInt },
    },
});
export const profile = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "ProfileResponse",
        description: "",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLObjectType({
                    name: "ProfileData",
                    fields: {
                        user: { type: OneUserType },
                        stats: { type: ProfileStatsType },
                    },
                }),
            },
        },
    }),
);
export const updateProfileResponse = new GraphQLObjectType({
    name: "UpdateProfileResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneUserType },
    },
});