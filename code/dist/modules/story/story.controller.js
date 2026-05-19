"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const multer_1 = require("../../common/utils/multer");
const response_1 = require("../../common/response");
const story_service_1 = require("./story.service");
const validators = __importStar(require("./story.validation"));
const enums_1 = require("../../common/enums");
const router = (0, express_1.Router)();
router.post("/", (0, middleware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: [...multer_1.fileFieldValidation.image, ...multer_1.fileFieldValidation.video],
    storageApproach: enums_1.StorageApproachEnum.DISK,
    maxSize: 50,
}).single("attachment"), async (req, res, next) => {
    const data = await story_service_1.storyService.createStory({ ...req.body, file: req.file }, req.user);
    return (0, response_1.successResponse)({ res, status: 201, data });
});
router.get("/feed", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await story_service_1.storyService.getStoriesFeed(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.get("/my", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await story_service_1.storyService.getMyStories(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/:storyId/view", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.storyParams), async (req, res, next) => {
    const data = await story_service_1.storyService.viewStory(req.params.storyId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.get("/:storyId/viewers", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.storyParams), async (req, res, next) => {
    const data = await story_service_1.storyService.storyViewers(req.params.storyId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/:storyId/react", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.reactStory), async (req, res, next) => {
    const data = await story_service_1.storyService.reactStory(req.params.storyId, req.query.react, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.delete("/:storyId", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.storyParams), async (req, res, next) => {
    const data = await story_service_1.storyService.deleteStory(req.params.storyId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
exports.default = router;
