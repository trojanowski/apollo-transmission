export const defaults = {
  hasUnreadMessages: false,
};

export const resolvers = {
  Mutation: {
    setHasUnreadMessages(_, { hasUnreadMessages }, { cache }) {
      cache.writeData({ data: { hasUnreadMessages } });
      return null;
    },
  },
};
