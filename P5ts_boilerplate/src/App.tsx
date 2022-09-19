import './App.css';
import Sketch from 'react-p5'; 
import p5Types from "p5";

interface AppProps {

}

let x: number = 50;
let y: number = 50;


const App = (props: AppProps) => {
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(500, 500).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);
    p5.ellipse(x,y,50,50)
    x++;
  };

  return <Sketch setup={setup} draw={draw}/>
};

export default App;
