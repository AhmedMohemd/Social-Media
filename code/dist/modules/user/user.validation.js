"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileGQL = exports.logout = exports.friend = exports.updateProfile = exports.deleteAccount = exports.restoreAccount = exports.profileCoverImages = exports.profileImage = exports.shareProfile = exports.updatePassword = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const multer_1 = require("../../common/utils/multer");
exports.updatePassword = {
    body: zod_1.z
        .strictObject({
        oldPassword: validation_1.generalValidationFields.password,
        password: validation_1.generalValidationFields.password,
        confirmPassword: validation_1.generalValidationFields.confirmPassword,
    })
        .refine((data) => data.oldPassword !== data.password, {
        error: "New password must be different from old password",
        path: ["password"],
    })
        .refine((data) => data.password === data.confirmPassword, {
        error: "Password and Confirm Password must match",
        path: ["confirmPassword"],
    }),
};
exports.shareProfile = {
    params: zod_1.z.strictObject({
        userId: validation_1.generalValidationFields.id,
    }),
};
exports.profileImage = {
    body: zod_1.z.strictObject({
        ContentType: zod_1.z.string({ error: "ContentType is required" }),
        Originalname: zod_1.z.string({ error: "Originalname is required" }),
    }),
};
exports.profileCoverImages = {
    body: zod_1.z
        .strictObject({
        files: zod_1.z
            .array(validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .min(1, { error: "At least 1 image required" })
            .max(2, { error: "Max 2 images allowed" }),
    })
        .optional(),
};
exports.restoreAccount = {
    params: zod_1.z.strictObject({
        userId: validation_1.generalValidationFields.id,
    }),
};
exports.deleteAccount = {
    params: zod_1.z.strictObject({
        userId: validation_1.generalValidationFields.id,
    }),
};
exports.updateProfile = {
    body: zod_1.z
        .strictObject({
        firstName: zod_1.z.string().min(2).max(30).optional(),
        lastName: zod_1.z.string().min(2).max(30).optional(),
        phone: validation_1.generalValidationFields.phone.optional(),
        gender: validation_1.generalValidationFields.gender,
        DOB: zod_1.z.coerce.date().optional(),
    })
        .refine((data) => Object.values(data).some((v) => v !== undefined), {
        error: "At least one field is required to update",
    }),
};
exports.friend = {
    params: zod_1.z.strictObject({
        userId: validation_1.generalValidationFields.id,
    }),
};
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.coerce.number().optional(),
        FCM: zod_1.z.string().optional(),
    }),
};
exports.profileGQL = zod_1.z.strictObject({
    search: zod_1.z.string().min(2).optional()
});
