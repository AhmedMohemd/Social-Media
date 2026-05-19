"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const repository_1 = require("../../DB/repository");
const exceptions_1 = require("../../common/exceptions");
const object_Id_1 = require("../../common/utils/object.Id");
const enums_1 = require("../../common/enums");
const node_crypto_1 = require("node:crypto");
const services_1 = require("../../common/services");
const enums_2 = require("../../common/enums");
class ChatService {
    chatRepository;
    userRepository;
    s3Service;
    constructor() {
        this.chatRepository = new repository_1.ChatRepository();
        this.userRepository = new repository_1.UserRepository();
        this.s3Service = services_1.s3Service;
    }
    sayHi = () => {
        return "Done";
    };
    async getChat(participantId, { page, size }, user) {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                participants: { $all: [user._id, (0, object_Id_1.toObjectId)(participantId)] },
                type: enums_1.ChatEnum.ovo,
            },
            options: {
                populate: [{ path: "participants" }],
            },
            page,
            size,
        });
        if (!chat) {
            throw new exceptions_1.NotFoundException("Fail to find Matching Conversation");
        }
        return chat.toJSON();
    }
    async sendMessage({ content, sendTo }, user) {
        let chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                participants: { $all: [user._id, (0, object_Id_1.toObjectId)(sendTo)] },
                type: enums_1.ChatEnum.ovo,
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
                    participants: [user._id, (0, object_Id_1.toObjectId)(sendTo)],
                    createdBy: user._id,
                    type: enums_1.ChatEnum.ovo,
                    messages: [{ content, createdBy: user._id }],
                },
            });
        }
    }
    async createGroup({ participantsIds = [], group, }, user, file) {
        participantsIds = [
            ...new Set(participantsIds.map((ele) => (0, object_Id_1.toObjectId)(ele))),
        ];
        const users = await this.userRepository.find({
            filter: {
                _id: { $in: participantsIds },
                friends: { $in: [user._id] },
            },
        });
        if (users.length !== participantsIds.length) {
            throw new exceptions_1.NotFoundException("Fail to find all participants");
        }
        let group_image;
        const roomId = (0, node_crypto_1.randomUUID)();
        const path = `Chat/group/${roomId}`;
        if (file) {
            group_image = await this.s3Service.uploadAsset({
                file,
                path,
                storageApproach: enums_2.StorageApproachEnum.MEMORY,
            });
        }
        const chatingGroup = await this.chatRepository.createOne({
            data: {
                participants: [...participantsIds, user._id],
                createdBy: user._id,
                messages: [],
                type: enums_1.ChatEnum.ovm,
                group,
                roomId,
                group_image,
            },
        });
        return chatingGroup.toJSON();
    }
    async getGroupChat(groupId, { page, size }, user) {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                _id: (0, object_Id_1.toObjectId)(groupId),
                participants: { $in: [user._id] },
                type: enums_1.ChatEnum.ovm,
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
            throw new exceptions_1.NotFoundException("Fail to find Matching Conversation");
        }
        return chat.toJSON();
    }
    async sendGroupMessage({ content, groupId }, user) {
        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: (0, object_Id_1.toObjectId)(groupId),
                participants: { $in: [user._id] },
                type: enums_1.ChatEnum.ovm,
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
            throw new exceptions_1.NotFoundException("Fail to find Matching Group Conversation");
        }
        return chat.roomId;
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
