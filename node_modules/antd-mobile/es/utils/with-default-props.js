export function mergeProps(...items) {
  const ret = {};
  items.forEach(item => {
    Object.keys(item).forEach(key => {
      if (item[key] !== undefined) {
        ret[key] = item[key];
      }
    });
  });
  return ret;
}