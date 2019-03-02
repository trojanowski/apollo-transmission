import Composer from 'react-composer';
import { Mutation, Query } from 'react-apollo';
import React from 'react';
import { Waypoint } from 'react-waypoint';
import gql from 'graphql-tag';

import Message from '../components/Message';

class MessagesPage extends React.Component {
  componentDidMount() {
    this.props.setAllMessagesRead && this.props.setAllMessagesRead();
  }

  renderMessage = message => {
    return <Message key={message.id} message={message} />;
  };

  render() {
    const { loadMore, loading, messages } = this.props;
    if (!messages) {
      return null;
    }

    return (
      <div>
        <h1>Private messages</h1>
        <div>{messages.nodes.map(this.renderMessage)}</div>
        {messages.pageInfo.hasNextPage && !loading && (
          <Waypoint
            key={messages.pageInfo.cursor}
            onEnter={loadMore}
            bottomOffset="-400px"
          />
        )}
      </div>
    );
  }
}

export default class MessagesPageWithData extends React.Component {
  render() {
    return (
      <Composer
        components={[
          ({ render }) => (
            <Query
              notifyOnNetworkStatusChange
              query={gql`
                query MessagesQuery($before: String) {
                  messages(last: 20, before: $before)
                    @connection(key: "messages") {
                    nodes {
                      ...MessageComponentFragment
                    }
                    pageInfo {
                      cursor
                      hasNextPage
                    }
                  }
                }
                ${Message.fragments.message}
              `}
            >
              {({ data: { messages }, fetchMore, loading }) => {
                const loadMore = () =>
                  fetchMore({
                    variables: {
                      before: messages.pageInfo.cursor,
                    },
                    updateQuery(previousResult, { fetchMoreResult }) {
                      const response = {
                        messages: {
                          ...fetchMoreResult.messages,
                          nodes: [
                            ...previousResult.messages.nodes,
                            ...fetchMoreResult.messages.nodes,
                          ],
                        },
                      };
                      return response;
                    },
                  });
                return render({ loadMore, loading, messages });
              }}
            </Query>
          ),
          ({ render }) => (
            <Mutation
              mutation={gql`
                mutation SetAllMessagesRead {
                  setHasUnreadMessages(hasUnreadMessages: false) @client
                }
              `}
            >
              {setAllMessagesRead => render(setAllMessagesRead)}
            </Mutation>
          ),
        ]}
      >
        {([{ loadMore, loading, messages }, setAllMessagesRead]) => (
          <MessagesPage
            loadMore={loadMore}
            loading={loading}
            messages={messages}
            setAllMessagesRead={setAllMessagesRead}
          />
        )}
      </Composer>
    );
  }
}
