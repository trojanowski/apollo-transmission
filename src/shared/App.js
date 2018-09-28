import { NotificationContainer } from 'react-notifications';
import { Query } from 'react-apollo';
import { Route, Switch } from 'react-router-dom';
import React from 'react';
import gql from 'graphql-tag';

import AllPostsPage from './pages/AllPostsPage';
import { CurrentUserProvider } from './components/CurrentUserContext';
import EditProfilePage from './pages/EditProfilePage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LogInPage from './pages/LogInPage';
import MessagesPage from './pages/MessagesPage';
import NewMessagesSubscription from './components/NewMessagesSubscription';
import NewPostPage from './pages/NewPostPage';
import NotFound from './components/NotFound';
import PostPage from './pages/PostPage';
import PrivateRoute from './components/PrivateRoute';
import SearchResultPage from './pages/SearchResultPage';
import SignUpPage from './pages/SignUpPage';
import Spinner from './components/Spinner';
import UserPage from './pages/UserPage';

const APP_QUERY = gql`
  query AppQuery {
    me {
      id
      username
      fullname
      bio
    }
    hasUnreadMessages @client
  }
`;

export default class App extends React.Component {
  renderContent = ({ data, loading }) => {
    const me = data && data.me;

    return (
      <React.Fragment>
        {loading && <Spinner />}
        <div hidden={loading}>
          {!loading && (
            <Header hasUnreadMessages={data.hasUnreadMessages} me={me} />
          )}
          <div className="app-content">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <CurrentUserProvider currentUser={me} loading={loading}>
                    <Switch>
                      <Route component={LogInPage} exact path="/login" />
                      <Route component={SignUpPage} exact path="/signup" />
                      <Route component={PostPage} exact path="/posts/:postId" />
                      <PrivateRoute
                        component={EditProfilePage}
                        exact
                        path="/edit-profile"
                      />
                      <PrivateRoute
                        component={NewPostPage}
                        exact
                        path="/new-post"
                      />
                      <PrivateRoute
                        component={MessagesPage}
                        exact
                        path="/messages"
                      />
                      <Route
                        component={SearchResultPage}
                        exact
                        path="/search"
                      />
                      <Route component={UserPage} exact path="/@:username" />
                      <Route component={AllPostsPage} exact path="/explore" />
                      <Route component={HomePage} exact path="/" />
                      <Route component={NotFound} />
                    </Switch>
                  </CurrentUserProvider>
                </div>
              </div>
            </div>
          </div>
          {me && (
            <Route
              exact
              path="/messages"
              children={({ match }) => (
                <NewMessagesSubscription addUnreadState={!match} />
              )}
            />
          )}
          <NotificationContainer />
        </div>
      </React.Fragment>
    );
  };

  render() {
    return <Query query={APP_QUERY}>{this.renderContent}</Query>;
  }
}
