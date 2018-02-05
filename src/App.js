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
const SCREEN_WIDTH = 500;

class App extends Component {
  constructor() {
    super();
    const range = n => Array.from({ length: n }, (_, i) => i);
    const randomSpawnInBox = box => ({
      x: box.x + randomInt(0, box.width),
      y: box.y + randomInt(0, box.height)
    });
    const randomSpawn = () => randomSpawnInBox(randomChoice(boxes));

    const boxes = randomBoxes(40);
    const player = { ...randomSpawn(), hp: 10 };
    const foods = range(5).map(randomSpawn);
    const enemies = range(5)
      .map(() => ({ ...randomSpawn(), hp: 3 }))
      .filter(enemy => !(enemy.x === player.x && enemy.y === player.y));
    const exit = randomSpawn();
    this.state = { boxes, player, foods, enemies, exit, level: 1 };
  }

  componentDidMount() {
    window.addEventListener("keydown", event => {
      const arrows = { 37: "left", 38: "up", 39: "right", 40: "down" };
      if (arrows[event.keyCode]) {
        const { boxes, player, foods, enemies, exit, level } = this.state;
        const { x: dx, y: dy } = {
          left: () => ({ x: -1, y: 0 }),
          right: () => ({ x: 1, y: 0 }),
          up: () => ({ x: 0, y: -1 }),
          down: () => ({ x: 0, y: 1 })
        }[arrows[event.keyCode]]();
        const newX = player.x + dx;
        const newY = player.y + dy;
        const isInBounds = boxes.some(
          box =>
            box.x <= newX &&
            newX < box.x + box.width &&
            box.y <= newY &&
            newY < box.y + box.height
        );
        const maybeEnemy = enemies.find(
          enemy => enemy.x === newX && enemy.y === newY
        );
        if (isInBounds) {
          if (maybeEnemy) {
            const newEnemyHp = maybeEnemy.hp - randomInt(1, 4);
            if (newEnemyHp <= 0) {
              this.setState({
                enemies: enemies.filter(enemy => enemy !== maybeEnemy)
              });
            } else {
              const newHp = player.hp - randomInt(1, 3);
              this.setState({
                enemies: enemies.map(
                  enemy =>
                    enemy === maybeEnemy ? { ...enemy, hp: newEnemyHp } : enemy
                ),
                player: { ...player, hp: newHp }
              });
            }
          } else {
            const maybeFood = foods.find(
              food => food.x === newX && food.y === newY
            );
            if (maybeFood) {
              this.setState({
                player: { ...player, x: newX, y: newY, hp: player.hp + 2 },
                foods: foods.filter(food => food !== maybeFood)
              });
            } else {
              if (exit.x === newX && exit.y === newY) {
                this.setState({
                  player: { ...player, x: newX, y: newY },
                  level: level + 1
                });
              } else {
                this.setState({ player: { ...player, x: newX, y: newY } });
              }
            }
          }
        }
      }
    });
  }

  render() {
    const { boxes, player, foods, enemies, exit, level } = this.state;
    return (
      <div
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH,
          border: "1px solid black",
          margin: "0 auto",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH * 0.1,
            background: "rgba(0, 0, 0, 0.1)",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center"
          }}
        >
          <div>Level: {level}</div>
          <div>HP: {player.hp}</div>
        </div>
        <div
          style={{
            position: "relative",
            left: SCREEN_WIDTH / 2 - player.x * BLOCK_WIDTH,
            top: SCREEN_WIDTH / 2 - player.y * BLOCK_WIDTH
          }}
        >
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
          {exit ? (
            <div
              style={{
                position: "absolute",
                left: exit.x * BLOCK_WIDTH,
                top: exit.y * BLOCK_WIDTH,
                width: BLOCK_WIDTH,
                height: BLOCK_WIDTH,
                background: "black"
              }}
            />
          ) : null}
          {foods.map(({ x, y }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x * BLOCK_WIDTH,
                top: y * BLOCK_WIDTH,
                width: BLOCK_WIDTH,
                height: BLOCK_WIDTH,
                background: "green"
              }}
            />
          ))}
          {enemies.map(({ x, y }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x * BLOCK_WIDTH,
                top: y * BLOCK_WIDTH,
                width: BLOCK_WIDTH,
                height: BLOCK_WIDTH,
                background: "red"
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
