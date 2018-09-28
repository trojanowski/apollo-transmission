export default function createSubscriptionResolver(
  getStreamFn,
  { prefix } = {}
) {
  async function* subscribe(root, args, context, ...rest) {
    const stream = getStreamFn(root, args, context, ...rest);
    for await (const event of stream) {
      context.clearLoaders();
      if (prefix) {
        yield { [prefix]: event };
      } else {
        yield event;
      }
    }
  }

  return { subscribe };
}
