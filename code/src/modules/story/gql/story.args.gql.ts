import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
} from "graphql";
export const storyParams = {
    storyId: { type: new GraphQLNonNull(GraphQLID) },
};
export const createStory = {
    content: { type: GraphQLString },
    backgroundColor: { type: GraphQLString },
    textColor: { type: GraphQLString },
};
export const StoryReactGQLEnum = new GraphQLEnumType({
    name: "StoryReactEnum",
    values: {
        LOVE: { value: "love" },
        REMOVE: { value: "0" },
    },
});
export const reactStory = {
    storyId: { type: new GraphQLNonNull(GraphQLID) },
    react: { type: new GraphQLNonNull(StoryReactGQLEnum) },
};