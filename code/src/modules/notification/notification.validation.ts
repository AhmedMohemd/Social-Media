import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { NotificationTypeEnum } from "../../common/enums";
export const createNotification = {
  body: z.strictObject({
    title: z.string().min(2).max(100),
    body: z.string().min(2).max(500),
    type: z.enum(Object.values(NotificationTypeEnum) as [string, ...string[]]),
    image: z.string().url().optional(),
    recipients: z.array(generalValidationFields.id).optional(),
    sendToAll: z.coerce.boolean().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
};
export const updateNotification = {
  params: z.strictObject({ notificationId: generalValidationFields.id }),
  body: z.strictObject({
    title: z.string().min(2).max(100).optional(),
    body: z.string().min(2).max(500).optional(),
    image: z.string().url().optional(),
  }),
};
export const notificationParams = {
  params: z.strictObject({ notificationId: generalValidationFields.id }),
};
export const notificationListGQL = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
  search: z.string().optional(),
});
export const createNotificationGQL = z.object({
  title: z.string().min(2).max(100),
  body: z.string().min(2).max(500),
  type: z.enum(Object.values(NotificationTypeEnum) as [string, ...string[]]),
  image: z.string().url().optional(),
  recipients: z
    .array(
      z.string().refine(
        (val) => {
          const { Types } = require("mongoose");
          return Types.ObjectId.isValid(val);
        },
        { message: "invalid ObjectId" },
      ),
    )
    .optional(),
  sendToAll: z.boolean().optional(),
});
export const updateNotificationGQL = z.object({
  notificationId: generalValidationFields.id,
  title: z.string().min(2).max(100).optional(),
  body: z.string().min(2).max(500).optional(),
  image: z.string().url().optional(),
});
export const notificationParamsGQL = z.object({
  notificationId: generalValidationFields.id,
});