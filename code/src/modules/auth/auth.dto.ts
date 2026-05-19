import { z } from "zod"
import { confirmEmail, login, resendConfirmEmail, signup } from "./auth.validation";
export type LoginDTO = z.infer<typeof login.body>;
export type SignupDTO = z.infer<typeof signup.body>;
export type ConfirmEmailDTO = z.infer<typeof confirmEmail.body>;
export type ResendConfirmEmailDTO = z.infer<typeof resendConfirmEmail.body>;