"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const model_1 = require("../model");
const base_repository_1 = require("./base.repository");
class ChatRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(model_1.ChatModel);
    }
    async findOneChat({ filter, projection, options, page = "1", size = "5" }) {
        page = parseInt(page);
        size = parseInt(size);
        const doc = this.model.findOne(filter, {
            messages: { $slice: [-(page * size), size] }
        });
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
}
exports.ChatRepository = ChatRepository;
