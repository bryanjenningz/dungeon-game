import React, { Component } from "react";
import "./App.css";

const randomInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo));

const randomChoice = choices => choices[randomInt(0, choices.length)];

const randomDimensions = () => ({
  width: randomInt(5, 21),
  height: randomInt(5, 21)
});

const randomBoxes = count => {
  const boxes = [{ ...randomDimensions(), x: 0, y: 0 }];
  for (let i = 1; i < count; i++) {
    const box = randomChoice(boxes);
    const { width, height } = randomDimensions();
    const { x, y } = {
      left: () => ({
        x: box.x - width,
        y: box.y + randomInt(-height + 1, box.height - 1)
      }),
      right: () => ({
        x: box.x + box.width,
        y: box.y + randomInt(-height + 1, box.height - 1)
      }),
      top: () => ({
        x: box.x + randomInt(-width + 1, box.width - 1),
        y: box.y - height
      }),
      bottom: () => ({
        x: box.x + randomInt(-width + 1, box.width - 1),
        y: box.y + box.height
      })
    }[randomChoice(["left", "right", "top", "bottom"])]();
    boxes.push({ width, height, x, y });
  }
  let [minX, minY] = [0, 0];
  for (const box of boxes) {
    [minX, minY] = [Math.min(minX, box.x), Math.min(minY, box.y)];
  }
  for (const box of boxes) {
    box.x = box.x - minX;
    box.y = box.y - minY;
  }
  return boxes;
};

const BLOCK_WIDTH = 10;

class App extends Component {
  constructor() {
    super();
    const boxes = randomBoxes(40);
    const player = (box => ({
      x: box.x + randomInt(0, box.width),
      y: box.y + randomInt(0, box.height)
    }))(randomChoice(boxes));
    this.state = { boxes, player };
  }

  componentDidMount() {
    window.addEventListener("keydown", event => {
      const arrows = { 37: "left", 38: "up", 39: "right", 40: "down" };
      if (arrows[event.keyCode]) {
        const { boxes, player: { x, y } } = this.state;
        const { x: dx, y: dy } = {
          left: () => ({ x: -1, y: 0 }),
          right: () => ({ x: 1, y: 0 }),
          up: () => ({ x: 0, y: -1 }),
          down: () => ({ x: 0, y: 1 })
        }[arrows[event.keyCode]]();
        const newX = x + dx;
        const newY = y + dy;
        const isInBounds = boxes.some(
          box =>
            box.x <= newX &&
            newX < box.x + box.width &&
            box.y <= newY &&
            newY < box.y + box.height
        );
        if (isInBounds) {
          this.setState({ player: { x: newX, y: newY } });
        }
      }
    });
  }

  render() {
    const { boxes, player } = this.state;
    return (
      <div>
        <div style={{ position: "relative" }}>
          {boxes.map(({ width, height, x, y }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x * BLOCK_WIDTH,
                top: y * BLOCK_WIDTH,
                width: width * BLOCK_WIDTH,
                height: height * BLOCK_WIDTH,
                background: "white"
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: player.x * BLOCK_WIDTH,
              top: player.y * BLOCK_WIDTH,
              width: BLOCK_WIDTH,
              height: BLOCK_WIDTH,
              background: "blue"
            }}
          />
        </div>
      </div>
    );
  }
}

export default App;
