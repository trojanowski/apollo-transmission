import { Link } from 'react-router-dom';
import React from 'react';
import TimeAgo from 'react-timeago';
import gql from 'graphql-tag';

import { CurrentUserConsumer } from './CurrentUserContext';

export default function Message({ message }) {
  return (
    <CurrentUserConsumer>
      {({ currentUser }) => {
        const sentByCurrentUser = currentUser.id === message.sender.id;
        const userWithAvatar = sentByCurrentUser
          ? message.recipient
          : message.sender;
        const avatar = <img src={userWithAvatar.avatarUrl48} alt="" />;

        return (
          <article className="media my-3">
            {!sentByCurrentUser && <div className="d-flex mr-3">{avatar}</div>}
            <div className="w-100">
              <div>
                <Link to={`/@${userWithAvatar.username}`}>
                  <b>{userWithAvatar.username}</b>
                </Link>
              </div>
              <div>
                <small>
                  <TimeAgo date={message.createdAt} suppressHydrationWarning />
                </small>
              </div>
              <p className="p-3 bg-light rounded">{message.body}</p>
            </div>
            {sentByCurrentUser && <div className="d-flex ml-3">{avatar}</div>}
          </article>
        );
      }}
    </CurrentUserConsumer>
  );
}

Message.fragments = {
  message: gql`
    fragment MessageComponentFragment on Message {
      id
      createdAt
      body
      sender {
        id
        username
        avatarUrl48: avatarUrl(size: 48)
      }
      recipient {
        id
        username
        avatarUrl48: avatarUrl(size: 48)
      }
    }
  `,
};
