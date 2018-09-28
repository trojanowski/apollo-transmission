import GraphQLDate from 'graphql-date';
import gql from 'graphql-tag';
import { makeExecutableSchema } from 'graphql-tools';

import MessageRepository from './repositories/MessageRepository';
import PostRepository from './repositories/PostRepository';
import UserRepository from './repositories/UserRepository';
import createSubscriptionResolver from './utils/createSubscriptionResolver';

const rootSchema = gql`
  scalar Date

  type User {
    id: String!
    username: String!
    email: String
    fullname: String
    bio: String
    avatarUrl(size: Int): String
    posts(before: String, last: Int): PostConnection
    following: Boolean
  }

  type Post {
    author: User
    id: String!
    body: String!
    createdAt: Date
  }

  type PageInfo {
    cursor: String
    hasNextPage: Boolean!
  }

  type PostConnection {
    nodes: [Post!]!
    pageInfo: PageInfo!
  }

  input CreatePostInput {
    body: String!
  }

  type DeletePostPayload {
    deletedId: ID
  }

  input SendMessageInput {
    recipientId: String!
    body: String!
  }

  input UpdateProfileInput {
    fullname: String
    bio: String
  }

  type Message {
    id: String!
    sender: User
    recipient: User
    body: String
    createdAt: Date
  }

  type MessageConnection {
    nodes: [Message!]!
    pageInfo: PageInfo!
  }

  type Query {
    me: User
    messages(before: String, last: Int): MessageConnection
    posts(before: String, last: Int): PostConnection
    post(id: String!): Post
    search(phrase: String!, before: String, first: Int): PostConnection
    timeline(before: String, last: Int): PostConnection
    user(username: String!): User
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post
    deletePost(id: String!): DeletePostPayload
    followUser(id: String!): User
    unfollowUser(id: String!): User
    sendMessage(input: SendMessageInput!): Message
    updateProfile(input: UpdateProfileInput!): User
  }

  type Subscription {
    messageReceived: Message
  }
`;

export const typeDefs = [rootSchema];

export const resolvers = {
  Query: {
    me: (root, args, context) => {
      const { currentUser } = context;
      if (currentUser.isAuthenticated) {
        return UserRepository.getById(context, currentUser.id);
      }
      return null;
    },

    messages(user, args, context) {
      return MessageRepository.loadMessages(context, args);
    },

    posts: (root, args, context) => {
      return PostRepository.allPosts(context, args);
    },

    post: (root, { id }, context) => {
      return PostRepository.getById(context, id);
    },

    search(root, args, context) {
      return PostRepository.search(context, args);
    },

    timeline(root, args, context) {
      return PostRepository.timeline(context, args);
    },

    user: (root, { username }, context) => {
      return UserRepository.getByUsername(context, username);
    },
  },

  Mutation: {
    createPost(root, { input }, context) {
      return PostRepository.create(context, input);
    },

    deletePost(root, { id }, context) {
      return PostRepository.delete(context, id);
    },

    followUser(root, { id }, context) {
      return UserRepository.follow(context, id);
    },

    unfollowUser(root, { id }, context) {
      return UserRepository.unfollow(context, id);
    },

    sendMessage(root, { input }, context) {
      return MessageRepository.create(context, input);
    },

    updateProfile(root, { input }, context) {
      return UserRepository.updateProfile(context, input);
    },
  },

  Post: {
    author: (post, args, context) => {
      return UserRepository.getById(context, post.authorId);
    },
  },

  Subscription: {
    messageReceived: createSubscriptionResolver(
      (root, args, context) => MessageRepository.listenForReceived(context),
      { prefix: 'messageReceived' }
    ),
  },

  User: {
    posts: (user, args, context) => {
      return PostRepository.findByAuthorId(context, user.id, args);
    },

    following(user, args, context) {
      return UserRepository.isFollowing(context, user.id);
    },
  },

  Message: {
    sender(message, args, context) {
      return UserRepository.getById(context, message.senderId);
    },

    recipient(message, args, context) {
      return UserRepository.getById(context, message.recipientId);
    },
  },

  Date: GraphQLDate,
};

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
export default executableSchema;
