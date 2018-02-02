import React, { Component } from "react";
import "./App.css";

const randomDimensions = () => ({
  width: Math.random() * 100 + 20,
  height: Math.random() * 100 + 20
});

class App extends Component {
  state = {
    rooms: [randomDimensions()]
  }
  render() {
    const { rooms } = this.state;
    return (
      <div>
        <div>Dungeon game</div>
        {rooms.map(({ width, height }, i) => (
          <div style={{ width, height, background: "white" }} />
        ))}
      </div>
    )
  }
}

export default App;
