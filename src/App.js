import React, { Component } from "react";
import "./App.css";

const randomDimensions = () => ({
  width: Math.random() * 16 + 4,
  height: Math.random() * 16 + 4
});

const randomInt = range => Math.floor(Math.random() * range);
const randomChoice = choices => choices[randomInt(choices.length)];

// This function is used to generate a random connection between 2 rooms.
// This function can be used for connecting 2 rooms vertically or horizontally.
// A connection between 2 rooms consists of a room offset from the first room
// and a connection offset with respect to the first room.
// A negative room offset for a horizontal room connection means the right
// room is higher than the left room. If the offset is positive, the right room
// is lower.
// A negative room offset for a vertical connection means the bottom room is
// farther to the left. If the room offset is positive, the bottom room is
// more to the right than the top room.
// A connection offset can never be negative because it has to be within the
// overlap of the 2 rooms.
// If you're trying to connect 2 rooms horizontally, make sure the first
// argument is the height of the room on the left and the second argument
// is the height of the room on the right.
// If you're trying to connect 2 rooms vertically, make sure the first
// argument is the width of the room on top and the second argument is the
// width of the room on bottom.
const randomRoomConnection = (width1, width2) => {
  const offsetRange = width1 + width2 * 2 - 2;
  const offsetStart = -width2 + 1;
  const roomOffset = offsetStart + randomInt(offsetRange);
  const overlapOffsetStart = Math.max(0, roomOffset);
  const overlapOffsetEnd = Math.min(width1, roomOffset + width2);
  const overlapRange = overlapOffsetEnd - overlapOffsetStart + 1;
  const connectionOffset = overlapOffsetStart + randomInt(overlapRange);
  return { roomOffset, connectionOffset };
};

const randomRoomWithEmptyConnection = rooms => {
  let room;
  let tries = 0;
  while (
    !room ||
    (room.left && room.right && room.top && room.bottom && tries < 10)
  ) {
    room = randomChoice(rooms);
    tries += 1;
  }
  return room;
};

const randomRooms = () => {
  const ROOM_COUNT = 20;
  const rooms = [randomDimensions()];
  const oppositeSide = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top"
  };
  for (let i = 0; i < ROOM_COUNT; i++) {
    const room = randomRoomWithEmptyConnection(rooms);
    const side = randomChoice(
      Object.keys(oppositeSide).filter(side => !room[side])
    );
    const newRoom = randomDimensions();
    const { roomOffset, connectionOffset } = {
      left: () => randomRoomConnection(newRoom.height, room.height),
      right: () => randomRoomConnection(room.height, newRoom.height),
      top: () => randomRoomConnection(newRoom.width, room.width),
      bottom: () => randomRoomConnection(room.width, newRoom.width)
    }[side]();

    room[side] = { roomOffset, connectionOffset };
    newRoom[oppositeSide[side]] = {
      roomOffset: -roomOffset,
      connectionOffset: -roomOffset + connectionOffset
    };
    rooms.push(newRoom);
  }
  return rooms;
};

const BLOCK_WIDTH = 10;

class App extends Component {
  state = {
    rooms: randomRooms()
  };
  render() {
    const { rooms } = this.state;
    return (
      <div>
        <div>Dungeon game</div>
        <div style={{ position: "relative" }}>
          {rooms.map(({ width, height }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: i * 20 * BLOCK_WIDTH,
                width: width * BLOCK_WIDTH,
                height: height * BLOCK_WIDTH,
                background: "white"
              }}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default App;
