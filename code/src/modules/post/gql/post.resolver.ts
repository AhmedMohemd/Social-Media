import { postService, PostService } from "../post.service";
import { IPaginate, IPost } from "../../../common/interfaces";
import { IAuthUser } from "../../../common/types/express.types";
import {
    PaginateDto,
    paginationValidationSchema,
} from "../../../common/validation";
import { GQLValidation } from "../../../middleware";
import { reactOnPostGQL } from "../post.validation";
import { ReactOnPostArgsDto } from "../post.dto";
export class PostResolver {
    private postService: PostService;
    constructor() {
        this.postService = postService;
    }
    postList = async (
        parent: unknown,
        args: PaginateDto,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IPaginate<IPost> }> => {
        await GQLValidation<PaginateDto>(paginationValidationSchema.query, args);
        const data = await this.postService.postList(args, user);
        return { message: "Done", data };
    };
    reactOnPost = async (
        parent: unknown,
        { postId, react }: ReactOnPostArgsDto,
        { user }: IAuthUser,
    ): Promise<{ message: string; data: IPost }> => {
        await GQLValidation<ReactOnPostArgsDto>(reactOnPostGQL, { postId, react });
        const data = await this.postService.reactPost({ postId }, { react }, user);
        return { message: "Done", data };
    };
}
export const postResolver = new PostResolver();