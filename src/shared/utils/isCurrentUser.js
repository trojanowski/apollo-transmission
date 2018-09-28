export default function isCurrentUser(currentUser, otherUser) {
  if (!(currentUser && otherUser)) {
    return false;
  }
  return otherUser.id === currentUser.id;
}
