"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (error, req, res, next) => {
    if (error.name == "MulterError") {
        error.statusCode = 400;
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        message: error.message || "Internal Server Error",
        stack: error.stack,
        cause: error.cause,
        error,
    });
};
exports.globalErrorHandler = globalErrorHandler;
