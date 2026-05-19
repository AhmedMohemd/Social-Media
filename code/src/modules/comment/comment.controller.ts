import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { authentication, validation } from "../../middleware";
import {
  cloudFileUpload,
  fileFieldValidation,
} from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from "./comment.validation";
import {
  CreateCommentParamsDto,
  CreateReplyOnCommentParamsDto,
} from "./comment.dto";
import { commentService } from "./comment.service";
import { IComment } from "../../common/interfaces";
const router = Router({ mergeParams: true });
router.post(
  "/",
  authentication(),
  cloudFileUpload({ validation: fileFieldValidation.image }).array(
    "attachments",
    2,
  ),
  validation(validators.createComment),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await commentService.createComment(
      req.params as CreateCommentParamsDto,
      { ...req.body, files: req.files },
      req.user,
    );
    return successResponse<IComment>({ res, status: 201, data });
  },
);
router.post(
  "/:commentId/reply",
  authentication(),
  cloudFileUpload({ validation: fileFieldValidation.image }).array(
    "attachments",
    2,
  ),
  validation(validators.replyOnComment),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await commentService.replyOnComment(
      req.params as CreateReplyOnCommentParamsDto,
      { ...req.body, files: req.files },
      req.user,
    );
    return successResponse<IComment>({ res, status: 201, data });
  },
);
router.patch(
  "/:commentId/react",
  authentication(),
  validation(validators.reactComment),
  async (req: Request, res: Response): Promise<Response> => {
    const data = await commentService.reactComment(
      req.params as any,
      req.query as any,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
export default router;