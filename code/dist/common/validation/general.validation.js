"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationValidationSchema = exports.generalValidationFields = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.generalValidationFields = {
    id: zod_1.z.string().refine((value) => {
        return mongoose_1.Types.ObjectId.isValid(value);
    }, "invalid ObjectId"),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    email: zod_1.z.string({ error: "Email is required" }).email(),
    password: zod_1.z
        .string({ error: "Password is required" })
        .min(6, { error: "Password must be at least 6 characters long" })
        .max(30, { error: "Password must be at most 30 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {
        error: "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character",
    }),
    username: zod_1.z.coerce
        .string({ error: "Username is required" })
        .min(2, { error: "Username must be at least 2 characters long" })
        .max(30, { error: "Username must be at most 30 characters long" }),
    confirmPassword: zod_1.z.string({ error: "Confirm Password is required" }),
    phone: zod_1.z.string().regex(/^(00201|\+201|01)[0|1|2|5]\d{8}$/),
    gender: zod_1.z
        .enum(["male", "female", "not specified"], { error: "Gender is required" })
        .optional(),
    file: function (mimetype) {
        return zod_1.z
            .strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number(),
        })
            .superRefine((args, ctx) => {
            if (!args.path && !args.buffer) {
                ctx.addIssue({
                    code: "custom",
                    message: "buffer is required",
                    path: ["buffer"],
                });
            }
        });
    },
};
exports.paginationValidationSchema = {
    query: zod_1.z.strictObject({
        page: zod_1.z.coerce.number().optional(),
        size: zod_1.z.coerce.number().optional(),
        search: zod_1.z.string().optional(),
    }),
};
