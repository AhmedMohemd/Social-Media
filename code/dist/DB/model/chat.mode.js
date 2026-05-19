"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const messageSchema = new mongoose_1.Schema({
    content: {
        type: String, required: function () {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },
    likes: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
const chatSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: enums_1.ChatEnum, default: enums_1.ChatEnum.ovo },
    group: {
        type: String, required: function () {
            return this.type == enums_1.ChatEnum.ovm;
        }
    },
    roomId: {
        type: String, required: function () {
            return this.type == enums_1.ChatEnum.ovm;
        }
    },
    group_image: {
        type: String
    },
    messages: { type: [messageSchema], required: true },
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
chatSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
chatSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
    }
    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
chatSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.ChatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", chatSchema);
exports.ChatModel.syncIndexes();
