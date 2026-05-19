import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";
export const createStory = {
  body: z
    .strictObject({
      content: z.string().max(500).optional(),
      backgroundColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      textColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
      file: generalValidationFields
        .file([...fileFieldValidation.image, ...fileFieldValidation.video])
        .optional(),
    })
    .refine((data) => data.content || data.file, {
      error: "Content or attachment is required",
    }),
};
export const storyParams = {
  params: z.strictObject({ storyId: generalValidationFields.id }),
};
export const reactStory = {
  params: z.strictObject({ storyId: generalValidationFields.id }),
  query: z.strictObject({
    react: z.enum(["love", "0"]),
  }),
};
export const storyParamsGQL = z.object({
  storyId: generalValidationFields.id,
});
export const createStoryGQL = z
  .object({
    content: z.string().max(500).optional(),
    backgroundColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
    textColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  })
  .refine((data) => !!data.content, {
    message:
      "Content is required via GQL. For media stories use REST POST /story",
    path: ["content"],
  });
export const reactStoryGQL = z.object({
  storyId: generalValidationFields.id,
  react: z.enum(["love", "0"]),
});