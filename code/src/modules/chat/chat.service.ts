import { HydratedDocument } from "mongoose";
import { IChat, IUser } from "../../common/interfaces";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { NotFoundException } from "../../common/exceptions";
import { toObjectId } from "../../common/utils/object.Id";
import { ChatEnum } from "../../common/enums";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { s3Service, S3Service } from "../../common/services";
import { StorageApproachEnum } from "../../common/enums";
export class ChatService {
    private chatRepository: ChatRepository;
    private userRepository: UserRepository;
    private s3Service: S3Service;
    constructor() {
        this.chatRepository = new ChatRepository();
        this.userRepository = new UserRepository();
        this.s3Service = s3Service;
    }
    sayHi = () => {
        return "Done";
    };
    async getChat(
        participantId: string,
        { page, size }: { page?: string; size?: string },
        user: HydratedDocument<IUser>,
    ): Promise<IChat> {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                participants: { $all: [user._id, toObjectId(participantId)] },
                type: ChatEnum.ovo,
            },
            options: {
                populate: [{ path: "participants"}],
            },
            page,
            size,
        });
        if (!chat) {
            throw new NotFoundException("Fail to find Matching Conversation");
        }
        return chat.toJSON();
    }
    async sendMessage(
        { content, sendTo }: { content: string; sendTo: string },
        user: HydratedDocument<IUser>,
    ): Promise<void> {
        let chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                participants: { $all: [user._id, toObjectId(sendTo)] },
                type: ChatEnum.ovo,
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy: user._id,
                    },
                },
            },
        });
        if (!chat) {
            chat = await this.chatRepository.createOne({
                data: {
                    participants: [user._id, toObjectId(sendTo)],
                    createdBy: user._id,
                    type: ChatEnum.ovo,
                    messages: [{ content, createdBy: user._id }],
                },
            });
        }
    }
    async createGroup(
        {
            participantsIds = [],
            group,
        }: { participantsIds: string[] | Types.ObjectId[]; group: string },
        user: HydratedDocument<IUser>,
        file?: Express.Multer.File,
    ): Promise<IChat> {
        participantsIds = [
            ...new Set(
                participantsIds.map((ele) => toObjectId(ele as string)),
            ),
        ];
        const users = await this.userRepository.find({
            filter: {
                _id: { $in: participantsIds },
                friends: { $in: [user._id] },
            },
        });
        if (users.length !== participantsIds.length) {
            throw new NotFoundException("Fail to find all participants");
        }
        let group_image!: string;
        const roomId = randomUUID();
        const path = `Chat/group/${roomId}`;
        if (file) {
            group_image = await this.s3Service.uploadAsset({
                file,
                path,
                storageApproach: StorageApproachEnum.MEMORY,
            });
        }
        const chatingGroup = await this.chatRepository.createOne({
            data: {
                participants: [...participantsIds, user._id],
                createdBy: user._id,
                messages: [],
                type: ChatEnum.ovm,
                group,
                roomId,
                group_image,
            },
        });
        return chatingGroup.toJSON();
    }
    async getGroupChat(
        groupId: string,
        { page, size }: { page?: string; size?: string },
        user: HydratedDocument<IUser>,
    ): Promise<IChat> {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                _id: toObjectId(groupId),
                participants: { $in: [user._id] },
                type: ChatEnum.ovm,
            },
            options: {
                populate: [
                    { path: "participants" },
                    { path: "messages.createdBy" },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new NotFoundException("Fail to find Matching Conversation");
        }
        return chat.toJSON();
    }
    async sendGroupMessage(
        { content, groupId }: { content: string; groupId: string },
        user: HydratedDocument<IUser>,
    ): Promise<string> {
        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(groupId),
                participants: { $in: [user._id] },
                type: ChatEnum.ovm,
            },
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy: user._id,
                    },
                },
            },
        });
        if (!chat) {
            throw new NotFoundException("Fail to find Matching Group Conversation");
        }
        return chat.roomId;
    }
}
export const chatService = new ChatService();