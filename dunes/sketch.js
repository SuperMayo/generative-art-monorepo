const canvasSketch = require("canvas-sketch");
const {
  noise1D,
  getRandomSeed,
  setSeed,
} = require("canvas-sketch-util/random");
const { lerp } = require("canvas-sketch-util/math");
const { clipPolylinesToBox } = require("canvas-sketch-util/geometry");
const { pathsToSVG } = require("canvas-sketch-util/penplot");
const { cos, sin, PI } = Math;
const Tweakpane = require("tweakpane");
var FileSaver = require("file-saver");

const data = {
  background: "#fff",
  lineColor: "#000",
  nlines: 200,
  angleLeft: -0.4,
  angleRight: 0.3,
  noiseFreq: 0.05,
  noiseAmpl: 5,
  lineWidth: 0.05,
  shift: 0,
  smooth: 0,
  margin: 1,
  driftBottom: 0,
  seed: 99,
  d: 1.5,
  squared: false,
  darkmode: false,
};

const settings = {
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
  prefix: "dune",
  data,
};

const sketch = ({ width, height, units, data }) => {
  const drawLines = ({
    nlines,
    noiseFreq,
    noiseAmpl,
    shift,
    smooth,
    angleLeft,
    angleRight,
    driftBottom,
    margin,
    seed,
    squared,
    d,
  }) => {
    // List of polylines for our pen plot
    let lines = [];
    const distance = d * width;
    setSeed(seed);
    for (let i = 0; i < nlines; i++) {
      let y = lerp(-height * 0.3, height * 1.3, i / nlines);
      let x =
        width / 2 +
        noise1D(y, noiseFreq, noiseAmpl) +
        shift +
        (i / nlines) * driftBottom;
      //smooth = lerp(0, 1, i / nlines);
      // if you are at point (x,y) and move a distance d in angle alpha,
      // then the new points are
      // xx = x + (d * cos(alpha))
      // yy = y + (d * sin(alpha))
      let x0 = x + distance * cos((angleLeft - PI) * (1 - smooth));
      let y0 = y + distance * sin((angleLeft - PI) * (1 - smooth));
      let x1 = x + distance * cos(angleRight * (1 - smooth));
      let y1 = y + distance * sin(angleRight * (1 - smooth));
      lines.push([
        [x0, y0],
        [x, y],
        [x1, y1],
      ]);
    }

    // Clip all the lines to a margin
    let marginH;
    let marginV;
    if (squared) {
      const sideLength =
        width > height ? height - 2 * margin : width - 2 * margin;
      marginH = (width - sideLength) / 2;
      marginV = (height - sideLength) / 2;
    } else {
      marginH = marginV = margin;
    }
    const box = [marginH, marginV, width - marginH, height - marginV];
    lines = clipPolylinesToBox(lines, box);

    return lines;
  };

  // Render canvas from lines
  return ({ context, data }) => {
    const { background } = data;

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Fill with white
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    //Draw lines
    const lines = drawLines(data);

    // Draw lines
    lines.forEach((points) => {
      context.beginPath();
      points.forEach((p) => context.lineTo(p[0], p[1]));
      context.lineWidth = data.lineWidth;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = data.lineColor;
      context.stroke();
    });

    return [
      context.canvas,
      {
        data: pathsToSVG(lines, {
          width,
          height,
          units,
        }),
        extension: ".svg",
      },
    ];
  };
};

(async () => {
  const manager = await canvasSketch(sketch, settings);

  // Can disable this entirely
  const useGUI = true;
  if (useGUI) {
    // tweakpane
    const gui = new Tweakpane();
    const pane = gui.addFolder({
      title: "Parameters",
    });
    gui.on("change", render);

    const dims = pane.addFolder({
      title: "Dimensions",
    });
    dims
      .addInput(settings, "dimensions", {
        options: {
          A4: "A4",
          A3: "A3",
          USletter: "letter",
          postcard: "postcard",
          "11r": "11r",
        },
      })
      .on("change", update);
    dims
      .addInput(settings, "orientation", {
        options: {
          portrait: "portrait",
          landscape: "landscape",
        },
      })
      .on("change", update);
    dims.addInput(data, "margin", { min: 0, max: 5, step: 0.5 });
    dims.addInput(data, "squared");
    pane.addInput(data, "nlines", { step: 1, min: 10, max: 500 });
    pane.addInput(data, "background");
    pane.addInput(data, "lineColor");
    pane.addInput(data, "angleLeft", { min: -1, max: 1 });
    pane.addInput(data, "angleRight", { min: -1, max: 1 });
    pane.addInput(data, "d", { min: 0.01, max: 3, label: "line length" });
    pane.addInput(data, "lineWidth", { min: 0.01, max: 0.2 });
    pane.addInput(data, "driftBottom", { min: -50, max: 50 });
    pane.addInput(data, "shift", { min: -50, max: 50 });
    const rng = pane.addFolder({
      expanded: true,
      title: "RNG",
    });
    rng.addButton({ title: "Reseed" }).on("click", () => {
      data.seed = getRandomSeed();
      render();
    });
    rng.addInput(data, "noiseAmpl", { step: 1, min: -10, max: 10 });
    rng.addInput(data, "noiseFreq", { min: 0, max: 0.2 });
    pane.addButton({ title: "Export lines as SVG" }).on("click", () => {
      const svg = manager.render();
      const blob = new Blob([svg[1].data], { type: "image/svg+xml" });
      FileSaver.saveAs(blob, "penplot.svg");
    });
    pane.addButton({ title: "Save PNG" }).on("click", () => {
      const svg = manager.render();
      const canvas = svg[0];
      canvas.toBlob(function (blob) {
        FileSaver.saveAs(blob, "penplot.png");
      });
    });
    pane.addInput(data, "darkmode").on("change", (s) => {
      if (s) {
        document.body.style.background = "#282a2b";
      } else {
        document.body.style.background = "white";
      }
    });
  }

  function render() {
    manager.render();
  }

  function update() {
    manager.loadAndRun(sketch, settings);
    manager.render();
  }
})();
