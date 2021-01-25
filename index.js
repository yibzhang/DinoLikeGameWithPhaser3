class HorseRunning extends Phaser.Scene {
  constructor() {
    super();

    this.frame;
    this.player;
    this.enemyGroup;
    this.clouds;
    this.mountains;
    this.grassGroup;
    this.score = 0;
    this.scoreText;
    this.startText;
    this.gameover = true;
    this.timeCounter = 0;
    // Adjustable parameters
    this.spawnTime = 100;
    this.maxSpawnNum = 3;

    Phaser.Scene.call(this, { key: 'HorseRunning', active: true });
  }

  resetScore() {
    this.score += 0;
    this.scoreText.setText(['Score : ' + this.score]);
  }

  addScore() {
    this.score += 1;
    this.scoreText.setText(['Score : ' + this.score]);
  }

  addEnemies() {
    // add randome numbers of enemies into enemyGroup
    for (var i = 0; i < Phaser.Math.RND.between(1, this.maxSpawnNum); i++) {
      this.addEnemy()
    }
  }

  addEnemy() {
    this.enemyGroup.create(Phaser.Math.RND.between(100, 110) / 100 * config.width, config.height, 'enemy');
    let enemies = this.enemyGroup.getChildren();
    let enemy = enemies[enemies.length - 1];
    // display scale
    enemy.setScale(Phaser.Math.RND.between(8, 15) / 100);
    enemy.setOrigin(0, 1);
    // collider body size
    enemy.setSize(enemy.width, enemy.height / 3);
    enemy.body.setAllowGravity(false);
    if (!this.gameover) {
      enemy.setVelocityX(-300 - this.score * 5);
    }
  }

  gameStart() {
    this.gameover = false;
    this.score = 0;
    this.scene.restart();
  }

  gameStop() {
    this.gameover = true;
    this.startText.setVisible(true);
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.player.body.setAllowGravity(false);
    this.enemyGroup.children.iterate((enemy) => {
      enemy.setVelocity(0)
    }, this);
  }

  preload() {
    this.load.image('frame', 'assets/background/frame.png');
    this.load.spritesheet('player', 'assets/player/player_horse_sheet.png', { frameWidth: 325, frameHeight: 324 });
    this.load.image('cloud', 'assets/background/cloud.png');
    this.load.image('mountains', 'assets/background/mountains.png');
    this.load.image('grass-small', 'assets/background/grass_small.png');
    this.load.image('enemy', 'assets/enemy/arrow.png');
    this.score = 0;
  }

  create() {
    this.physics.world.bounds.width = config.width;
    this.physics.world.bounds.height = config.height;

    this.frame = this.add.image(config.width / 2, config.height / 2, 'frame').setDisplaySize(config.width, config.height);
    this.frame.setScrollFactor(0);

    this.scoreText = this.add.text(0, 0, ['Score : ' + this.score], { font: '16px Courier', fill: '#000000' });
    this.startText = this.add.text(config.width / 2, config.height / 2, 'START', { font: '36px Courier', fill: '#000000' });
    this.startText.setOrigin(0.5);
    this.startText.setInteractive();

    this.mountains = this.add.tileSprite(0.5 * config.width, 0.4 * config.height, 0, 0, 'mountains').setDisplaySize(config.width, 0.5 * config.height);
    this.clouds = this.add.tileSprite(0.5 * config.width, 0.2 * config.height, 0, 0, 'cloud').setDisplaySize(config.width, 0.3 * config.height);
    this.grassGroup = this.add.group({ key: 'grass-small', repeat: 3 });
    this.grassGroup.children.iterate((grass) => {
      grass.setScale(Phaser.Math.RND.between(5, 10) / 10);
      grass.x = Phaser.Math.RND.between(0, 10) / 10 * config.width;
      grass.y = Phaser.Math.RND.between(7, 9) / 10 * config.height;
    }, this)

    this.enemyGroup = this.physics.add.group();

    this.player = this.physics.add.sprite(0.2 * config.width, config.height, 'player');
    this.player.setScale(0.25);
    this.player.setOrigin(0, 1);
    this.player.setSize(this.player.width / 2, this.player.height);
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(true);

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: 0
    });

    if (!this.gameover) {
      this.startText.setVisible(false)
      // if game is not over, click player jumps.
      this.input.on('pointerdown', function () {
        if (this.player.body.blocked.down) {
          this.player.anims.play('jump');
          this.player.setVelocityY(-400);
        }
      }, this);
    }

    // start the game
    this.startText.on('pointerdown', function () {
      if (this.gameover) {
        this.gameStart();
      }
    }, this)

    // add collider event between player and enemy group
    this.physics.add.collider(this.player, this.enemyGroup, () => {
      this.gameStop();
    });
  }

  update() {
    if (!this.gameover) {
      // player running animes
      if (this.player.body.blocked.down) {
        this.player.anims.play('run', true);
      }

      // background animes
      this.mountains.tilePositionX += 2;
      this.clouds.tilePositionX += 1;
      this.grassGroup.children.iterate((grass) => {
        grass.x -= 1;
        if (grass.x + grass.width < 0) {
          grass.setScale(Phaser.Math.RND.between(5, 10) / 10);
          grass.x = Phaser.Math.RND.between(10, 14) / 10 * config.width;
          grass.y = Phaser.Math.RND.between(7, 9) / 10 * config.height;
        }
      }, this);

      // add score
      this.enemyGroup.getChildren().forEach((enemy) => {
        if (enemy.x < 0) {
          this.addScore();
          this.enemyGroup.remove(enemy, true);
        }
      })

      // spawn enemies
      if (this.timeCounter > this.spawnTime) {
        this.timeCounter = 0;
        this.addEnemies();
      } else {
        this.timeCounter += 1;
      }
    }
  }
}

// config
let config = {
  type: Phaser.AUTO,
  width: 700,
  height: 300,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    }
  },
  scene: [HorseRunning]
};

let game = new Phaser.Game(config);

