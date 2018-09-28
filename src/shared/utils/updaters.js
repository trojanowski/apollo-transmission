import gql from 'graphql-tag';

const MESSAGE_QUERIES = [
  {
    query: gql`
      query MessagesUpdaterQuery {
        messages {
          nodes {
            id
          }
        }
      }
    `,
    dataGetter: data => data.messages,
  },
];

const POST_QUERIES = [
  {
    query: gql`
      query AllPostsUpdaterQuery {
        posts {
          nodes {
            id
          }
        }
      }
    `,
    dataGetter: data => data.posts,
  },
  {
    query: gql`
      query TimelineUpdaterQuery {
        timeline {
          nodes {
            id
          }
        }
      }
    `,
    dataGetter: data => data.timeline,
  },
  {
    query: gql`
      query UserUpdaterQuery($username: String!) {
        user(username: $username) {
          id
          posts {
            nodes {
              id
            }
          }
        }
      }
    `,
    dataGetter: data => data.user.posts,
    variablesGetter: (postFromMutation, extraProps) => ({
      username: extraProps.post
        ? extraProps.post.author.username
        : postFromMutation.author.username,
    }),
  },
];

function createUpdater(queries, resultGetter, callback) {
  return (store, { data: mutationResultBase }, extraProps = {}) => {
    const mutationResult = resultGetter(mutationResultBase);
    queries.forEach(({ dataGetter, query, variablesGetter }) => {
      let storeData;
      const variables = variablesGetter
        ? variablesGetter(mutationResult, extraProps)
        : null;
      try {
        storeData = store.readQuery({
          query,
          variables,
        });
      } catch (error) {
        // empty
      }
      if (!storeData) {
        return;
      }

      const currentData = dataGetter(storeData);
      callback(currentData, mutationResult);
      store.writeQuery({
        data: storeData,
        query,
        variables,
      });
    });
  };
}

export const newPostUpdater = createUpdater(
  POST_QUERIES,
  mutationResult => mutationResult.createPost,
  (currentData, result) => {
    currentData.nodes.unshift({
      __typename: result.__typename,
      id: result.id,
    });
  }
);

export const deletePostUpdater = createUpdater(
  POST_QUERIES,
  mutationResult => mutationResult.deletePost,
  (currentData, result) => {
    currentData.nodes = currentData.nodes.filter(
      currentPost => currentPost.id !== result.deletedId
    );
  }
);

function newMessageUpdaterCallback(currentData, result) {
  if (
    currentData &&
    currentData.nodes &&
    !currentData.nodes.find(message => message.id === result.id)
  ) {
    currentData.nodes.unshift(result);
  }
}

export const sendMessageUpdater = createUpdater(
  MESSAGE_QUERIES,
  mutationResult => mutationResult.sendMessage,
  newMessageUpdaterCallback
);

export const newMessageSubscriptionUpdater = createUpdater(
  MESSAGE_QUERIES,
  subscriptionResult => subscriptionResult.messageReceived,
  newMessageUpdaterCallback
);
