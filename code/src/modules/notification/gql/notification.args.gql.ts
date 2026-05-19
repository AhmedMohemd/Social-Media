import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} from "graphql";
import { NotificationTypeGQLEnum } from "./notification.types.gql";
export const notificationList = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};
export const notificationParams = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
};
export const createNotification = {
    title: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(NotificationTypeGQLEnum) },
    image: { type: GraphQLString },
    recipients: { type: new GraphQLList(GraphQLID) },
    sendToAll: { type: GraphQLBoolean },
};
export const updateNotification = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    image: { type: GraphQLString },
};