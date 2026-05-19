"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_EXPIRES_IN = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY_ID = exports.AWS_BUCKET_NAME = exports.AWS_REGION = exports.CLIENT_ID = exports.ORIGINS = exports.SALT_ROUND = exports.TWITTERLINK = exports.INSTAGRAM = exports.FACEBOOKLINK = exports.EMAIL_APP_PASSWORD = exports.EMAIL_APP = exports.REDIS_URI = exports.ACCESS_TOKEN_EXPIRES_IN = exports.REFRESH_TOKEN_EXPIRES_IN = exports.REFRESH_USER_TOKEN_SIGNATURE = exports.REFRESH_SYSTEM_TOKEN_SIGNATURE = exports.ACCESS_USER_TOKEN_SIGNATURE = exports.ACCESS_SYSTEM_TOKEN_SIGNATURE = exports.ENC_SECRET_KEY = exports.DB_URI = exports.IV_LENGTH = exports.PORT = exports.APPLICATION_NAME = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(`./.env.${process.env.NODE_ENV}`) });
exports.APPLICATION_NAME = process.env.APPLICATION_NAME;
exports.PORT = process.env.PORT;
exports.IV_LENGTH = Number(process.env.IV_LENGTH ?? 16);
exports.DB_URI = process.env.DB_URI;
exports.ENC_SECRET_KEY = process.env.ENC_SECRET_KEY;
exports.ACCESS_SYSTEM_TOKEN_SIGNATURE = process.env
    .ACCESS_SYSTEM_TOKEN_SIGNATURE;
exports.ACCESS_USER_TOKEN_SIGNATURE = process.env
    .ACCESS_USER_TOKEN_SIGNATURE;
exports.REFRESH_SYSTEM_TOKEN_SIGNATURE = process.env
    .REFRESH_SYSTEM_TOKEN_SIGNATURE;
exports.REFRESH_USER_TOKEN_SIGNATURE = process.env
    .REFRESH_USER_TOKEN_SIGNATURE;
exports.REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1800");
exports.ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1800");
exports.REDIS_URI = process.env.REDIS_URI;
exports.EMAIL_APP = process.env.EMAIL_APP;
exports.EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
exports.FACEBOOKLINK = process.env.FACEBOOKLINK;
exports.INSTAGRAM = process.env.INSTAGRAM;
exports.TWITTERLINK = process.env.TWITTERLINK;
exports.SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "10");
exports.ORIGINS = (process.env.ORIGINS?.split(",") || []);
exports.CLIENT_ID = (process.env.CLIENT_ID?.split(",") || []);
exports.AWS_REGION = process.env.AWS_REGION;
exports.AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
exports.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
exports.AWS_SECRET_ACCESS_KEY = process.env
    .AWS_SECRET_ACCESS_KEY;
exports.AWS_EXPIRES_IN = parseInt(process.env.AWS_EXPIRES_IN || "120");
