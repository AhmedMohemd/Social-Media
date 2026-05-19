"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactStoryGQL = exports.createStoryGQL = exports.storyParamsGQL = exports.reactStory = exports.storyParams = exports.createStory = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const multer_1 = require("../../common/utils/multer");
exports.createStory = {
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().max(500).optional(),
        backgroundColor: zod_1.z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        textColor: zod_1.z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/)
            .optional(),
        file: validation_1.generalValidationFields
            .file([...multer_1.fileFieldValidation.image, ...multer_1.fileFieldValidation.video])
            .optional(),
    })
        .refine((data) => data.content || data.file, {
        error: "Content or attachment is required",
    }),
};
exports.storyParams = {
    params: zod_1.z.strictObject({ storyId: validation_1.generalValidationFields.id }),
};
exports.reactStory = {
    params: zod_1.z.strictObject({ storyId: validation_1.generalValidationFields.id }),
    query: zod_1.z.strictObject({
        react: zod_1.z.enum(["love", "0"]),
    }),
};
exports.storyParamsGQL = zod_1.z.object({
    storyId: validation_1.generalValidationFields.id,
});
exports.createStoryGQL = zod_1.z
    .object({
    content: zod_1.z.string().max(500).optional(),
    backgroundColor: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    textColor: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
})
    .refine((data) => !!data.content, {
    message: "Content is required via GQL. For media stories use REST POST /story",
    path: ["content"],
});
exports.reactStoryGQL = zod_1.z.object({
    storyId: validation_1.generalValidationFields.id,
    react: zod_1.z.enum(["love", "0"]),
});
