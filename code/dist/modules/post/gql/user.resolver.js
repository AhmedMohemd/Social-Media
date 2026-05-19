"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolver = exports.UserResolver = void 0;
const user_service_1 = __importDefault(require("../user.service"));
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_1.default;
    }
    profile = async (parent, args) => {
        console.log({ this: this });
        const data = await this.userService.profile({});
        return { message: `Hello`, data };
    };
}
exports.UserResolver = UserResolver;
exports.userResolver = new UserResolver();
