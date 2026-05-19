import {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { OneUserType, ReactType } from "../../user/gql/user.types.gql";
export const OneCommentType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneCommentType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        likes: { type: new GraphQLList(ReactType) },
        tags: { type: new GraphQLList(OneUserType) },
        postId: { type: new GraphQLNonNull(GraphQLID) },
        commentId: { type: GraphQLID }, 
        createdBy: { type: OneUserType },
        updatedBy: { type: OneUserType },
        reply: { type: new GraphQLList(OneCommentType) },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
    }),
});
export const commentList = new GraphQLNonNull(
    new GraphQLObjectType({
        name: "CommentListResponse",
        fields: {
            message: { type: new GraphQLNonNull(GraphQLString) },
            data: {
                type: new GraphQLObjectType({
                    name: "CommentPaginationResponse",
                    fields: {
                        docs: { type: new GraphQLList(OneCommentType) },
                        currentPage: { type: GraphQLInt },
                        pages: { type: GraphQLInt },
                        size: { type: GraphQLInt },
                    },
                }),
            },
        },
    }),
);
export const commentMutationResponse = new GraphQLObjectType({
    name: "CommentMutationResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneCommentType },
    },
});
export const reactOnCommentResponse = new GraphQLObjectType({
    name: "ReactOnCommentResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneCommentType },
    },
});