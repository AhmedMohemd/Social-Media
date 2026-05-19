import * as NotificationGQLTypes from "./notification.types.gql";
import * as NotificationGQLArgs from "./notification.args.gql";
import { notificationResolver, NotificationResolver } from "./notification.resolver";
export class NotificationGQLSchema {
    private notificationResolver: NotificationResolver;
    constructor() {
        this.notificationResolver = notificationResolver;
    }
    registerQuery() {
        return {
            allNotifications: {
                type: NotificationGQLTypes.notificationList,
                args: NotificationGQLArgs.notificationList,
                description: "Get all notifications",
                resolve: this.notificationResolver.allNotifications,
            },
            myNotifications: {
                type: NotificationGQLTypes.notificationList,
                args: NotificationGQLArgs.notificationList,
                description: "Get my notifications (paginated)",
                resolve: this.notificationResolver.myNotifications,
            },
            unreadCount: {
                type: NotificationGQLTypes.unreadCountResponse,
                args: {},
                description: "Get unread notifications count",
                resolve: this.notificationResolver.unreadCount,
            },
        };
    }
    registerMutation() {
        return {
            createNotification: {
                type: NotificationGQLTypes.notificationMutationResponse,
                args: NotificationGQLArgs.createNotification,
                description: "Create a notification",
                resolve: this.notificationResolver.createNotification,
            },
            markAsRead: {
                type: NotificationGQLTypes.notificationMutationResponse,
                args: NotificationGQLArgs.notificationParams,
                description: "Mark a notification as read",
                resolve: this.notificationResolver.markAsRead,
            },
            markAllAsRead: {
                type: NotificationGQLTypes.messageResponse,
                args: {},
                description: "Mark all notifications as read",
                resolve: this.notificationResolver.markAllAsRead,
            },
            updateNotification: {
                type: NotificationGQLTypes.notificationMutationResponse,
                args: NotificationGQLArgs.updateNotification,
                description: "Update a notification",
                resolve: this.notificationResolver.updateNotification,
            },
            deleteNotification: {
                type: NotificationGQLTypes.messageResponse,
                args: NotificationGQLArgs.notificationParams,
                description: "Soft delete a notification",
                resolve: this.notificationResolver.deleteNotification,
            },
        };
    }
}
export const notificationGQLSchema = new NotificationGQLSchema();