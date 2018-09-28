import React from 'react';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';

import Message from './Message';
import { newMessageSubscriptionUpdater } from '../utils/updaters';

const NEW_MESSAGES_SUBSCRIPTION = gql`
  subscription NewMessagesSubscription {
    messageReceived {
      ...MessageComponentFragment
    }
  }

  ${Message.fragments.message}
`;

export default class NewMessagesSubscription extends React.Component {
  handleNewMessage = ({ client, subscriptionData }) => {
    const { addUnreadState } = this.props;

    newMessageSubscriptionUpdater(client, subscriptionData);
    if (addUnreadState) {
      client.writeData({ data: { hasUnreadMessages: true } });
    }
  };

  handleError = error => {
    console.error('Error during subscribing for new messages', error);
  };

  render() {
    return (
      <Subscription
        onSubscriptionData={this.handleNewMessage}
        subscription={NEW_MESSAGES_SUBSCRIPTION}
      >
        {({ error }) => {
          if (error) {
            this.handleError(error);
          }
          return null;
        }}
      </Subscription>
    );
  }
}
