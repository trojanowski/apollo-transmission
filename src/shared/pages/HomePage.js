import { Link } from 'react-router-dom';
import { Query } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import { CurrentUserConsumer } from '../components/CurrentUserContext';
import PostList from '../components/PostList';

const TIMELINE_QUERY = gql`
  query TimelineQuery($before: String) {
    timeline(last: 20, before: $before) @connection(key: "timeline") {
      ...PostListFragment
    }
  }
  ${PostList.fragments.postList}
`;

export default class HomePage extends React.Component {
  renderAnonymousPage() {
    return (
      <React.Fragment>
        <div className="jumbotron">
          <h1>Transmission</h1>
          <p className="lead">An example Apollo/GraphQL application</p>
          <p>
            <Link className="btn btn-lg btn-primary" to="/login">
              Log in
            </Link>
          </p>
          <p>
            <Link className="btn btn-lg btn-primary" to="/signup">
              Sign up
            </Link>
          </p>
          <p>
            <Link className="btn btn-lg btn-primary" to="/explore">
              Explore
            </Link>
          </p>
        </div>
      </React.Fragment>
    );
  }

  renderTimeline() {
    return (
      <Query notifyOnNetworkStatusChange query={TIMELINE_QUERY}>
        {({ data, fetchMore, loading }) => {
          return (
            <PostList
              data={data}
              fetchMore={fetchMore}
              getPosts={currentData => currentData.timeline}
              loading={loading}
            />
          );
        }}
      </Query>
    );
  }

  render() {
    return (
      <CurrentUserConsumer>
        {({ currentUser }) => {
          if (!currentUser) {
            return this.renderAnonymousPage();
          }
          return this.renderTimeline();
        }}
      </CurrentUserConsumer>
    );
  }
}
