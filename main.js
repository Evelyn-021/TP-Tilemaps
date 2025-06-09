import Mapa1 from "./scenes/Mapa1.js";
// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 480,
      height: 320,
    },
    max: {
      width: 1440,
      height: 960,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  // List of scenes to load
  // Only the first scene will be shown
  // Remember to import the scene before adding it to the list
  scene: [Mapa1]
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
