"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.reactCommentGQL = exports.replyOnCommentGQL = exports.createCommentGQL = exports.commentListGQL = exports.replyOnComment = exports.reactComment = exports.createComment = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const multer_1 = require("../../common/utils/multer");
exports.createComment = {
    params: zod_1.z.strictObject({
        postId: validation_1.generalValidationFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().optional(),
        files: zod_1.z
            .array(validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
        tags: zod_1.z.array(validation_1.generalValidationFields.id).optional(),
    })
        .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Content is required",
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length != args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplicated tag",
                });
            }
        }
    }),
};
exports.reactComment = {
    params: zod_1.z.strictObject({
        postId: validation_1.generalValidationFields.id,
        commentId: validation_1.generalValidationFields.id,
    }),
    query: zod_1.z.strictObject({
        react: zod_1.z.enum(["like", "love", "haha", "wow", "sad", "angry", "0"]),
    }),
};
exports.replyOnComment = {
    params: zod_1.z.strictObject({
        postId: validation_1.generalValidationFields.id,
        commentId: validation_1.generalValidationFields.id,
    }),
    body: exports.createComment.body,
};
exports.commentListGQL = zod_1.z.object({
    postId: validation_1.generalValidationFields.id,
    page: zod_1.z.number().optional(),
    size: zod_1.z.number().optional(),
});
exports.createCommentGQL = zod_1.z
    .object({
    postId: validation_1.generalValidationFields.id,
    content: zod_1.z.string().optional(),
    tags: zod_1.z.array(validation_1.generalValidationFields.id).optional(),
})
    .superRefine((args, ctx) => {
    if (!args.content) {
        ctx.addIssue({
            code: "custom",
            path: ["content"],
            message: "Content is required via GQL (no file upload)",
        });
    }
    if (args.tags?.length) {
        const uniqueTags = [...new Set(args.tags)];
        if (uniqueTags.length !== args.tags.length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Duplicated tag",
            });
        }
    }
});
exports.replyOnCommentGQL = zod_1.z
    .object({
    postId: validation_1.generalValidationFields.id,
    commentId: validation_1.generalValidationFields.id,
    content: zod_1.z.string().optional(),
    tags: zod_1.z.array(validation_1.generalValidationFields.id).optional(),
})
    .superRefine((args, ctx) => {
    if (!args.content) {
        ctx.addIssue({
            code: "custom",
            path: ["content"],
            message: "Content is required via GQL (no file upload)",
        });
    }
});
exports.reactCommentGQL = zod_1.z.object({
    postId: validation_1.generalValidationFields.id,
    commentId: validation_1.generalValidationFields.id,
    react: zod_1.z.enum(["like", "love", "haha", "wow", "sad", "angry", "0"]),
});
exports.updateComment = {
    params: zod_1.z.strictObject({
        postId: validation_1.generalValidationFields.id,
        commentId: validation_1.generalValidationFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().min(1).optional(),
        files: zod_1.z
            .array(validation_1.generalValidationFields.file(multer_1.fileFieldValidation.image))
            .optional(),
    })
        .superRefine((args, ctx) => {
        if (!args.content && !args.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Content or file is required",
            });
        }
    }),
};
exports.deleteComment = {
    params: zod_1.z.strictObject({
        postId: validation_1.generalValidationFields.id,
        commentId: validation_1.generalValidationFields.id,
    }),
};
