import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IComment } from "../../common/interfaces";
import { ReactEnum } from "../../common/enums";
const commentReactSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(ReactEnum),
      default: ReactEnum.LIKE,
    },
  },
  { _id: false },
);
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: { type: [String] },
    // likes: [{ type: Types.ObjectId, ref: "User" }],
    likes: [commentReactSchema],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
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
  },
);
commentSchema.virtual("reply", {    
  localField: "_id",
  foreignField: "commentId",
  ref: "Comment",
  // justOne: true,
});
commentSchema.pre(["findOne", "find", "countDocuments"], function () {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});
commentSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const update = this.getUpdate() as HydratedDocument<IComment>;
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
commentSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getQuery();
  if (query.force === true) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});
export const CommentModel =
  models.Comment || model<IComment>("Comment", commentSchema);
CommentModel.syncIndexes();