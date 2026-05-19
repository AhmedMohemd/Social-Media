import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { AvailabilityEnum, ReactEnum } from "../enums";
export interface IReact {
  userId: Types.ObjectId | IUser;
  type: ReactEnum;
}
export interface IPost {
  folderId: string;
  content?: string;
  attachments?: string[];
  // likes?: Types.ObjectId[] | IUser[];
  likes?: IReact[];
  tags?: Types.ObjectId[] | IUser[];
  availability: AvailabilityEnum;
  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  updatedAt: Date;
}