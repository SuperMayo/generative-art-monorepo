const perspective = (point, distance) => {
  const fov = point.z + distance;
  point.x /= fov;
  point.y /= fov;
}

//
const zoom = (point, factor) => {
  const scale = Math.pow(factor, 2);
  point.x *= scale;
  point.y *= scale;
}

export class Camera {
  constructor() {
    this.pos = {z: 100};
    this.zoom = 7;
  }

  transform(point) {
    perspective(point, this.pos.z);
    zoom(point, this.zoom);
  }
}