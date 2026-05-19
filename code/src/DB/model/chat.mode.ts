import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import {ChatEnum } from "../../common/enums";
import { IChat, IMessage } from "../../common/interfaces";
const messageSchema = new Schema<IMessage>({
    content: {
        type: String, required: function (this) {
            return !this.attachments?.length
        }
    },
    attachments: { type: [String] },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },

    deletedAt: { type: Date },
    restoredAt: { type: Date },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strict: true,
        strictQuery: true,
    },)
const chatSchema = new Schema<IChat>({
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ChatEnum, default: ChatEnum.ovo },
    group: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm
        }
    },
    roomId: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm
        }
    },
    group_image: {
        type: String
    },
    messages: { type: [messageSchema], required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
},
)
chatSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
chatSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<IChat>;
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
    } else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
chatSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
ChatModel.syncIndexes();