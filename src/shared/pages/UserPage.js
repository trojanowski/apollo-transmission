import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import { CurrentUserConsumer } from '../components/CurrentUserContext';
import NotFound from '../components/NotFound';
import PostList from '../components/PostList';
import PrivateMessageDialog from '../components/PrivateMessageDialog';
import isCurrentUser from '../utils/isCurrentUser';

const USER_QUERY = gql`
  query UserQuery($username: String!) {
    user(username: $username) {
      id
      username
      posts(last: 20) @connection(key: "posts") {
        ...PostListFragment
      }
    }
  }
  ${PostList.fragments.postList}
`;

const USER_FETCH_MORE_POSTS_QUERY = gql`
  query UserFetchMorePostsQuery($username: String!, $before: String!) {
    user(username: $username) {
      id
      posts(last: 20, before: $before) @connection(key: "posts") {
        ...PostListFragment
      }
    }
  }
  ${PostList.fragments.postList}
`;

class UserPage extends React.Component {
  state = {
    showPrivateMessageDialog: false,
  };

  handleTogglePrivateMessageDialog = () => {
    this.setState({
      showPrivateMessageDialog: !this.state.showPrivateMessageDialog,
    });
  };

  render() {
    const { data, fetchMore, loading } = this.props;
    const { user } = data;

    if (!user) {
      if (loading) {
        return null;
      }
      return <NotFound />;
    }
    return (
      <div>
        <h1>{user.username}</h1>
        <div>
          <CurrentUserConsumer>
            {({ currentUser }) => {
              if (isCurrentUser(currentUser, user)) {
                return (
                  <Link className="btn btn-primary" to="/edit-profile">
                    Edit profile
                  </Link>
                );
              }
              return (
                <button
                  className="btn btn-primary"
                  onClick={this.handleTogglePrivateMessageDialog}
                >
                  Private message
                </button>
              );
            }}
          </CurrentUserConsumer>
        </div>
        <PostList
          data={data}
          fetchMore={fetchMore}
          fetchMoreArgs={{
            query: USER_FETCH_MORE_POSTS_QUERY,
          }}
          fetchMoreVariables={{ username: user.username }}
          getPosts={currentData => currentData.user.posts}
          loading={loading}
        />
        <PrivateMessageDialog
          isOpen={this.state.showPrivateMessageDialog}
          toggle={this.handleTogglePrivateMessageDialog}
          user={user}
        />
      </div>
    );
  }
}

export default class UserPageWithData extends React.Component {
  render() {
    return (
      <Query
        notifyOnNetworkStatusChange
        query={USER_QUERY}
        variables={{
          username: this.props.match.params.username,
        }}
      >
        {({ data, fetchMore, loading }) => (
          <UserPage data={data} fetchMore={fetchMore} loading={loading} />
        )}
      </Query>
    );
  }
}
