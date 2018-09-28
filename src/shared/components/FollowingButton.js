import React from 'react';

export default class FollowingButton extends React.Component {
  state = { isHovered: false };

  handlerOnMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  handlerOnMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  render() {
    const handlers = {
      onMouseEnter: this.handlerOnMouseEnter,
      onMouseLeave: this.handlerOnMouseLeave,
    };
    const props = {
      ...handlers,
      ...this.props,
    };
    if (this.state.isHovered) {
      return (
        <button className="btn btn-danger btn-sm" {...props}>
          Unfollow
        </button>
      );
    }

    return (
      <button className="btn btn-primary btn-sm disabled" {...props}>
        Following
      </button>
    );
  }
}
