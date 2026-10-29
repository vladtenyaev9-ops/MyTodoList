// Раскладывает пересекающиеся блоки по "дорожкам", чтобы они стояли рядом.
// blocks: [{ start, end }] в минутах. Каждому блоку добавляются lane и lanes.
export const assignLanes = blocks => {
  const sorted = [...blocks].sort((a, b) => a.start - b.start || b.end - a.end);

  let cluster = [];
  let clusterEnd = -1;
  const laneEnds = [];

  const flush = () => {
    cluster.forEach(b => {
      b.lanes = laneEnds.length;
    });
    cluster = [];
    laneEnds.length = 0;
    clusterEnd = -1;
  };

  for (const block of sorted) {
    if (cluster.length && block.start >= clusterEnd) flush();

    let lane = laneEnds.findIndex(end => end <= block.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.end);
    } else {
      laneEnds[lane] = block.end;
    }

    block.lane = lane;
    cluster.push(block);
    clusterEnd = Math.max(clusterEnd, block.end);
  }
  if (cluster.length) flush();

  return sorted;
};