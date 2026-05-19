import userService, { UserService } from "../user.service"
import { IAuthUser } from "../../../common/types/express.types"
import { GQLAuthorization, GQLValidation } from "../../../middleware"
import { endPoint } from "../user.authorization"
import { profileGQL } from "../user.validation"
export class UserResolver {
    private readonly service: UserService
    constructor() {
        this.service = userService
        // this.profile = this.profile.bind(this)
    }
    profile = async (parent: unknown, args: { search?: string }, { user }: IAuthUser): Promise<Object> => {
        await GQLValidation<{ search?: string }>(profileGQL, args)
        await GQLAuthorization(endPoint.profile, user)
        const data = await this.service.profile(user)
        return {
            message: `Hello`, data
        }
    }
}
export const userResolver = new UserResolver()