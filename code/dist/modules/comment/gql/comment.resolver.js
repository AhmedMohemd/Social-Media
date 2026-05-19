"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResolver = exports.CommentResolver = void 0;
const comment_service_1 = require("../comment.service");
const middleware_1 = require("../../../middleware");
const comment_validation_1 = require("../comment.validation");
class CommentResolver {
    commentService;
    constructor() {
        this.commentService = comment_service_1.commentService;
    }
    commentList = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(comment_validation_1.commentListGQL, args);
        const data = await this.commentService.listComments(args.postId, { page: args.page, size: args.size }, user);
        return { message: "Done", data };
    };
    createComment = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(comment_validation_1.createCommentGQL, args);
        const data = await this.commentService.createComment({ postId: args.postId }, { content: args.content, files: [], tags: args.tags }, user);
        return { message: "Comment created", data };
    };
    replyOnComment = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(comment_validation_1.replyOnCommentGQL, args);
        const data = await this.commentService.replyOnComment({ postId: args.postId, commentId: args.commentId }, { content: args.content, files: [], tags: args.tags }, user);
        return { message: "Reply created", data };
    };
    reactOnComment = async (parent, args, { user }) => {
        await (0, middleware_1.GQLValidation)(comment_validation_1.reactCommentGQL, args);
        const data = await this.commentService.reactComment({ postId: args.postId, commentId: args.commentId }, { react: args.react }, user);
        return { message: "Done", data };
    };
}
exports.CommentResolver = CommentResolver;
exports.commentResolver = new CommentResolver();
