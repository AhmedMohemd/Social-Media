import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";
import { NotificationTypeEnum } from "../../../common/enums";
export const NotificationTypeGQLEnum = new GraphQLEnumType({
    name: "NotificationTypeGQLEnum",
    values: {
        POST_LIKE: { value: NotificationTypeEnum.POST_LIKE },
        POST_COMMENT: { value: NotificationTypeEnum.POST_COMMENT },
        POST_MENTION: { value: NotificationTypeEnum.POST_MENTION },
        COMMENT_LIKE: { value: NotificationTypeEnum.COMMENT_LIKE },
        COMMENT_REPLY: { value: NotificationTypeEnum.COMMENT_REPLY },
        FRIEND_REQUEST: { value: NotificationTypeEnum.FRIEND_REQUEST },
        FRIEND_ACCEPT: { value: NotificationTypeEnum.FRIEND_ACCEPT },
        STORY_VIEW: { value: NotificationTypeEnum.STORY_VIEW },
        SYSTEM: { value: NotificationTypeEnum.SYSTEM },
    },
});
export const OneNotificationType = new GraphQLObjectType({
    name: "OneNotificationType",
    fields: {
        _id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(NotificationTypeGQLEnum) },
        image: { type: GraphQLString },
        sendToAll: { type: GraphQLBoolean },
        isRead: { type: GraphQLBoolean },
        readAt: { type: GraphQLString },
        createdBy: { type: new GraphQLNonNull(OneUserType) },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
    },
});
export const notificationList = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "NotificationListResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLObjectType({
                    name: "NotificationPaginationResponse",
                    fields: {
                        docs: { type: new GraphQLList(OneNotificationType) },
                        currentPage: { type: GraphQLInt },
                        pages: { type: GraphQLInt },
                        size: { type: GraphQLInt },
                    },
                }),
            },
        },
    }),
);
export const notificationMutationResponse = new GraphQLObjectType({
    name: "NotificationMutationResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneNotificationType },
    },
});
export const unreadCountResponse = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "UnreadCountResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLObjectType({
                    name: "UnreadCountData",
                    fields: {
                        unreadCount: { type: new GraphQLNonNull(GraphQLInt) },
                    },
                }),
            },
        },
    }),
);
export const messageResponse = new GraphQLObjectType({
    name: "NotificationMessageResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
    },
});