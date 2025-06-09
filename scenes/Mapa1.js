// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Mapa1 extends Phaser.Scene {
  constructor() {
    super("mapa1");
  }

  init() {
    this.score = 0;
    this.spawnIndex = 0; // <-- Índice del spawn actual
    this.totalStars = 0; // <-- Se calculará en create()
    this.nextScoreThreshold = 100; // <-- Umbral para el siguiente spawn
  }

  preload() {

    this.load.tilemapTiledJSON("map", "public/assets/tilemap/mapa1.json");
    this.load.image("tileset", "public/assets/tilemap2_packed.png");
    this.load.image("star", "public/assets/star.png");

    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("suelo", "tileset");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createLayer("fondo", tileset, 0, 0);
    const platformLayer = map.createLayer("laberinto", tileset, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");


    // Find in the Object Layer, the name "dude" and get position
    const spawnPoint = map.findObject(
      "Objetos",
      (obj) => obj.name === "player"
    );
    console.log("spawnPoint", spawnPoint);

    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "dude");
      this.player.setScale(0.5);

this.playerSpawnPositions = [];

// Cargar los spawns en orden específico
["player", "playerSpawn2", "playerSpawn3"].forEach(name => {
  const spawn = objectsLayer.objects.find(obj => obj.name === name);
  if (spawn) {
    this.playerSpawnPositions.push({ x: spawn.x, y: spawn.y });
  }
});



    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(false);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    platformLayer.setCollisionByProperty({ esColisionable: true });
    this.physics.add.collider(this.player, platformLayer);



       // Crear grupos de estrellas y targets
    this.stars = this.physics.add.group();
    this.targets = this.physics.add.group();

    // / Crear estrellas y targets, guardando posición original de cada estrella
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, type, name } = objData;
      if (type === "star") {
        const star = this.stars.create(x, y, "star");
        star.originalX = x; // Guardar posición original
        star.originalY = y; 
      }
      if (name === "target") {
        const target = this.targets.create(x, y, "star");
        target.setTint(0xff0000);
      }
    });

    // add collision between player and stars
    this.physics.add.collider(this.stars, platformLayer);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    //colison con el target
    this.physics.add.overlap(
      this.player,
      this.targets,
      this.handleTargetCollision,
      null,
      this
    );

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "15px",
      fill: "#d9b3ff",          // lila pastel
      fontStyle: "bold",
      stroke: "#000000",        // borde negro
      strokeThickness: 4
    });

this.objectiveText = this.add.text(350, 30, 
  "Obj:\nJuntá 10 estrellas \nen cada zona\npara llegar a 300 pts\nen la última etapa", 
  {
  
    fontSize: "14px",
    fill: "#ffff00",          // amarillo intenso
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 3,
    lineSpacing: 4
  }
);




    // Configure the camera to follow the player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2); // MÁS zoom → personaje más centrado
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  
    
  }

  update() {



    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-130);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(130);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-130);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(130);
    } else {
      this.player.setVelocityY(0);
    }

    if (
      this.player.body.velocity.x === 0 &&
      this.player.body.velocity.y === 0
    ) {
      this.player.anims.play("turn");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      console.log("Phaser.Input.Keyboard.JustDown(this.keyR)");
      this.scene.restart();
    }

    // move score text to the top right corner

    this.scoreText.setPosition(
      this.cameras.main.worldView.x +
        this.cameras.main.worldView.width -
        16 -
        this.scoreText.width,
      this.cameras.main.worldView.y + 16
    );
  }

 collectStar(player, star) {
  star.disableBody(true, true);

  this.score += 10;
  this.scoreText.setText(`Score: ${this.score}`);

  // Mientras haya spawns por recorrer y se haya alcanzado el umbral
  while (
    this.spawnIndex < this.playerSpawnPositions.length - 1 &&
    this.score >= this.nextScoreThreshold
  ) {
    this.spawnIndex++;
    const nextSpawn = this.playerSpawnPositions[this.spawnIndex];
    this.player.setPosition(nextSpawn.x, nextSpawn.y);

    // Reactivar estrellas
    this.stars.children.iterate(star => {
      if (star && !star.active) {
        star.enableBody(false, star.originalX, star.originalY, true, true);
      }
    });

    this.nextScoreThreshold += 100;
  }

  // Si ya está en el último spawn Y pasó el umbral final (300 pts), gana
  if (
    this.spawnIndex === this.playerSpawnPositions.length - 1 &&
    this.score >= this.nextScoreThreshold
  ) {
    this.add.text(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY,
      "¡GANASTE!",
      {
        fontSize: "35px",
         fill: "#d9b3ff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5, 0.5);

    this.physics.pause();
    this.player.setTint(0x00ff00);
  }
}


  handleTargetCollision(player, target) {
  
    // Mostrar el texto de victoria en el centro de la vista actual de la cámara
    this.cameras.main.stopFollow(); // Deja de seguir al jugador
    this.add
      .text(
        this.cameras.main.worldView.centerX,
        this.cameras.main.worldView.centerY,
        "¡Victoria!",
        {
          fontSize: "px",
          fill: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);

    this.player.setTint(0x00ff00); // Cambiar el color del jugador para indicar victoria
  }
}
