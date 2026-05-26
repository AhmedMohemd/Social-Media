"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvent = exports.ChatEvent = void 0;
const chat_service_1 = require("../chat.service");
const validators = __importStar(require("../chat.validation"));
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const services_1 = require("../../../common/services");
class ChatEvent {
    chatService;
    redisService;
    constructor() {
        this.chatService = chat_service_1.chatService;
        this.redisService = services_1.redisService;
    }
    sayHi = (socket) => {
        return socket.on("sayHi", async (data) => {
            try {
                await (0, validation_middleware_1.SocketValidation)(validators.sayHi, data);
                console.log({ data });
                const result = this.chatService.sayHi();
                socket.emit("sayHi", result);
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    sendMessage = (socket, io) => {
        return socket.on("sendMessage", async ({ content, sendTo }) => {
            try {
                console.log({ content, sendTo });
                await this.chatService.sendMessage({ content, sendTo }, socket.data.user);
                socket.emit("successMessage", { content, sendTo });
                const receiverSocketIds = await this.redisService.getSockets(sendTo);
                console.log("sender id:", socket.data.user._id);
                console.log("sendTo:", sendTo);
                console.log("receiverSocketIds:", receiverSocketIds);
                if (receiverSocketIds.length) {
                    socket.to(receiverSocketIds).emit("newMessage", {
                        content,
                        from: socket.data.user,
                    });
                }
            }
            catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
    sendGroupMessage = (socket, io) => {
        return socket.on("sendGroupMessage", async ({ content, groupId }) => {
            try {
                console.log({ content, groupId });
                const roomId = await this.chatService.sendGroupMessage({ content, groupId }, socket.data.user);
                socket.emit("successMessage", { content, sendTo: groupId });
                socket.to(roomId).emit("newMessage", {
                    content,
                    groupId,
                    from: socket.data.user,
                });
            }
            catch (error) {
                console.log({ error });
                socket.emit("custom_error", error);
            }
        });
    };
    join_room = (socket, io) => {
        return socket.on("join_room", async ({ roomId }) => {
            try {
                socket.join(roomId);
            }
            catch (error) {
                console.log({ error });
                socket.emit("custom_error", error);
            }
        });
    };
}
exports.ChatEvent = ChatEvent;
exports.chatEvent = new ChatEvent();
