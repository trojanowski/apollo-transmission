import reservedUsernames from 'reserved-usernames';

const RESERVED_USERNAMES_SET = new Set(reservedUsernames);

export default function isUsernameReserved(username) {
  return RESERVED_USERNAMES_SET.has(username);
}
