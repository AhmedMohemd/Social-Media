import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IPost } from "./post.interface";
import { ReactEnum } from "../enums";
export interface ICommentReact {
  userId: Types.ObjectId | IUser;
  type: ReactEnum;
}
export interface IComment {
  content?: string;
  attachments?: string[];
  // likes?: Types.ObjectId[] | IUser[];
  likes?: ICommentReact[];
  tags?: Types.ObjectId[] | IUser[];
  postId: Types.ObjectId | IPost;
  // commentId: Types.ObjectId | IComment;
  commentId?: Types.ObjectId | IComment;
  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  updatedAt?: Date;
}