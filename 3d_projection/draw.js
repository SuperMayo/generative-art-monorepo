export const drawPolygon = (polygon, ctx) => {
  polygon.forEach(point => {
    offsetToCenter(point, ctx.canvas)
  })

  ctx.beginPath();
  const first = polygon[0];
  ctx.moveTo(first.x, first.y);
  polygon.forEach(point => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(first.x, first.y);
  ctx.stroke();
}

const offsetToCenter = (point, canvas) => {
  point.x += canvas.width / 2;
  point.y += canvas.height / 2;
}
