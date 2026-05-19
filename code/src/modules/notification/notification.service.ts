import { HydratedDocument } from "mongoose";
import { INotification, IUser } from "../../common/interfaces";
import { NotificationRepository } from "../../DB/repository";
import { ForbiddenException, NotFoundException } from "../../common/exceptions";
import {
  notificationService as fcmService,
  NotificationService as FCMService,
  redisService,
  RedisService,
} from "../../common/services";
import { RoleEnum, NotificationTypeEnum } from "../../common/enums";
import { UserRepository } from "../../DB/repository";
import { IPaginate } from "../../common/interfaces";
import { PaginateDto } from "../../common/validation";

export class NotificationServiceModule {
  private readonly notificationRepository: NotificationRepository;
  private readonly userRepository: UserRepository;
  private readonly fcm: FCMService;
  private readonly redis: RedisService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();
    this.fcm = fcmService;
    this.redis = redisService;
  }
  async createNotification(
    {
      title,
      body,
      type,
      image,
      recipients,
      sendToAll,
      data,
    }: {
      title: string;
      body: string;
      type: NotificationTypeEnum;
      image?: string;
      recipients?: string[];
      sendToAll?: boolean;
      data?: Record<string, unknown>;
    },
    admin: HydratedDocument<IUser>,
  ): Promise<INotification> {
    if (admin.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Admins only");
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
      const allTokens: string[] = [];
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
    } else if (recipients?.length) {
      const tokens: string[] = [];
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
  async allNotifications(
    { page, size, search }: PaginateDto,
    admin: HydratedDocument<IUser>,
  ): Promise<IPaginate<INotification>> {
    if (admin.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Admins only");

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
  async myNotifications(
    { page, size }: PaginateDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPaginate<INotification>> {
    return await this.notificationRepository.paginate({
      filter: {
        $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
      },
      page,
      size,
    });
  }
  async markAsRead(
    notificationId: string,
    user: HydratedDocument<IUser>,
  ): Promise<INotification> {
    const notification = await this.notificationRepository.findOneAndUpdate({
      filter: {
        _id: notificationId,
        $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
      },
      update: { isRead: true, readAt: new Date() },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    return notification.toJSON();
  }
  async markAllAsRead(user: HydratedDocument<IUser>): Promise<object> {
    await this.notificationRepository.updateMany({
      filter: {
        $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
        isRead: false,
      },
      update: { isRead: true, readAt: new Date() },
    });
    return { message: "All notifications marked as read" };
  }
  async updateNotification(
    notificationId: string,
    data: Partial<INotification>,
    admin: HydratedDocument<IUser>,
  ): Promise<INotification> {
    if (admin.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Admins only");
    const notification = await this.notificationRepository.findOneAndUpdate({
      filter: { _id: notificationId },
      update: data,
    });
    if (!notification) throw new NotFoundException("Notification not found");
    return notification.toJSON();
  }
  async deleteNotification(
    notificationId: string,
    admin: HydratedDocument<IUser>,
  ): Promise<object> {
    if (admin.role !== RoleEnum.ADMIN)
      throw new ForbiddenException("Admins only");
    const notification = await this.notificationRepository.findOneAndUpdate({
      filter: { _id: notificationId },
      update: { deletedAt: new Date() },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    return { message: "Notification deleted" };
  }
  async unreadCount(user: HydratedDocument<IUser>): Promise<object> {
    const notifications = await this.notificationRepository.find({
      filter: {
        $or: [{ recipients: { $in: [user._id] } }, { sendToAll: true }],
        isRead: false,
      },
    });
    return { unreadCount: notifications.length };
  }
}
export const notificationServiceModule = new NotificationServiceModule();