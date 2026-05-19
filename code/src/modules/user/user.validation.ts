import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";
export const updatePassword = {
  body: z
    .strictObject({
      oldPassword: generalValidationFields.password,
      password: generalValidationFields.password,
      confirmPassword: generalValidationFields.confirmPassword,
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
export const shareProfile = {
  params: z.strictObject({
    userId: generalValidationFields.id,
  }),
};
export const profileImage = {
  body: z.strictObject({
    ContentType: z.string({ error: "ContentType is required" }),
    Originalname: z.string({ error: "Originalname is required" }),
  }),
};
export const profileCoverImages = {
  body: z
    .strictObject({
      files: z
        .array(generalValidationFields.file(fileFieldValidation.image))
        .min(1, { error: "At least 1 image required" })
        .max(2, { error: "Max 2 images allowed" }),
    })
    .optional(),
};
export const restoreAccount = {
  params: z.strictObject({
    userId: generalValidationFields.id,
  }),
};
export const deleteAccount = {
  params: z.strictObject({
    userId: generalValidationFields.id,
  }),
};
export const updateProfile = {
  body: z
    .strictObject({
      firstName: z.string().min(2).max(30).optional(),
      lastName: z.string().min(2).max(30).optional(),
      phone: generalValidationFields.phone.optional(),
      gender: generalValidationFields.gender,
      DOB: z.coerce.date().optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
      error: "At least one field is required to update",
    }),
};
export const friend = {
  params: z.strictObject({
    userId: generalValidationFields.id,
  }),
};
export const logout = {
  body: z.strictObject({
    flag: z.coerce.number().optional(),
    FCM: z.string().optional(),
  }),
};
export const profileGQL = z.strictObject({
  search: z.string().min(2).optional()
})