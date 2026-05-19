import { NextFunction, Request, Response, Router } from "express";
import { authentication } from "../../middleware";
import { successResponse } from "../../common/response";
import { chatService } from "./chat.service";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
const router = Router({ mergeParams: true })
router.get(
    "/",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.getChat(req.params.userId as string, req.query as { page?: string; size?: string }, req.user);
        return successResponse({ res, data: { chat } })
    }
)
//===============================
router.post(
    "/",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        await chatService.sendMessage(
            { content: req.body.content, sendTo: req.body.sendTo },
            req.user
        );
        return successResponse({ res, message: "Message sent successfully" });

    }
);

router.get(
    "/group/:groupId",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.getGroupChat(req.params.groupId as string, req.query as { page?: string; size?: string }, req.user);
        return successResponse({ res, data: { chat } })
    }
)
router.post(
    "/group",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).single("attachment"),
    async (req: Request, res: Response, next: NextFunction) => {
        const chat = await chatService.createGroup(req.body, req.user, req.file as Express.Multer.File);
        return successResponse({ res, data: { chat } })
    }
)
//===============================
router.post(
    "/group/:groupId/message",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        const roomId = await chatService.sendGroupMessage(
            { content: String(req.body.content ?? ""), groupId: String(req.params.groupId) },
            req.user
        );
        return successResponse({ res, message: "Message sent successfully", data: { roomId } });
    }
);
export default router