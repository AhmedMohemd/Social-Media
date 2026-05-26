import { model, models, Schema, Types } from "mongoose";
import { IStory, IStoryReaction, IStoryView } from "../../common/interfaces";
import { StoryReactionEnum } from "../../common/enums";
const storyViewSchema = new Schema<IStoryView>(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const storyReactionSchema = new Schema<IStoryReaction>(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(StoryReactionEnum),
      default: StoryReactionEnum.LOVE,
    },
  },
  { _id: false },
);
const storySchema = new Schema<IStory>(
  {
    folderId: { type: String, required: true },
    content: { type: String },
    attachment: { type: String },
    backgroundColor: { type: String, default: "#000000" },
    textColor: { type: String, default: "#ffffff" },
    views: [storyViewSchema],
    reactions: [storyReactionSchema],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      required: true,
    },
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
// storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({
      ...query,
      deletedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
  }
});
export const StoryModel = models.Story || model<IStory>("Story", storySchema);
StoryModel.syncIndexes();