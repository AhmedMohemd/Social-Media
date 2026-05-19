"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ data, res, status = 200, message = "Success", }) => {
    return res.status(status).json({
        status,
        message,
        data,
    });
};
exports.successResponse = successResponse;
