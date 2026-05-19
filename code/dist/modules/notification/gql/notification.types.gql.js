"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageResponse = exports.unreadCountResponse = exports.notificationMutationResponse = exports.notificationList = exports.OneNotificationType = exports.NotificationTypeGQLEnum = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const enums_1 = require("../../../common/enums");
exports.NotificationTypeGQLEnum = new graphql_1.GraphQLEnumType({
    name: "NotificationTypeGQLEnum",
    values: {
        POST_LIKE: { value: enums_1.NotificationTypeEnum.POST_LIKE },
        POST_COMMENT: { value: enums_1.NotificationTypeEnum.POST_COMMENT },
        POST_MENTION: { value: enums_1.NotificationTypeEnum.POST_MENTION },
        COMMENT_LIKE: { value: enums_1.NotificationTypeEnum.COMMENT_LIKE },
        COMMENT_REPLY: { value: enums_1.NotificationTypeEnum.COMMENT_REPLY },
        FRIEND_REQUEST: { value: enums_1.NotificationTypeEnum.FRIEND_REQUEST },
        FRIEND_ACCEPT: { value: enums_1.NotificationTypeEnum.FRIEND_ACCEPT },
        STORY_VIEW: { value: enums_1.NotificationTypeEnum.STORY_VIEW },
        SYSTEM: { value: enums_1.NotificationTypeEnum.SYSTEM },
    },
});
exports.OneNotificationType = new graphql_1.GraphQLObjectType({
    name: "OneNotificationType",
    fields: {
        _id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        body: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        type: { type: new graphql_1.GraphQLNonNull(exports.NotificationTypeGQLEnum) },
        image: { type: graphql_1.GraphQLString },
        sendToAll: { type: graphql_1.GraphQLBoolean },
        isRead: { type: graphql_1.GraphQLBoolean },
        readAt: { type: graphql_1.GraphQLString },
        createdBy: { type: new graphql_1.GraphQLNonNull(user_types_gql_1.OneUserType) },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        deletedAt: { type: graphql_1.GraphQLString },
    },
});
exports.notificationList = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "NotificationListResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "NotificationPaginationResponse",
                fields: {
                    docs: { type: new graphql_1.GraphQLList(exports.OneNotificationType) },
                    currentPage: { type: graphql_1.GraphQLInt },
                    pages: { type: graphql_1.GraphQLInt },
                    size: { type: graphql_1.GraphQLInt },
                },
            }),
        },
    },
}));
exports.notificationMutationResponse = new graphql_1.GraphQLObjectType({
    name: "NotificationMutationResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: { type: exports.OneNotificationType },
    },
});
exports.unreadCountResponse = new graphql_1.GraphQLNonNull(new graphql_1.GraphQLObjectType({
    name: "UnreadCountResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        data: {
            type: new graphql_1.GraphQLObjectType({
                name: "UnreadCountData",
                fields: {
                    unreadCount: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
                },
            }),
        },
    },
}));
exports.messageResponse = new graphql_1.GraphQLObjectType({
    name: "NotificationMessageResponse",
    fields: {
        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    },
});
