"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const response_1 = require("../../common/response");
const chat_service_1 = require("./chat.service");
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chat = await chat_service_1.chatService.getChat(req.params.userId, req.query, req.user);
    return (0, response_1.successResponse)({ res, data: { chat } });
});
router.get("/my-chats", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chats = await chat_service_1.chatService.getMyChats(req.user);
    return (0, response_1.successResponse)({ res, data: { chats } });
});
router.post("/", (0, middleware_1.authentication)(), async (req, res, next) => {
    await chat_service_1.chatService.sendMessage({ content: req.body.content, sendTo: req.body.sendTo }, req.user);
    return (0, response_1.successResponse)({ res, message: "Message sent successfully" });
});
router.get("/group/:groupId", (0, middleware_1.authentication)(), async (req, res, next) => {
    const chat = await chat_service_1.chatService.getGroupChat(req.params.groupId, req.query, req.user);
    return (0, response_1.successResponse)({ res, data: { chat } });
});
router.post("/group", (0, middleware_1.authentication)(), (0, multer_1.cloudFileUpload)({ validation: multer_1.fileFieldValidation.image }).single("attachment"), async (req, res, next) => {
    const chat = await chat_service_1.chatService.createGroup(req.body, req.user, req.file);
    return (0, response_1.successResponse)({ res, data: { chat } });
});
router.post("/group/:groupId/message", (0, middleware_1.authentication)(), async (req, res, next) => {
    const roomId = await chat_service_1.chatService.sendGroupMessage({ content: String(req.body.content ?? ""), groupId: String(req.params.groupId) }, req.user);
    return (0, response_1.successResponse)({ res, message: "Message sent successfully", data: { roomId } });
});
exports.default = router;
