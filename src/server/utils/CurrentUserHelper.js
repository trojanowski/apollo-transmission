import { AuthenticationError } from '../errors';

export default class CurrentUserHelper {
  constructor(data) {
    if (data) {
      this.id = data.id;
    }
    this.isAnonymous = !this.id;
    this.isAuthenticated = !this.isAnonymous;
  }

  requireAuthenticated() {
    if (!this.isAuthenticated) {
      throw new AuthenticationError();
    }
  }
}
