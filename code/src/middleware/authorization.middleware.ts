import { NextFunction, Request, Response } from "express";
import { RoleEnum } from "../common/enums";
import { ForbiddenException, MapGraphQLError } from "../common/exceptions";
import { HydratedDocument } from "mongoose";
import { IUser } from "../common/interfaces";
export const authorization = (accessRoles: RoleEnum[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accessRoles.includes(req.user.role)) {
      throw new ForbiddenException("Not authorized account");
    }
    return next();
  };
};
export const GQLAuthorization = async (accessRoles: RoleEnum[], user: HydratedDocument<IUser>): Promise<boolean> => {
  if (!accessRoles.includes(user.role)) {
    throw MapGraphQLError(new ForbiddenException("Not authorized account"))
  }
  return true
}