import { RoleEnum } from "../../common/enums";
export const endPoint = {
  admin: [RoleEnum.ADMIN],
  user: [RoleEnum.USER, RoleEnum.ADMIN],
};