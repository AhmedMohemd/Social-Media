"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.createNotification = exports.notificationParams = exports.notificationList = void 0;
const graphql_1 = require("graphql");
const notification_types_gql_1 = require("./notification.types.gql");
exports.notificationList = {
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString },
};
exports.notificationParams = {
    notificationId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
};
exports.createNotification = {
    title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    body: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    type: { type: new graphql_1.GraphQLNonNull(notification_types_gql_1.NotificationTypeGQLEnum) },
    image: { type: graphql_1.GraphQLString },
    recipients: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    sendToAll: { type: graphql_1.GraphQLBoolean },
};
exports.updateNotification = {
    notificationId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    title: { type: graphql_1.GraphQLString },
    body: { type: graphql_1.GraphQLString },
    image: { type: graphql_1.GraphQLString },
};
