import { Router, Request, Response, NextFunction } from "express";
import { authentication, validation } from "../../middleware";
import {
  cloudFileUpload,
  fileFieldValidation,
} from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import { storyService } from "./story.service";
import * as validators from "./story.validation";
import { StorageApproachEnum } from "../../common/enums";
const router = Router();
router.post(
  "/",
  authentication(),
  cloudFileUpload({
    validation: [...fileFieldValidation.image, ...fileFieldValidation.video],
    storageApproach: StorageApproachEnum.DISK,
    maxSize: 50,
  }).single("attachment"),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.createStory(
      { ...req.body, file: req.file },
      req.user,
    );
    return successResponse({ res, status: 201, data });
  },
);
router.get(
  "/feed",
  authentication(),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.getStoriesFeed(req.user);
    return successResponse({ res, data });
  },
);
router.get(
  "/my",
  authentication(),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.getMyStories(req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/:storyId/view",
  authentication(),
  validation(validators.storyParams),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.viewStory(
      req.params.storyId as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.get(
  "/:storyId/viewers",
  authentication(),
  validation(validators.storyParams),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.storyViewers(
      req.params.storyId as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.patch(
  "/:storyId/react",
  authentication(),
  validation(validators.reactStory),
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await storyService.reactStory(
      req.params.storyId as string,
      req.query.react as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.delete(
  "/:storyId",
  authentication(),
  validation(validators.storyParams),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await storyService.deleteStory(
      req.params.storyId as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
export default router;