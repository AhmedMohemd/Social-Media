"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationResolver = exports.NotificationResolver = void 0;
const notification_service_1 = require("../notification.service");
const middleware_1 = require("../../../middleware");
const notification_authorization_1 = require("../notification.authorization");
const notification_validation_1 = require("../notification.validation");
class NotificationResolver {
    service;
    constructor() {
        this.service = notification_service_1.notificationServiceModule;
    }
    allNotifications = async (parent, args, { user }) => {
        await (0, middleware_1.GQLAuthorization)(notification_authorization_1.endPoint.admin, user);
        await (0, middleware_1.GQLValidation)(notification_validation_1.notificationListGQL, args);
        const data = await this.service.allNotifications(args, user);
        return { message: "Done", data };
    };
    myNotifications = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(notification_validation_1.notificationListGQL, args);
        const data = await this.service.myNotifications(args, user);
        return { message: "Done", data };
    };
    unreadCount = async (parent, args, { user }) => {
        const data = await this.service.unreadCount(user);
        return { message: "Done", data };
    };
    createNotification = async (parent, args, { user }) => {
        await (0, middleware_1.GQLAuthorization)(notification_authorization_1.endPoint.admin, user);
        await (0, middleware_1.GQLValidation)(notification_validation_1.createNotificationGQL, args);
        const data = await this.service.createNotification(args, user);
        return { message: "Notification created", data };
    };
    markAsRead = async (parent, { notificationId }, { user }) => {
        await (0, middleware_1.GQLValidation)(notification_validation_1.notificationParamsGQL, { notificationId });
        const data = await this.service.markAsRead(notificationId, user);
        return { message: "Marked as read", data };
    };
    markAllAsRead = async (parent, args, { user }) => {
        return (await this.service.markAllAsRead(user));
    };
    updateNotification = async (parent, args, { user }) => {
        await (0, middleware_1.GQLAuthorization)(notification_authorization_1.endPoint.admin, user);
        await (0, middleware_1.GQLValidation)(notification_validation_1.updateNotificationGQL, args);
        const { notificationId, ...data } = args;
        const result = await this.service.updateNotification(notificationId, data, user);
        return { message: "Updated", data: result };
    };
    deleteNotification = async (parent, { notificationId }, { user }) => {
        await (0, middleware_1.GQLAuthorization)(notification_authorization_1.endPoint.admin, user);
        await (0, middleware_1.GQLValidation)(notification_validation_1.notificationParamsGQL, { notificationId });
        return (await this.service.deleteNotification(notificationId, user));
    };
}
exports.NotificationResolver = NotificationResolver;
exports.notificationResolver = new NotificationResolver();
