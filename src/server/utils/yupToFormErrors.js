// based on https://github.com/jaredpalmer/formik/blob/master/src/formik.tsx

import { ValidationError } from 'yup';

/**
 * Transform Yup ValidationError to a more usable object
 */
export default function yupToFormErrors(yupError) {
  // throw if it's not a Yup validation error
  if (!ValidationError.isError(yupError)) {
    throw yupError;
  }
  const errors = {};
  for (const err of yupError.inner) {
    if (!errors[err.path]) {
      errors[err.path] = err.message;
    }
  }
  return errors;
}
