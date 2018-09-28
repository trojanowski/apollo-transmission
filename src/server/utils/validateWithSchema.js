import { UserInputError } from '../errors';
import yupToFormErrors from './yupToFormErrors';

export default async function validateWithSchema(schema, data) {
  try {
    return await schema.validate(data, {
      abortEarly: false,
    });
  } catch (error) {
    const validationErrors = yupToFormErrors(error);
    throw new UserInputError('Validation errror', { validationErrors });
  }
}
