"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationParamsGQL = exports.updateNotificationGQL = exports.createNotificationGQL = exports.notificationListGQL = exports.notificationParams = exports.updateNotification = exports.createNotification = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const enums_1 = require("../../common/enums");
exports.createNotification = {
    body: zod_1.z.strictObject({
        title: zod_1.z.string().min(2).max(100),
        body: zod_1.z.string().min(2).max(500),
        type: zod_1.z.enum(Object.values(enums_1.NotificationTypeEnum)),
        image: zod_1.z.string().url().optional(),
        recipients: zod_1.z.array(validation_1.generalValidationFields.id).optional(),
        sendToAll: zod_1.z.coerce.boolean().optional(),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    }),
};
exports.updateNotification = {
    params: zod_1.z.strictObject({ notificationId: validation_1.generalValidationFields.id }),
    body: zod_1.z.strictObject({
        title: zod_1.z.string().min(2).max(100).optional(),
        body: zod_1.z.string().min(2).max(500).optional(),
        image: zod_1.z.string().url().optional(),
    }),
};
exports.notificationParams = {
    params: zod_1.z.strictObject({ notificationId: validation_1.generalValidationFields.id }),
};
exports.notificationListGQL = zod_1.z.object({
    page: zod_1.z.number().optional(),
    size: zod_1.z.number().optional(),
    search: zod_1.z.string().optional(),
});
exports.createNotificationGQL = zod_1.z.object({
    title: zod_1.z.string().min(2).max(100),
    body: zod_1.z.string().min(2).max(500),
    type: zod_1.z.enum(Object.values(enums_1.NotificationTypeEnum)),
    image: zod_1.z.string().url().optional(),
    recipients: zod_1.z
        .array(zod_1.z.string().refine((val) => {
        const { Types } = require("mongoose");
        return Types.ObjectId.isValid(val);
    }, { message: "invalid ObjectId" }))
        .optional(),
    sendToAll: zod_1.z.boolean().optional(),
});
exports.updateNotificationGQL = zod_1.z.object({
    notificationId: validation_1.generalValidationFields.id,
    title: zod_1.z.string().min(2).max(100).optional(),
    body: zod_1.z.string().min(2).max(500).optional(),
    image: zod_1.z.string().url().optional(),
});
exports.notificationParamsGQL = zod_1.z.object({
    notificationId: validation_1.generalValidationFields.id,
});
