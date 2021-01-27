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
    this.spawnTime = 200;

    this.enemySpeed = 200;
    this.playerSpeed = 450;

    this.horseRunAudio;
    this.horseDieAudio;
    this.horseJumpAudio;
    this.goalAudio;
    this.backgroundAudio;

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

  // initially spawn num of enemies with random width and height
  initEnemy(num, maxWidth, maxHeight) {
    for (var i = 0; i < num; i++) {
      this.enemyGroup.create(Phaser.Math.RND.between(105, 115) / 100 * config.width, config.height, 'enemy');
      let enemies = this.enemyGroup.getChildren();
      let enemy = enemies[enemies.length - 1];
      // display scale
      enemy.setDisplaySize(config.width * Phaser.Math.RND.between(10, maxWidth) / 350, config.height * Phaser.Math.RND.between(10, maxHeight) / 80);
      enemy.setOrigin(0, 1);
      // collider body size
      enemy.setSize(enemy.width, enemy.height / 3);
      enemy.body.setAllowGravity(false);
    }
  }

  // give num of enemies x velocity
  startEnemy(num) {
    let enemies = this.enemyGroup.getChildren();
    let counter = 0;
    for (var i = 0; i < enemies.length; i++) {
      if (counter < num && !enemies[i].body.velocity.x) {
        counter += 1;
        enemies[i].setVelocityX(-this.enemySpeed - this.score * 5);
      }
    }
  }

  resetEnemy(enemy, maxWidth, maxHeight) {
    enemy.x = Phaser.Math.RND.between(105, 115) / 100 * config.width;
    // display scale
    enemy.setDisplaySize(config.width * Phaser.Math.RND.between(10, maxWidth) / 350, config.height * Phaser.Math.RND.between(10, maxHeight) / 80);
    enemy.setOrigin(0, 1);
    // collider body size
    enemy.setSize(enemy.width, enemy.height / 3);
    enemy.setVelocityX(0);
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

  loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
      document.fonts.add(loaded);
    }).catch(function (error) {
      return error;
    });
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
    this.loadFont('MilkyNice', 'assets/fonts/MilkyNice.ttf');
    this.score = 0;
  }

  create() {
    this.physics.world.bounds.width = config.width;
    this.physics.world.bounds.height = config.height;

    this.frame = this.add.image(config.width / 2, config.height / 2, 'frame').setDisplaySize(config.width, config.height);
    this.frame.setScrollFactor(0);

    this.mountains = this.add.tileSprite(0.5 * config.width, 0.4 * config.height, 0, 0, 'mountains').setDisplaySize(config.width, 0.5 * config.height);
    this.clouds = this.add.tileSprite(0.5 * config.width, 0.2 * config.height, 0, 0, 'cloud').setDisplaySize(config.width, 0.3 * config.height);
    this.grassGroup = this.add.group({ key: 'grass-small', repeat: 3 });
    this.grassGroup.children.iterate((grass) => {
      grass.setDisplaySize(Phaser.Math.RND.between(8, 10) * config.width / 150, Phaser.Math.RND.between(8, 12) * config.height / 150);
      grass.x = Phaser.Math.RND.between(0, 10) / 10 * config.width;
      grass.y = Phaser.Math.RND.between(7, 9) / 10 * config.height;
    }, this)

    this.scoreText = this.add.text(10, 0, ['Score : ' + this.score], { fontFamily: 'MilkyNice', fontSize: 64, color: '#000000' });
    this.startText = this.add.text(config.width / 2, config.height / 2, 'START', { fontFamily: 'MilkyNice', fontSize: 128, color: '#000000' });
    this.startText.setOrigin(0.5);
    this.startText.setInteractive();

    this.enemyGroup = this.physics.add.group();
    // Initialize 10 enemies in the pool, velocity is 0
    this.initEnemy(15, 15, 15);

    this.player = this.physics.add.sprite(0.2 * config.width, config.height, 'player');
    this.player.setDisplaySize(config.width / 8, config.height / 5);
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
          this.player.setVelocityY(-this.playerSpeed);
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

    // event
    this.game.events.addListener(Phaser.Core.Events.BLUR, () => {
      this.backgroundAudio.pause();
      this.horseRunAudio.pause();
    });
    this.game.events.addListener(Phaser.Core.Events.FOCUS, () => {
      this.backgroundAudio.resume();
      this.horseRunAudio.resume();
    })
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
      this.enemyGroup.children.iterate((enemy) => {
        if (enemy.x < 0) {
          this.addScore();
          this.resetEnemy(enemy, 15, 15)
        }
      })

      // spawn enemies      
      if (this.timeCounter > this.spawnTime) {
        this.spawnTime = this.enemySpeed * Phaser.Math.RND.between(150, 200) / (this.enemySpeed + this.score * 5)
        this.timeCounter = 0;
        // set velocity for several enemies in the pool
        if (this.score < 5) { this.startEnemy(1) }
        else if (this.score < 15) { this.startEnemy(Phaser.Math.RND.between(1, 2)) }
        else if (this.score < 25) { this.startEnemy(Phaser.Math.RND.between(1, 3)) }
        else if (this.score < 35) { this.startEnemy(Phaser.Math.RND.between(1, 4)) }
        else { this.startEnemy(Phaser.Math.RND.between(1, 5)) }
      } else {
        this.timeCounter += 1;
      }
    }
  }
}

// config
let config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    }
  },
  scene: [HorseRunning]
};

let game = new Phaser.Game(config);

document.addEventListener("pause", () => {
  game.sound.mute = true;
}, false);
document.addEventListener("resume", () => {
  game.sound.mute = false;
}, false);
