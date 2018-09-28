import React from 'react';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

class SearchForm extends React.Component {
  inputRef = React.createRef();

  handleSubmit = event => {
    event.preventDefault();
    const searchPhrase = this.inputRef.current && this.inputRef.current.value;
    if (!searchPhrase) {
      return;
    }
    this.props.history.push({
      pathname: '/search',
      search: queryString.stringify({ q: searchPhrase }),
    });
    this.inputRef.current.value = '';
  };

  render() {
    return (
      <form
        action="/search"
        className="form-inline mt-2 mt-md-0"
        onSubmit={this.handleSubmit}
      >
        <input
          className="form-control mr-sm-2"
          name="q"
          placeholder="Search"
          ref={this.inputRef}
          type="text"
        />
      </form>
    );
  }
}

export default withRouter(SearchForm);
