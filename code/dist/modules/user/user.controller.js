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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const user_service_1 = __importDefault(require("./user.service"));
const middleware_1 = require("../../middleware");
const user_authorization_1 = require("./user.authorization");
const enums_1 = require("../../common/enums");
const multer_1 = require("../../common/utils/multer");
const validators = __importStar(require("./user.validation"));
const chat_1 = require("../chat");
const router = (0, express_1.Router)();
router.use('/:userId/chat', chat_1.chatRouter);
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_authorization_1.endPoint.profile), async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.get("/profile/:userId", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.shareProfile), async (req, res, next) => {
    const data = await user_service_1.default.getOtherProfile(req.params.userId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/update", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.updateProfile), async (req, res, next) => {
    const data = await user_service_1.default.updateProfile(req.body, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/update-password", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.updatePassword), async (req, res, next) => {
    await user_service_1.default.updatePassword(req.body, req.user);
    return (0, response_1.successResponse)({ res, message: "Password updated successfully" });
});
router.patch("/profile-image", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.profileImage), async (req, res, next) => {
    const data = await user_service_1.default.profileImage(req.body, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/profile-cover-images", (0, middleware_1.authentication)(), (0, multer_1.cloudFileUpload)({
    validation: multer_1.fileFieldValidation.image,
    storageApproach: enums_1.StorageApproachEnum.DISK,
}).array("attachments", 2), async (req, res, next) => {
    const data = await user_service_1.default.profileCoverImages(req.files, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/friend/:userId", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.friend), async (req, res, next) => {
    const data = await user_service_1.default.addFriend(req.params.userId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.delete("/friend/:userId", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.friend), async (req, res, next) => {
    const data = await user_service_1.default.removeFriend(req.params.userId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.post("/logout", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.logout), async (req, res, next) => {
    const status = await user_service_1.default.logout(req.body, req.user, req.decoded);
    return (0, response_1.successResponse)({ res, status });
});
router.post("/rotate-token", (0, middleware_1.authentication)(enums_1.TokenTypeEnum.REFRESH), async (req, res, next) => {
    const credentials = await user_service_1.default.rotateToken(req.user, req.decoded, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, status: 201, data: { ...credentials } });
});
router.delete("/", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await user_service_1.default.softDeleteAccount(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.delete("/hard", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await user_service_1.default.deleteAccount(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.patch("/restore/:userId", (0, middleware_1.authentication)(), (0, middleware_1.validation)(validators.restoreAccount), async (req, res, next) => {
    const data = await user_service_1.default.restoreAccount(req.params.userId, req.user);
    return (0, response_1.successResponse)({ res, data });
});
exports.default = router;
