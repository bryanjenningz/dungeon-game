import React, { Component } from "react";
import "./App.css";

class App extends Component {
  state = {
    rooms: [{ width: 200, height: 150 }]
  }
  render() {
    const { rooms } = this.state;
    return (
      <div>
        <div>Dungeon game</div>
        {rooms.map(({ width, height }, i) => (
          <div style={{ width, height, background: "white" }}>

          </div>
        ))}
      </div>
    )
  }
}

export default App;
