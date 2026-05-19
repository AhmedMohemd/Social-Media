import {
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} from "graphql";
export const commentList = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
};
export const createComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLID) },
};
export const replyOnComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLID) },
};
export const reactOnComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    react: { type: new GraphQLNonNull(GraphQLString) },
};
export const commentParams = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
};