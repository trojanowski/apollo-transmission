import React from 'react';

const CurrentUserContext = React.createContext();

export const CurrentUserConsumer = CurrentUserContext.Consumer;

export class CurrentUserProvider extends React.PureComponent {
  isCurrentUser = (other) => {
    const { currentUser, loading } = this.prop;

    if (loading) {
      return false;
    }

    return currentUser.id === other.id
  }

  render() {
    return (
      <CurrentUserContext.Provider
        value={{
          currentUser: this.props.currentUser,
          isCurrentUser: this.isCurrentUser,
          loading: this.props.loading,
        }}
      >
        {this.props.children}
      </CurrentUserContext.Provider>
    );
  }
}

