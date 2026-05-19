"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const model_1 = require("../model");
const base_repository_1 = require("./base.repository");
class PostRepository extends base_repository_1.DatabaseRepository {
    constructor() {
        super(model_1.PostModel);
    }
}
exports.PostRepository = PostRepository;
