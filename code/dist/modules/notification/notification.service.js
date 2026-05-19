"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationServiceModule = exports.NotificationServiceModule = void 0;
const repository_1 = require("../../DB/repository");
const exceptions_1 = require("../../common/exceptions");
const services_1 = require("../../common/services");
const enums_1 = require("../../common/enums");
const repository_2 = require("../../DB/repository");
class NotificationServiceModule {
    notificationRepository;
    userRepository;
    fcm;
    redis;
    constructor() {
        this.notificationRepository = new repository_1.NotificationRepository();
        this.userRepository = new repository_2.UserRepository();
        this.fcm = services_1.notificationService;
        this.redis = services_1.redisService;
    }
    async createNotification({ title, body, type, image, recipients, sendToAll, data, }, admin) {
        if (admin.role !== enums_1.RoleEnum.ADMIN)
            throw new exceptions_1.ForbiddenException("Admins only");
        const notification = await this.notificationRepository.createOne({
            data: {
                title,
                body,
                type,
                image,
                recipients,
                sendToAll: sendToAll ?? false,
                data,
                createdBy: admin._id,
            },
        });
        if (sendToAll) {
            const allUsers = await this.userRepository.find({ filter: {} });
            const allTokens = [];
            for (const user of allUsers) {
                const tokens = await this.redis.getFCMs(user._id);
                allTokens.push(...tokens);
            }
            if (allTokens.length) {
                await this.fcm.sendNotifications({
                    tokens: allTokens,
                    data: { title, body },
                });
            }
        }
        else if (recipients?.length) {
            const tokens = [];
            for (const userId of recipients) {
                const userTokens = await this.redis.getFCMs(userId);
                tokens.push(...userTokens);
            }
            if (tokens.length) {
                await this.fcm.sendNotifications({ tokens, data: { title, body } });
            }
        }
        return notification.toJSON();
    }
    async allNotifications({ page, size, search }, admin) {
        if (admin.role !== enums_1.RoleEnum.ADMIN)
            throw new exceptions_1.ForbiddenException("Admins only");
        return await this.notificationRepository.paginate({
            filter: {
                ...(search ? { title: { $regex: search, $options: "i" } } : {}),
            },
            page,
            size,
            options: {
                populate: [{ path: "createdBy", select: "firstName lastName" }],
            },
        });
    }
    async myNotifications({ page, size }, user) {
        return await this.notificationRepository.paginate({
            filter: {
                $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
            },
            page,
            size,
        });
    }
    async markAsRead(notificationId, user) {
        const notification = await this.notificationRepository.findOneAndUpdate({
            filter: {
                _id: notificationId,
                $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
            },
            update: { isRead: true, readAt: new Date() },
        });
        if (!notification)
            throw new exceptions_1.NotFoundException("Notification not found");
        return notification.toJSON();
    }
    async markAllAsRead(user) {
        await this.notificationRepository.updateMany({
            filter: {
                $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
                isRead: false,
            },
            update: { isRead: true, readAt: new Date() },
        });
        return { message: "All notifications marked as read" };
    }
    async updateNotification(notificationId, data, admin) {
        if (admin.role !== enums_1.RoleEnum.ADMIN)
            throw new exceptions_1.ForbiddenException("Admins only");
        const notification = await this.notificationRepository.findOneAndUpdate({
            filter: { _id: notificationId },
            update: data,
        });
        if (!notification)
            throw new exceptions_1.NotFoundException("Notification not found");
        return notification.toJSON();
    }
    async deleteNotification(notificationId, admin) {
        if (admin.role !== enums_1.RoleEnum.ADMIN)
            throw new exceptions_1.ForbiddenException("Admins only");
        const notification = await this.notificationRepository.findOneAndUpdate({
            filter: { _id: notificationId },
            update: { deletedAt: new Date() },
        });
        if (!notification)
            throw new exceptions_1.NotFoundException("Notification not found");
        return { message: "Notification deleted" };
    }
    async unreadCount(user) {
        const notifications = await this.notificationRepository.find({
            filter: {
                $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
                isRead: false,
            },
        });
        return { unreadCount: notifications.length };
    }
}
exports.NotificationServiceModule = NotificationServiceModule;
exports.notificationServiceModule = new NotificationServiceModule();
