"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = __importDefault(require("../user.service"));
const middleware_1 = require("../../../middleware");
const user_authorization_1 = require("../user.authorization");
const user_validation_1 = require("../user.validation");
class UserResolver {
    service;
    constructor() {
        this.service = user_service_1.default;
    }
    profile = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(user_validation_1.profileGQL, args);
        await (0, middleware_1.GQLAuthorization)(user_authorization_1.endPoint.profile, user);
        const data = await this.service.profile(user);
        return {
            message: `Hello`, data
        };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
