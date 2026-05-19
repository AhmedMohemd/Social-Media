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
exports.commentGQLSchema = exports.CommentGQLSchema = void 0;
const CommentGQLTypes = __importStar(require("./comment.types.gql"));
const CommentGQLArgs = __importStar(require("./comment.args.gql"));
const comment_resolver_1 = require("./comment.resolver");
class CommentGQLSchema {
    commentResolver;
    constructor() {
        this.commentResolver = comment_resolver_1.commentResolver;
    }
    registerQuery() {
        return {
            commentList: {
                type: CommentGQLTypes.commentList,
                args: CommentGQLArgs.commentList,
                description: "Get all root comments for a post (with nested replies)",
                resolve: this.commentResolver.commentList,
            },
        };
    }
    registerMutation() {
        return {
            createComment: {
                type: CommentGQLTypes.commentMutationResponse,
                args: CommentGQLArgs.createComment,
                description: "Create a comment on a post",
                resolve: this.commentResolver.createComment,
            },
            replyOnComment: {
                type: CommentGQLTypes.commentMutationResponse,
                args: CommentGQLArgs.replyOnComment,
                description: "Reply to an existing comment",
                resolve: this.commentResolver.replyOnComment,
            },
            reactOnComment: {
                type: CommentGQLTypes.reactOnCommentResponse,
                args: CommentGQLArgs.reactOnComment,
                description: 'React on a comment: like | love | haha | wow | sad | angry | "0" to remove',
                resolve: this.commentResolver.reactOnComment,
            },
        };
    }
}
exports.CommentGQLSchema = CommentGQLSchema;
exports.commentGQLSchema = new CommentGQLSchema();
