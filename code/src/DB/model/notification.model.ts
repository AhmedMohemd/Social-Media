import { model, models, Schema, Types } from "mongoose";
import { INotification } from "../../common/interfaces";
import { NotificationTypeEnum } from "../../common/enums";
const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationTypeEnum),
      required: true,
    },
    data: { type: Schema.Types.Mixed },
    image: { type: String },
    recipients: [{ type: Types.ObjectId, ref: "User" }],
    sendToAll: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);
notificationSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});
export const NotificationModel =
  models.Notification ||
  model<INotification>("Notification", notificationSchema);
NotificationModel.syncIndexes();