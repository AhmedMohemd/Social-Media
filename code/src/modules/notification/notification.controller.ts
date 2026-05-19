import { Router, Request, Response, NextFunction } from "express";
import { authentication, authorization, validation } from "../../middleware";
import { successResponse } from "../../common/response";
import { notificationServiceModule } from "./notification.service";
import * as validators from "./notification.validation";
import { endPoint } from "./notification.authorization";
import {
  paginationValidationSchema,
  PaginateDto,
} from "../../common/validation";
const router = Router();
router.post(
  "/",
  authentication(),
  authorization(endPoint.admin),
  validation(validators.createNotification),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.createNotification(
      req.body,
      req.user,
    );
    return successResponse({ res, status: 201, data });
  },
);
router.get(
  "/all",
  authentication(),
  authorization(endPoint.admin),
  validation(paginationValidationSchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.allNotifications(
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, data });
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
    const data = await notificationServiceModule.myNotifications(
      req.query as PaginateDto,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.get(
  "/unread-count",
  authentication(),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.unreadCount(req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/read-all",
  authentication(),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.markAllAsRead(req.user);
    return successResponse({ res, data });
  },
);
router.patch(
  "/:notificationId/read",
  authentication(),
  validation(validators.notificationParams),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.markAsRead(
      req.params.notificationId as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.patch(
  "/:notificationId",
  authentication(),
  authorization(endPoint.admin),
  validation(validators.updateNotification),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.updateNotification(
      req.params.notificationId as string,
      req.body,
      req.user,
    );
    return successResponse({ res, data });
  },
);
router.delete(
  "/:notificationId",
  authentication(),
  authorization(endPoint.admin),
  validation(validators.notificationParams),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await notificationServiceModule.deleteNotification(
      req.params.notificationId as string,
      req.user,
    );
    return successResponse({ res, data });
  },
);
export default router;