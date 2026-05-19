"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationGQLSchema = exports.NotificationGQLSchema = void 0;
const NotificationGQLTypes = __importStar(require("./notification.types.gql"));
const NotificationGQLArgs = __importStar(require("./notification.args.gql"));
const notification_resolver_1 = require("./notification.resolver");
class NotificationGQLSchema {
    notificationResolver;
    constructor() {
        this.notificationResolver = notification_resolver_1.notificationResolver;
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
exports.NotificationGQLSchema = NotificationGQLSchema;
exports.notificationGQLSchema = new NotificationGQLSchema();
