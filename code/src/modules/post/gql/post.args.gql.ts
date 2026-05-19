import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLString,
} from "graphql";
export const ReactGQLEnumType = new GraphQLEnumType({
    name: "ReactEnum",
    values: {
        LIKE: { value: "like" },
        LOVE: { value: "love" },
        HAHA: { value: "haha" },
        WOW: { value: "wow" },
        SAD: { value: "sad" },
        ANGRY: { value: "angry" },
        REMOVE: { value: "0" }, 
    },
});
export const postList = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};
export const reactOnPost = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    react: { type: new GraphQLNonNull(ReactGQLEnumType) },
};