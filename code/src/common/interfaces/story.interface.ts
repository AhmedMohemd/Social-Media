import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { StoryReactionEnum } from "../enums";
export interface IStoryView {
  userId: Types.ObjectId | IUser;
  viewedAt: Date;
}
export interface IStoryReaction {
  userId: Types.ObjectId | IUser;
  type: StoryReactionEnum;
}
export interface IStory {
  folderId: string;
  content?: string;
  attachment?: string;
  backgroundColor?: string;
  textColor?: string;
  views?: IStoryView[];
  reactions?: IStoryReaction[];
  createdBy: Types.ObjectId | IUser;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}