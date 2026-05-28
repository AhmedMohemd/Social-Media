import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import authServics from "./auth.service";
import { successResponse } from "../../common/response";
import * as validators from "./auth.validation";
import { validation } from "../../middleware";
import { IloginResponse } from "./auth.entity";
const router = Router();
router.post(
  "/login",
  validation(validators.login),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await authServics.login(
      req.body,
      `${req.protocol}://${req.host}`,
    );
    return successResponse<IloginResponse>({ res, data });
  },
);
router.post(
  "/signup",
  validation(validators.signup),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    const data = await authServics.signup(req.body);
    return successResponse<any>({ res, status: 201, data });
  },
);
router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    await authServics.confirmEmail(req.body);
    return successResponse({ res });
  },
);
router.post(
  "/resend-confirm-email",
  validation(validators.resendConfirmEmail),
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response> => {
    await authServics.resendConfirmEmail(req.body);
    return successResponse({ res });
  },

  router.post(
    "/signup/gmail",
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response> => {
      // console.log(req.body);
      const { status, credentials } = await authServics.signupWithGmail(
        req.body.idToken,
        `${req.protocol}://${req.host}`,
      );
      return successResponse({ res, status, data: { credentials } });
    },
  ),
);
router.post(
  "/request-forgot-password",
  validation(validators.requestForgotPassword),
  async (req: Request, res: Response): Promise<Response> => {
    await authServics.requestForgotPassword(req.body);
    return successResponse({ res });
  },
);
router.patch(
  "/verify-forgot-password",
  validation(validators.verifyForgotPassword),
  async (req: Request, res: Response): Promise<Response> => {
    await authServics.verifyForgotPasswordOtp(req.body);
    return successResponse({ res });
  },
);
router.patch(
  "/reset-forgot-password",
  validation(validators.resetForgotPassword),
  async (req: Request, res: Response): Promise<Response> => {
    await authServics.resetForgotPasswordOtp(req.body);
    return successResponse({ res });
  },
);
export default router;