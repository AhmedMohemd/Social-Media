import {
    notificationServiceModule,
    NotificationServiceModule,
} from "../notification.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLAuthorization, GQLValidation } from "../../../middleware";
import { endPoint } from "../notification.authorization";
import {
    createNotificationGQL,
    updateNotificationGQL,
    notificationParamsGQL,
    notificationListGQL,
} from "../notification.validation";
import { IPaginate, INotification } from "../../../common/interfaces";
import { NotificationTypeEnum } from "../../../common/enums";
import { PaginateDto } from "../../../common/validation";
export class NotificationResolver {
    private readonly service: NotificationServiceModule;
    constructor() {
        this.service = notificationServiceModule;
    }
    allNotifications = async (
        parent: unknown,
        args: PaginateDto,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IPaginate<INotification> }> => {
        await GQLAuthorization(endPoint.admin, user);
        await GQLValidation(notificationListGQL, args);
        const data = await this.service.allNotifications(args, user);
        return { message: "Done", data };
    };
    myNotifications = async (
        parent: unknown,
        args: PaginateDto,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IPaginate<INotification> }> => {
        await GQLValidation(notificationListGQL, args);
        const data = await this.service.myNotifications(args, user);
        return { message: "Done", data };
    };
    unreadCount = async (
        parent: unknown,
        args: unknown,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: object }> => {
        const data = await this.service.unreadCount(user);
        return { message: "Done", data };
    };
    createNotification = async (
        parent: unknown,
        args: {
            title: string;
            body: string;
            type: NotificationTypeEnum;
            image?: string;
            recipients?: string[];
            sendToAll?: boolean;
        },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: INotification }> => {
        await GQLAuthorization(endPoint.admin, user);
        await GQLValidation(createNotificationGQL, args);
        const data = await this.service.createNotification(args, user);
        return { message: "Notification created", data };
    };
    markAsRead = async (
        parent: unknown,
        { notificationId }: { notificationId: string },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: INotification }> => {
        await GQLValidation(notificationParamsGQL, { notificationId });
        const data = await this.service.markAsRead(notificationId, user);
        return { message: "Marked as read", data };
    };
    markAllAsRead = async (
        parent: unknown,
        args: unknown,
        { user }: IAuthUser,
    ): Promise<{ message: string }> => {
        return (await this.service.markAllAsRead(user)) as { message: string };
    };
    updateNotification = async (
        parent: unknown,
        args: {
            notificationId: string;
            title?: string;
            body?: string;
            image?: string;
        },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: INotification }> => {
        await GQLAuthorization(endPoint.admin, user);
        await GQLValidation(updateNotificationGQL, args);
        const { notificationId, ...data } = args;
        const result = await this.service.updateNotification(
            notificationId,
            data,
            user,
        );
        return { message: "Updated", data: result };
    };
    deleteNotification = async (
        parent: unknown,
        { notificationId }: { notificationId: string },
        { user }: IAuthUser,
    ): Promise<{ message: string }> => {
        await GQLAuthorization(endPoint.admin, user);
        await GQLValidation(notificationParamsGQL, { notificationId });
        return (await this.service.deleteNotification(
            notificationId,
            user,
        )) as { message: string };
    };
}
export const notificationResolver = new NotificationResolver();