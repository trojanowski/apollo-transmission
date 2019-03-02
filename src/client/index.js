import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter } from 'react-router-dom';
import { InMemoryCache } from 'apollo-cache-inmemory';
import React from 'react';
import ReactDOM from 'react-dom';
import { WebSocketLink } from 'apollo-link-ws';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { getMainDefinition, toIdValue } from 'apollo-utilities';
import { withClientState } from 'apollo-link-state';

import 'react-notifications/lib/notifications.css';

import App from '../shared/App';
import * as clientStateProps from '../shared/resolvers';

const cache = new InMemoryCache({
  cacheRedirects: {
    Query: {
      post: (_, args) =>
        toIdValue(
          cache.config.dataIdFromObject({ __typename: 'Post', id: args.id })
        ),
    },
  },
});

if (window.__APOLLO_STATE__) {
  cache.restore(window.__APOLLO_STATE__);
}

const queryOrMutationLink = new BatchHttpLink({
  credentials: 'same-origin',
});
const subscriptionLink = new WebSocketLink({
  uri: `ws://${window.location.host}/graphql`,
  options: { reconnect: true },
});

const remoteLink = ApolloLink.split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  subscriptionLink,
  queryOrMutationLink
);

const localLink = withClientState({ ...clientStateProps, cache });
const link = ApolloLink.from([localLink, remoteLink]);

const client = new ApolloClient({
  cache,
  link,
});

ReactDOM.hydrate(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
);
