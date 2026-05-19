import { IAuthSocket } from "../../../common/types/express.types";
import { chatService, ChatService } from "../chat.service";
import * as validators from "../chat.validation";
import { SocketValidation } from '../../../middleware/validation.middleware';
import { Server } from "socket.io";
import { redisService } from '../../../common/services/redis.service';
export class ChatEvent {
    private chatService: ChatService;
    private redisService: typeof redisService;
    constructor() {
        this.chatService = chatService;
        this.redisService = redisService;
    }
    sayHi = (socket: IAuthSocket) => {
        return socket.on("sayHi", async (data: { name: string }) => {
            try {
                await SocketValidation<{ name: string }>(validators.sayHi, data);
                console.log({ data });
                const result = this.chatService.sayHi()
                socket.emit("sayHi", result)
            } catch (error) {
                socket.emit("custom_error", error)
            }
        })
    }
    sendMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("sendMessage", async ({ content, sendTo }: { sendTo: string, content: string }) => {
            try {
                console.log({ content, sendTo });
                await this.chatService.sendMessage({ content, sendTo }, socket.data.user)
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage", { content, sendTo })
                const receiverSocketIds = await this.redisService.getSockets(sendTo)
                if (receiverSocketIds.length) {
                    socket.to(receiverSocketIds).emit("newMessage", { content, from: socket.data.user })
                }
            } catch (error) {
                socket.emit("custom_error", error)
            }
        })
    }
    sendGroupMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("sendGroupMessage", async ({ content, groupId }: { groupId: string, content: string }) => {
            try {
                console.log({ content, groupId });
                const roomId = await this.chatService.sendGroupMessage({ content, groupId }, socket.data.user)
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage", { content, sendTo: groupId })
                socket.to(roomId).emit("newMessage", { content, groupId })
            } catch (error) {
                console.log({ error });

                socket.emit("custom_error", error)
            }
        })
    }
    join_room = (socket: IAuthSocket, io: Server) => {
        return socket.on("join_room", async ({ roomId }: { roomId: string }) => {
            try {
                socket.join(roomId)
            } catch (error) {
                console.log({ error });

                socket.emit("custom_error", error)
            }
        })
    }
}
export const chatEvent = new ChatEvent()