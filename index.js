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
    this.horseRunAudio;
    this.horseDieAudio;
    this.horseJumpAudio;
    this.goalAudio;
    this.backgroundAudio;
    // Adjustable parameters
    this.spawnTime = 200;
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
    this.goalAudio.play();
  }

  addEnemyLevel1() {
    this.addEnemy(1, 10, 10);
  }

  addEnemyLevel2() {
    this.addEnemy(2, 12, 12);
  }

  addEnemyLevel3() {
    this.addEnemy(3, 15, 15);
  }

  addEnemyLevelMax() {
    this.addEnemy(5, 15, 15);
  }

  // maxSpawnNum: 1 ~ 5
  // maxWidth: 10 ~ 15
  // maxWidth: 10 ~ 15
  addEnemy(maxSpawnNum, maxWidth, maxHeight) {
    for (var i = 0; i < Phaser.Math.RND.between(1, maxSpawnNum); i++) {
      this.enemyGroup.create(Phaser.Math.RND.between(100, 110) / 100 * config.width, config.height, 'enemy');
      let enemies = this.enemyGroup.getChildren();
      let enemy = enemies[enemies.length - 1];
      // display scale
      enemy.setDisplaySize(config.width * Phaser.Math.RND.between(10, maxWidth) / 350, config.height * Phaser.Math.RND.between(10, maxHeight) / 80);
      enemy.setOrigin(0, 1);
      // collider body size
      enemy.setSize(enemy.width, enemy.height / 3);
      enemy.body.setAllowGravity(false);
      if (!this.gameover) {
        enemy.setVelocityX(-400 - this.score * 5);
      }
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
    this.horseDieAudio.play();
    this.horseRunAudio.pause();
    this.backgroundAudio.stop();
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
    this.load.audio('horse-run', 'assets/audio/horse-run.wav');
    this.load.audio('horse-die', 'assets/audio/horse-die.wav');
    this.load.audio('horse-jump', 'assets/audio/horse-jump.wav');
    this.load.audio('goal', 'assets/audio/goal.wav');
    this.load.audio('background', 'assets/audio/background.mp3');
    this.score = 0;
  }

  create() {
    this.physics.world.bounds.width = config.width;
    this.physics.world.bounds.height = config.height;

    this.frame = this.add.image(config.width / 2, config.height / 2, 'frame').setDisplaySize(config.width, config.height);
    this.frame.setScrollFactor(0);

    this.scoreText = this.add.text(0, 0, ['Score : ' + this.score], { font: '64px Courier', fill: '#000000' });
    this.startText = this.add.text(config.width / 2, config.height / 2, 'START', { font: '128px Courier', fill: '#000000' });
    this.startText.setOrigin(0.5);
    this.startText.setInteractive();

    this.mountains = this.add.tileSprite(0.5 * config.width, 0.4 * config.height, 0, 0, 'mountains').setDisplaySize(config.width, 0.5 * config.height);
    this.clouds = this.add.tileSprite(0.5 * config.width, 0.2 * config.height, 0, 0, 'cloud').setDisplaySize(config.width, 0.3 * config.height);
    this.grassGroup = this.add.group({ key: 'grass-small', repeat: 3 });
    this.grassGroup.children.iterate((grass) => {
      grass.setDisplaySize(Phaser.Math.RND.between(8, 10) * config.width / 150, Phaser.Math.RND.between(8, 12) * config.height / 150);
      grass.x = Phaser.Math.RND.between(0, 10) / 10 * config.width;
      grass.y = Phaser.Math.RND.between(7, 9) / 10 * config.height;
    }, this)

    this.enemyGroup = this.physics.add.group();

    this.player = this.physics.add.sprite(0.2 * config.width, config.height, 'player');
    this.player.setDisplaySize(config.width / 8, config.height / 5);
    // this.player.setScale(0.25);
    this.player.setOrigin(0, 1);
    this.player.setSize(this.player.width / 2.5, this.player.height);
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(true);

    this.horseRunAudio = this.sound.add('horse-run');
    this.horseDieAudio = this.sound.add('horse-die');
    this.horseJumpAudio = this.sound.add('horse-jump');
    this.goalAudio = this.sound.add('goal');
    this.backgroundAudio = this.sound.add('background');

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
      this.startText.setVisible(false);
      this.horseRunAudio.play({ loop: true });
      this.backgroundAudio.play({ loop: true });
      // if game is not over, click player jumps.
      this.input.on('pointerdown', function () {
        if (this.player.body.blocked.down) {
          this.player.anims.play('jump');
          this.player.setVelocityY(-800);
          this.horseJumpAudio.play();
          this.horseRunAudio.mute = true;
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
        this.horseRunAudio.mute = false;
      }

      // background animes
      this.mountains.tilePositionX += 1;
      this.clouds.tilePositionX += 2;
      this.grassGroup.children.iterate((grass) => {
        grass.x -= 1;
        if (grass.x + grass.width < 0) {
          grass.setDisplaySize(Phaser.Math.RND.between(8, 10) * config.width / 150, Phaser.Math.RND.between(8, 12) * config.height / 150);
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
        if (this.score < 4) { this.addEnemyLevel1(); }
        else if (this.score < 20) { this.addEnemyLevel2(); }
        else if (this.score < 30) { this.addEnemyLevel3(); }
        else { this.addEnemyLevelMax(); }
      } else {
        this.timeCounter += 1;
      }
    }
  }
}

// config
let config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false,
    }
  },
  scene: [HorseRunning]
};

let game = new Phaser.Game(config);

