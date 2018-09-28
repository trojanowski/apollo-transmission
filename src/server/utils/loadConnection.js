export default async function loadConnection(
  context,
  loadFunc,
  connectionData
) {
  const { ids, pageInfo } = connectionData;
  let nodes;
  if (ids.length) {
    const notFilteredNodes = await Promise.all(
      ids.map(id => loadFunc(context, id))
    );
    nodes = notFilteredNodes.filter(node => !!node);
  } else {
    nodes = [];
  }

  return { nodes, pageInfo };
}
