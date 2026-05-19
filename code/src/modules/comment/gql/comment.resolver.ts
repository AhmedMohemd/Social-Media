import { commentService, CommentService } from "../comment.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLValidation } from "../../../middleware";
import {
    createCommentGQL,
    replyOnCommentGQL,
    reactCommentGQL,
    commentListGQL,
} from "../comment.validation";
import { IPaginate, IComment } from "../../../common/interfaces";
export class CommentResolver {
    private readonly commentService: CommentService;
    constructor() {
        this.commentService = commentService;
    }
    commentList = async (
        parent: unknown,
        args: { postId: string; page?: number; size?: number },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IPaginate<IComment> }> => {
        await GQLValidation(commentListGQL, args);
        const data = await this.commentService.listComments(
            args.postId,
            { page: args.page, size: args.size },
            user,
        );
        return { message: "Done", data };
    };
    createComment = async (
        parent: unknown,
        args: { postId: string; content?: string; tags?: string[] },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IComment }> => {
        await GQLValidation(createCommentGQL, args);
        const data = await this.commentService.createComment(
            { postId: args.postId },
            { content: args.content, files: [], tags: args.tags },
            user,
        );
        return { message: "Comment created", data };
    };
    replyOnComment = async (
        parent: unknown,
        args: {
            postId: string;
            commentId: string;
            content?: string;
            tags?: string[];
        },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IComment }> => {
        await GQLValidation(replyOnCommentGQL, args);
        const data = await this.commentService.replyOnComment(
            { postId: args.postId, commentId: args.commentId },
            { content: args.content, files: [], tags: args.tags },
            user,
        );
        return { message: "Reply created", data };
    };
    reactOnComment = async (
        parent: unknown,
        args: { postId: string; commentId: string; react: string },
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IComment }> => {
        await GQLValidation(reactCommentGQL, args);
        const data = await this.commentService.reactComment(
            { postId: args.postId, commentId: args.commentId },
            { react: args.react },
            user,
        );
        return { message: "Done", data };
    };
}
export const commentResolver = new CommentResolver();