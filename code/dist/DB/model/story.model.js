"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const storyViewSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
}, { _id: false });
const storyReactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: Object.values(enums_1.StoryReactionEnum),
        default: enums_1.StoryReactionEnum.LOVE,
    },
}, { _id: false });
const storySchema = new mongoose_1.Schema({
    folderId: { type: String, required: true },
    content: { type: String },
    attachment: { type: String },
    backgroundColor: { type: String, default: "#000000" },
    textColor: { type: String, default: "#ffffff" },
    views: [storyViewSchema],
    reactions: [storyReactionSchema],
    createdBy: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        required: true,
    },
    deletedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});
storySchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({
            ...query,
            deletedAt: { $exists: false },
        });
    }
});
exports.StoryModel = mongoose_1.models.Story || (0, mongoose_1.model)("Story", storySchema);
exports.StoryModel.syncIndexes();
