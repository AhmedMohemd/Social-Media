import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
export const resendConfirmEmail = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};
export const confirmEmail = {
  body: resendConfirmEmail.body.safeExtend({
    otp: generalValidationFields.otp,
  }),
};
export const login = {
  body: resendConfirmEmail.body.safeExtend({
    password: generalValidationFields.password,
    FCM: z.string().optional(),
  }),
};
export const signup = {
  body: login.body
    .safeExtend({
      username: generalValidationFields.username,
      phone: generalValidationFields.phone.optional(),
      confirmPassword: generalValidationFields.confirmPassword,
      gender: generalValidationFields.gender,
    })
    .refine(
      (data) => {
        return data.password === data.confirmPassword;
      },
      { error: "Password and Confirm Password must match" },
    ),
  query: z.strictObject({ flage: z.coerce.boolean() }),
};
export const requestForgotPassword = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};
export const verifyForgotPassword = {
  body: requestForgotPassword.body.safeExtend({
    otp: generalValidationFields.otp,
  }),
};
export const resetForgotPassword = {
  body: requestForgotPassword.body
    .safeExtend({
      password: generalValidationFields.password,
      confirmPassword: generalValidationFields.confirmPassword,
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: "Password and Confirm Password must match",
    }),
};