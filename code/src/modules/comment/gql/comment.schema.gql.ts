import * as CommentGQLTypes from "./comment.types.gql";
import * as CommentGQLArgs from "./comment.args.gql";
import { commentResolver, CommentResolver } from "./comment.resolver";
export class CommentGQLSchema {
    private commentResolver: CommentResolver;
    constructor() {
        this.commentResolver = commentResolver;
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
                description:
                    'React on a comment: like | love | haha | wow | sad | angry | "0" to remove',
                resolve: this.commentResolver.reactOnComment,
            },
        };
    }
}
export const commentGQLSchema = new CommentGQLSchema();