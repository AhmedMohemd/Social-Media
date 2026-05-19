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
import * as validators from "./post.validation";
import { postService } from "./post.service";
import {
  PaginateDto,
  paginationValidationSchema,
} from "../../common/validation";
import {
  ReactPostParamsDto,
  ReactPostQueryDto,
  UpdatePostBodyDto,
  UpdatePostParamsDto,
} from "./post.dto";
import { commentRouter } from "../comment";
import { generalValidationFields } from "../../common/validation";
import { z } from "zod";
const router = Router();
router.use("/:postId/comment", commentRouter);
router.get(
  "/feed",
  authentication(),
  validation(paginationValidationSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.vewsFeed(
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.get(
  "/profile",
  authentication(),
  validation(paginationValidationSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.profilePost(
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.get(
  "/profile/:userId",
  authentication(),
  validation({
    params: z.strictObject({ userId: generalValidationFields.id }),
    query: paginationValidationSchema.query,
  }),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.userProfilePost(
      req.params.userId as string,
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.get(
  "/tagged",
  authentication(),
  validation(paginationValidationSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.taggedPosts(
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.get(
  "/dashboard",
  authentication(),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.profileDashboard(req.user);
    return successResponse({ res, status: 200, data });
  },
);
router.get(
  "/",
  authentication(),
  validation(paginationValidationSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.postList(req.query as PaginateDto, req.user);
    return successResponse({ res, status: 200, data });
  },
);
router.post(
  "/",
  authentication(),
  cloudFileUpload({ validation: fileFieldValidation.image }).array(
    "attachments",
    2,
  ),
  validation(validators.createPost),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.createPost(
      { ...req.body, files: req.files },
      req.user,
    );
    return successResponse({ res, status: 201, data });
  },
);
router.patch(
  "/:postId",
  authentication(),
  cloudFileUpload({ validation: fileFieldValidation.image }).array(
    "attachments",
    2,
  ),
  validation(validators.updatePost),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.updatePost(
      req.params as UpdatePostParamsDto,
      req.body as UpdatePostBodyDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.patch(
  "/:postId/react",
  authentication(),
  validation(validators.reactPost),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await postService.reactPost(
      req.params as ReactPostParamsDto,
      req.query as unknown as ReactPostQueryDto,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.delete(
  "/:postId",
  authentication(),
  validation({ params: z.strictObject({ postId: generalValidationFields.id }) }),
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await postService.softDeletePost(
      req.params.postId as string,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.patch(
  "/:postId/restore",
  authentication(),
  validation({ params: z.strictObject({ postId: generalValidationFields.id }) }),
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await postService.restorePost(
      req.params.postId as string,
      req.user,
    );
    return successResponse({ res, status: 200, data });
  },
);
router.delete(
  "/:postId/hard",
  authentication(),
  validation({ params: z.strictObject({ postId: generalValidationFields.id }) }),
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await postService.hardDeletePost(req.params.postId as string, req.user);
    return successResponse({ res, status: 200, data });
  },
);
export default router;