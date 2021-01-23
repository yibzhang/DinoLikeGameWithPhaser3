class HorseRunning extends Phaser.Scene {
  constructor() {
    super();

    this.frame;
    this.player;
    this.enemy;
    this.clouds;
    this.mountains;
    this.grassGroup;
    this.score = 0;
    this.scoreText;
    this.startText;
    this.gameover = true;

    Phaser.Scene.call(this, { key: 'HorseRunning', active: true });
    // Phaser.Scene.call(this, 'HorseRunning')
  }

  resetScore() {
    this.score += 0;
    this.scoreText.setText(['Score : ' + this.score]);
  }

  addScore() {
    this.score += 1;
    this.scoreText.setText(['Score : ' + this.score]);
  }

  resetEnemy() {
    this.enemy.x = config.width;
    this.enemy.setVelocityX(-300 - Math.trunc(this.score / 10) * 100);
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
    this.enemy.setVelocity(0);
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

    this.enemy = this.physics.add.sprite(config.width, config.height, 'enemy');
    this.enemy.setScale(0.12);
    this.enemy.setOrigin(0, 1);
    this.enemy.setSize(0.2 * this.enemy.width, 0.4 * this.enemy.height);
    this.enemy.body.setAllowGravity(false);
    this.enemy.body.onWorldBounds = true;

    this.player = this.physics.add.sprite(0.2 * config.width, config.height, 'player');
    this.player.setScale(0.25);
    this.player.setOrigin(0, 1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(true);
    this.player.setGravityY(150);

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
      this.enemy.setVelocityX(-300);
      this.input.on('pointerdown', function () {
        if (this.player.body.blocked.down) {
          this.player.anims.play('jump');
          this.player.setVelocityY(-300);
        }
      }, this);
    }

    this.startText.on('pointerdown', function () {
      if (this.gameover) {
        this.gameStart();
      }
    }, this)

    this.physics.add.collider(this.player, this.enemy, () => {
      this.gameStop();
    });
  }

  update() {
    if (!this.gameover) {
      // player animes
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
          grass.x = config.width;
          grass.y = Phaser.Math.RND.between(7, 9) / 10 * config.height;
        }
      }, this);
      // add score
      // if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, this.enemy.getBounds())) {
      if (this.enemy.x < 0) {
        this.addScore();
        this.resetEnemy();
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [HorseRunning]
};

let game = new Phaser.Game(config);

