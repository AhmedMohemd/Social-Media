import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express";
import { successResponse } from "../../common/response";
import userService from "./user.service";
import { authentication, authorization, validation } from "../../middleware";
import { endPoint } from "./user.authorization";
import { StorageApproachEnum, TokenTypeEnum } from "../../common/enums";
import {
  cloudFileUpload,
  fileFieldValidation,
} from "../../common/utils/multer";
import * as validators from "./user.validation";
import { chatRouter } from "../chat";
const router = Router();
router.use('/:userId/chat', chatRouter)
router.get(
  "/",
  authentication(),
  authorization(endPoint.profile),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profile(req.user);
    return successResponse({ res, data });
  },
);
router.get(
  "/profile/:userId",
  authentication(),
  validation(validators.shareProfile),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.getOtherProfile(
      req.params.userId as unknown as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.patch(
  "/update",
  authentication(),
  validation(validators.updateProfile),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.updateProfile(req.body, req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/update-password",
  authentication(),
  validation(validators.updatePassword),
  async (req: Request, res: Response, next: NextFunction) => {
    await userService.updatePassword(req.body, req.user);
    return successResponse({ res, message: "Password updated successfully" });
  },
);
router.patch(
  "/profile-image",
  authentication(),
  validation(validators.profileImage),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profileImage(req.body, req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/profile-cover-images",
  authentication(),
  cloudFileUpload({
    validation: fileFieldValidation.image,
    storageApproach: StorageApproachEnum.DISK,
  }).array("attachments", 2),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.profileCoverImages(
      req.files as Express.Multer.File[],
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.patch(
  "/friend/:userId",
  authentication(),
  validation(validators.friend),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.addFriend(req.params.userId as unknown as string, req.user);
    return successResponse({ res, data });
  },
);
router.delete(
  "/friend/:userId",
  authentication(),
  validation(validators.friend),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.removeFriend(
      req.params.userId as unknown as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  async (req, res, next) => {
    const status = await userService.logout(
      req.body,
      req.user,
      req.decoded as { jti: string; iat: number; sub: string },
    );
    return successResponse({ res, status });
  },
);
router.post(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  async (req, res, next) => {
    const credentials = await userService.rotateToken(
      req.user,
      req.decoded as { jti: string; iat: number; sub: string },
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, status: 201, data: { ...credentials } });
  },
);
router.delete(
  "/",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.softDeleteAccount(req.user);
    return successResponse({ res, data });
  },
);
router.delete(
  "/hard",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.deleteAccount(req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/restore/:userId",
  authentication(),
  validation(validators.restoreAccount),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.restoreAccount(
      req.params.userId as unknown as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
export default router;