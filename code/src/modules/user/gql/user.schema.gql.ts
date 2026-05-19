import { GraphQLString } from "graphql"
import * as  UserGQLTypes from './user.types.gql';
import * as  UserGQLArgs from './user.args.gql';
import { userResolver, UserResolver } from './user.resolver';
export class UserGQLSchema {
    private userResolver: UserResolver
    constructor() {
        this.userResolver = userResolver
    }
    registerQuery() {
        return {
            profile: {
                type: UserGQLTypes.profile,
                args: UserGQLArgs.profile,
                description: "test profile point",
                resolve: this.userResolver.profile
            },
        }
    }
    registerMutation() {
        return {
            like: {
                type: GraphQLString,
                description: "test welcome point",
                resolve: () => {
                    return `Hello`
                }
            }
        }
    }
}
export const userGQLSchema = new UserGQLSchema()