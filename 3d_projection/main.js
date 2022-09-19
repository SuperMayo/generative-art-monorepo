import {square, doubleSquare, cube} from "./model.js"
import { drawPolygon } from "./draw.js";
import { Camera } from "./camera.js";

const toPoint = (values) => {
  return {
    x: values[0],
    y: values[1],
    z: values[2],
  };
}

const toPolygon = (shape) => {
  return shape.map(toPoint);
}

function toMesh(shape) {
  return shape.map(toPolygon);
}

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const mesh = toMesh(cube);

const camera = new Camera();

const drawMesh = (mesh) => {
  mesh.forEach(polygon => {
    polygon.forEach(point => {
      camera.transform(point);
    });
    drawPolygon(polygon, context)
  });
}

const animate = () => {
  camera.pos.z += 0.1;
  drawMesh(mesh);
  requestAnimationFrame(animate);
}

animate();