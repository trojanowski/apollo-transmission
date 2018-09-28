// Get validation errors from the GraphQL response

export default function getValidationErrors(error) {
  if (
    error &&
    error.graphQLErrors &&
    error.graphQLErrors[0].extensions &&
    error.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT' &&
    error.graphQLErrors[0].extensions.exception.validationErrors
  ) {
    return error.graphQLErrors[0].extensions.exception.validationErrors;
  }

  throw error;
}
