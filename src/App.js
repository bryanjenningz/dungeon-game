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
const HOLE_WIDTH = 100;

const levelToXp = [0, 5, 15, 30, 50, 100];

const xpToLevel = xp => {
  let level;
  for (let i = 0; i < levelToXp.length; i++) {
    if (xp >= levelToXp[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

const xpUntilNextLevel = xp => levelToXp[xpToLevel(xp)] - xp;

const range = n => Array.from({ length: n }, (_, i) => i);
const randomSpawnInBox = box => ({
  x: box.x + randomInt(0, box.width),
  y: box.y + randomInt(0, box.height)
});
const randomSpawn = boxes => randomSpawnInBox(randomChoice(boxes));

class App extends Component {
  constructor() {
    super();
    const boxes = randomBoxes(40);
    const player = {
      ...randomSpawn(boxes),
      hp: 10,
      weapon: 0,
      xp: 0
    };
    const foods = range(5).map(() => randomSpawn(boxes));
    const enemies = range(5).map(() => ({ ...randomSpawn(boxes), hp: 3 }));
    const weapon = randomSpawn(boxes);
    const exit = randomSpawn(boxes);
    this.state = {
      boxes,
      player,
      foods,
      enemies,
      boss: null,
      weapon,
      exit,
      floor: 1,
      gameWin: null,
      isDark: true
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", event => {
      const arrows = { 37: "left", 38: "up", 39: "right", 40: "down" };
      if (arrows[event.keyCode]) {
        const {
          boxes,
          player,
          foods,
          enemies,
          boss,
          weapon,
          exit,
          floor,
          gameWin,
          isDark
        } = this.state;
        if (gameWin !== null) return;
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
        if (isInBounds) {
          const maybeEnemy =
            enemies.find(enemy => enemy.x === newX && enemy.y === newY) ||
            (boss &&
            boss.x <= newX &&
            newX <= boss.x + 1 &&
            boss.y <= newY &&
            newY <= boss.y + 1
              ? boss
              : null);
          if (maybeEnemy) {
            const weaponToDamage = [3, 4, 6, 8];
            const levelToDamage = [0, 0, 1, 2, 3];
            const newEnemyHp =
              maybeEnemy.hp -
              randomInt(
                1,
                weaponToDamage[player.weapon] +
                  levelToDamage[xpToLevel(player.xp)]
              );
            if (maybeEnemy === boss) {
              if (newEnemyHp <= 0) {
                this.setState({ gameWin: true });
              } else {
                const newHp = player.hp - randomInt(5, 10);
                if (newHp <= 0) {
                  this.setState({ gameWin: false });
                } else {
                  this.setState({
                    player: { ...player, hp: newHp },
                    boss: { ...boss, hp: newEnemyHp }
                  });
                }
              }
              return;
            }

            if (newEnemyHp <= 0) {
              const floorToXp = [0, 2, 3, 4];
              this.setState({
                enemies: enemies.filter(enemy => enemy !== maybeEnemy),
                player: { ...player, xp: player.xp + floorToXp[floor] }
              });
            } else {
              const floorToDamage = [0, 3, 4, 5];
              const newHp = player.hp - randomInt(1, floorToDamage[floor]);
              if (newHp <= 0) {
                this.setState({ gameWin: false });
              } else {
                this.setState({
                  enemies: enemies.map(
                    enemy =>
                      enemy === maybeEnemy
                        ? { ...enemy, hp: newEnemyHp }
                        : enemy
                  ),
                  player: { ...player, hp: newHp }
                });
              }
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
              if (weapon && weapon.x === newX && weapon.y === newY) {
                this.setState({
                  player: {
                    ...player,
                    x: newX,
                    y: newY,
                    weapon: player.weapon + 1
                  },
                  weapon: null
                });
              } else {
                if (exit && exit.x === newX && exit.y === newY) {
                  const newBoxes = randomBoxes(40);
                  const newPlayer = { ...player, ...randomSpawn(newBoxes) };
                  const newEnemies = range(5).map(() => ({
                    ...randomSpawn(newBoxes),
                    hp: floor === 1 ? 5 : 7
                  }));
                  const newFoods = range(5).map(() => randomSpawn(newBoxes));
                  const newExit = floor === 1 ? randomSpawn(newBoxes) : null;
                  const newWeapon = randomSpawn(newBoxes);
                  const newBoss =
                    floor === 2 ? { ...randomSpawn(newBoxes), hp: 20 } : null;
                  this.setState({
                    boxes: newBoxes,
                    player: newPlayer,
                    enemies: newEnemies,
                    boss: newBoss,
                    foods: newFoods,
                    weapon: newWeapon,
                    exit: newExit,
                    floor: floor + 1
                  });
                } else {
                  this.setState({ player: { ...player, x: newX, y: newY } });
                }
              }
            }
          }
        }
      }
    });
  }

  render() {
    const {
      boxes,
      player,
      foods,
      enemies,
      boss,
      weapon,
      exit,
      floor,
      gameWin,
      isDark
    } = this.state;
    return (
      <div>
        <div
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            border: "1px solid black",
            margin: "0 auto",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {gameWin === null ? (
            <div>
              {isDark ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: SCREEN_WIDTH / 2 - HOLE_WIDTH / 2,
                      top: SCREEN_WIDTH / 2 - HOLE_WIDTH / 2,
                      width: HOLE_WIDTH + BLOCK_WIDTH,
                      height: HOLE_WIDTH + BLOCK_WIDTH,
                      boxShadow: "0 0 0 99999px rgb(0, 0, 0)"
                    }}
                  />
                </div>
              ) : null}
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
                  alignItems: "center",
                  fontSize: 11,
                  color: isDark ? "white" : "black"
                }}
              >
                <div>FLOOR: {floor}</div>
                <div>LEVEL: {xpToLevel(player.xp)}</div>
                <div>XP UNTIL NEXT LEVEL: {xpUntilNextLevel(player.xp)}</div>
                <div>
                  WEAPON:{" "}
                  {
                    ["Hands", "Brass Knuckles", "Dagger", "Sword"][
                      player.weapon
                    ]
                  }
                </div>
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
                {boss ? (
                  <div
                    style={{
                      position: "absolute",
                      left: boss.x * BLOCK_WIDTH,
                      top: boss.y * BLOCK_WIDTH,
                      width: BLOCK_WIDTH * 2,
                      height: BLOCK_WIDTH * 2,
                      background: "red"
                    }}
                  />
                ) : null}
                {weapon ? (
                  <div
                    style={{
                      position: "absolute",
                      left: weapon.x * BLOCK_WIDTH,
                      top: weapon.y * BLOCK_WIDTH,
                      width: BLOCK_WIDTH,
                      height: BLOCK_WIDTH,
                      background: "yellow"
                    }}
                  />
                ) : null}
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
          ) : (
            <div
              style={{
                background: "black",
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {gameWin === true
                ? "Congratulations! You win!"
                : "Oops, you died :("}
            </div>
          )}
        </div>
        <div
          style={{
            cursor: "pointer",
            width: SCREEN_WIDTH,
            height: 50,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#10d010",
            color: "white"
          }}
          onClick={() => this.setState({ isDark: !isDark })}
        >
          TOGGLE LIGHT
        </div>
      </div>
    );
  }
}

export default App;
