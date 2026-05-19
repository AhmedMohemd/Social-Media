"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const enums_1 = require("../../common/enums");
exports.endPoint = {
    admin: [enums_1.RoleEnum.ADMIN],
    user: [enums_1.RoleEnum.USER, enums_1.RoleEnum.ADMIN],
};
