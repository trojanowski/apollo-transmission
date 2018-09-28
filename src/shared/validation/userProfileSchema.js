import * as Yup from 'yup';

const userProfileSchema = Yup.object().shape({
  fullname: Yup.string()
    .trim()
    .max(50),
  bio: Yup.string()
    .trim()
    .max(160),
});

export default userProfileSchema;
