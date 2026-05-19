import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";
export const createComment = {
  params: z.strictObject({
    postId: generalValidationFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().optional(),
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .optional(),
      tags: z.array(generalValidationFields.id).optional(),
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
export const reactComment = {
  params: z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
  }),
  query: z.strictObject({
    react: z.enum(["like", "love", "haha", "wow", "sad", "angry", "0"]),
  }),
};
export const replyOnComment = {
  params: z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
  }),
  body: createComment.body,
};
export const commentListGQL = z.object({
  postId: generalValidationFields.id,
  page: z.number().optional(),
  size: z.number().optional(),
});
export const createCommentGQL = z
  .object({
    postId: generalValidationFields.id,
    content: z.string().optional(),
    tags: z.array(generalValidationFields.id).optional(),
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
export const replyOnCommentGQL = z
  .object({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
    content: z.string().optional(),
    tags: z.array(generalValidationFields.id).optional(),
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
export const reactCommentGQL = z.object({
  postId: generalValidationFields.id,
  commentId: generalValidationFields.id,
  react: z.enum(["like", "love", "haha", "wow", "sad", "angry", "0"]),
});