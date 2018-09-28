import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import { CurrentUserConsumer } from '../components/CurrentUserContext';

// https://tylermcginnis.com/react-router-protected-routes-authentication/
// + react router docs about private routes and redirections

export default function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => (
        <CurrentUserConsumer>
          {({ currentUser, loading }) => {
            if (loading) {
              return null;
            }
            if (currentUser) {
              return <Component {...props} me={currentUser} />;
            }
            return (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from: props.location },
                }}
              />
            );
          }}
        </CurrentUserConsumer>
      )}
    />
  );
}
