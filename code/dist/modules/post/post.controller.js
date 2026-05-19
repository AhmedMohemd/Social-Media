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
const validators = __importStar(require("./post.validation"));
const post_service_1 = require("./post.service");
const validation_1 = require("../../common/validation");
const comment_1 = require("../comment");
const validation_2 = require("../../common/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use("/:postId/comment", comment_1.commentRouter);
router.get("/feed", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validation_1.paginationValidationSchema), async (req, res, next) => {
    const data = await post_service_1.postService.vewsFeed(req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.get("/profile", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validation_1.paginationValidationSchema), async (req, res, next) => {
    const data = await post_service_1.postService.profilePost(req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.get("/profile/:userId", (0, middleware_1.authentication)(), (0, middleware_1.validation)({
    params: zod_1.z.strictObject({ userId: validation_2.generalValidationFields.id }),
    query: validation_1.paginationValidationSchema.query,
}), async (req, res, next) => {
    const data = await post_service_1.postService.userProfilePost(req.params.userId, req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.get("/tagged", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validation_1.paginationValidationSchema), async (req, res, next) => {
    const data = await post_service_1.postService.taggedPosts(req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.get("/dashboard", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await post_service_1.postService.profileDashboard(req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validation_1.paginationValidationSchema), async (req, res, next) => {
    const data = await post_service_1.postService.postList(req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.post("/", (0, middleware_1.authentication)(), (0, multer_1.cloudFileUpload)({ validation: multer_1.fileFieldValidation.image }).array("attachments", 2), (0, middleware_1.validation)(validators.createPost), async (req, res, next) => {
    const data = await post_service_1.postService.createPost({ ...req.body, files: req.files }, req.user);
    return (0, response_1.successResponse)({ res, status: 201, data });
});
router.patch("/:postId", (0, middleware_1.authentication)(), (0, multer_1.cloudFileUpload)({ validation: multer_1.fileFieldValidation.image }).array("attachments", 2), (0, middleware_1.validation)(validators.updatePost), async (req, res, next) => {
    const data = await post_service_1.postService.updatePost(req.params, req.body, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.patch("/:postId/react", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.reactPost), async (req, res, next) => {
    const data = await post_service_1.postService.reactPost(req.params, req.query, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.delete("/:postId", (0, middleware_1.authentication)(), (0, middleware_1.validation)({ params: zod_1.z.strictObject({ postId: validation_2.generalValidationFields.id }) }), async (req, res, next) => {
    const data = await post_service_1.postService.softDeletePost(req.params.postId, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.patch("/:postId/restore", (0, middleware_1.authentication)(), (0, middleware_1.validation)({ params: zod_1.z.strictObject({ postId: validation_2.generalValidationFields.id }) }), async (req, res, next) => {
    const data = await post_service_1.postService.restorePost(req.params.postId, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
router.delete("/:postId/hard", (0, middleware_1.authentication)(), (0, middleware_1.validation)({ params: zod_1.z.strictObject({ postId: validation_2.generalValidationFields.id }) }), async (req, res, next) => {
    const data = await post_service_1.postService.hardDeletePost(req.params.postId, req.user);
    return (0, response_1.successResponse)({ res, status: 200, data });
});
exports.default = router;
