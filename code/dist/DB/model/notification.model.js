"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const notificationSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values(enums_1.NotificationTypeEnum),
        required: true,
    },
    data: { type: mongoose_1.Schema.Types.Mixed },
    image: { type: String },
    recipients: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    sendToAll: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
notificationSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
exports.NotificationModel = mongoose_1.models.Notification ||
    (0, mongoose_1.model)("Notification", notificationSchema);
exports.NotificationModel.syncIndexes();
