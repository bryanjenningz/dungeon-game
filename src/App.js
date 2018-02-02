import React, { Component } from "react";
import "./App.css";

const randomDimensions = () => ({
  width: Math.random() * 16 + 4,
  height: Math.random() * 16 + 4
});

const BLOCK_WIDTH = 10;

class App extends Component {
  state = {
    rooms: [randomDimensions()]
  };
  render() {
    const { rooms } = this.state;
    return (
      <div>
        <div>Dungeon game</div>
        {rooms.map(({ width, height }, i) => (
          <div
            key={i}
            style={{
              width: width * BLOCK_WIDTH,
              height: height * BLOCK_WIDTH,
              background: "white"
            }}
          />
        ))}
      </div>
    );
  }
}

export default App;
