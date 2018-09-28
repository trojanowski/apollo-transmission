import * as Yup from 'yup';

const postSchema = Yup.object().shape({
  body: Yup.string()
    .trim()
    .required()
    .min(1)
    .max(280),
});

export default postSchema;
