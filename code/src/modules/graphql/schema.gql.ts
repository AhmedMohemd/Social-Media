import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user";
import { postGQLSchema } from "../post";
import { commentGQLSchema } from "../comment";
import { storyGQLSchema } from "../story";
import { notificationGQLSchema } from "../notification";
const query = new GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "Root query for Social Media API",
    fields: {
        ...userGQLSchema.registerQuery(),
        ...postGQLSchema.registerQuery(),
        ...commentGQLSchema.registerQuery(),
        ...storyGQLSchema.registerQuery(),
        ...notificationGQLSchema.registerQuery(),
    },
});
const mutation = new GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "Root mutation for Social Media API",
    fields: {
        ...userGQLSchema.registerMutation(),
        ...postGQLSchema.registerMutation(),
        ...commentGQLSchema.registerMutation(),
        ...storyGQLSchema.registerMutation(),
        ...notificationGQLSchema.registerMutation(),
    },
});
export const schema = new GraphQLSchema({ query, mutation });