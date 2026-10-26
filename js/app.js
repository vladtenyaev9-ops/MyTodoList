const renderers = [];

export const registerRenderer = fn => {
  renderers.push(fn);
};

export const renderAll = () => {
  renderers.forEach(fn => fn());
};