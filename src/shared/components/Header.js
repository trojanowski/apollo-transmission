import ClickOutside from 'react-click-outside';
import { Link, withRouter } from 'react-router-dom';
import React, { Fragment } from 'react';
import classnames from 'classnames';

import SearchForm from './SearchForm';

class Header extends React.Component {
  state = { collapsed: true };

  componentDidUpdate(prevProps, prevState) {
    // collapse the header after navigation change
    if (!this.state.collapsed && !prevState.collapsed) {
      if (
        this.props.location.pathname !== prevProps.location.pathname ||
        this.props.location.search !== prevProps.location.search
      ) {
        this.setState({ collapsed: true });
      }
    }
  }

  handleClickOutside = () => {
    if (!this.state.collapsed) {
      this.setState({
        collapsed: true,
      });
    }
  };

  handleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { hasUnreadMessages, me } = this.props;
    const { collapsed } = this.state;

    return (
      <ClickOutside onClickOutside={this.handleClickOutside}>
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
          <div className="container">
            <Link className="navbar-brand" to="/">
              Transmission
            </Link>
            <button
              aria-label="Toggle navigation"
              className="navbar-toggler"
              onClick={this.handleCollapsed}
              type="button"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className={`navbar-collapse ${collapsed ? 'collapse' : ''}`}>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/explore">
                    Explore
                  </Link>
                </li>
              </ul>
              <div className="mr-auto" />
              <SearchForm />
              <ul className="navbar-nav navbar-right">
                {!me && (
                  <Fragment>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">
                        Log in
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/signup">
                        Sign up
                      </Link>
                    </li>
                  </Fragment>
                )}
                {me && (
                  <Fragment>
                    <li className="nav-link header-username">
                      <Link to={`/@${me.username}`}>
                        <b>{me.username}</b>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={classnames('nav-link', {
                          'text-warning': hasUnreadMessages,
                        })}
                        to="/messages"
                      >
                        Messages
                        {hasUnreadMessages && (
                          <Fragment>
                            &nbsp;
                            <span className="badge badge-warning">!</span>
                          </Fragment>
                        )}
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/new-post">
                        New post
                      </Link>
                    </li>
                    <li className="nav-item">
                      {/* Don't use a link and a GET method here for security reasons  */}
                      <form action="/auth/logout" method="post">
                        <button className="nav-link header-logout-button">
                          Log out
                        </button>
                      </form>
                    </li>
                  </Fragment>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </ClickOutside>
    );
  }
}

export default withRouter(Header);
