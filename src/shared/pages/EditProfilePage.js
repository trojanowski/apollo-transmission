import { Mutation } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import EditProfileForm from '../components/EditProfileForm';

class EditProfilePage extends React.Component {
  render() {
    return (
      <EditProfileForm
        currentUser={this.props.me}
        updateProfile={this.props.updateProfile}
      />
    );
  }
}

export default class EditProfilePageWithMutation extends React.Component {
  render() {
    return (
      <Mutation
        mutation={gql`
          mutation UpdateProfileMutation($input: UpdateProfileInput!) {
            updateProfile(input: $input) {
              id
              fullname
              bio
            }
          }
        `}
      >
        {updateProfileMutation => (
          <EditProfilePage
            {...this.props}
            updateProfile={input =>
              updateProfileMutation({ variables: { input } })
            }
          />
        )}
      </Mutation>
    );
  }
}
