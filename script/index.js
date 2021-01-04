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
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let frame;
let player;
let enemy;
let clouds;
let mountains;
let start_text;
let score = 0;
let score_text;
let grass;

let cursors;

let game = new Phaser.Game(config);

function preload() {
  this.load.image('frame', 'images/frame.png');
  this.load.spritesheet('player', 'images/player_horse_sheet.png', { frameWidth: 325, frameHeight: 324 });
  this.load.image('cloud', 'images/cloud.png');
  this.load.image('mountains', 'images/mountains.png');
  this.load.image('grass-small', 'images/grass_small.png');
  this.load.image('grass-big', 'images/grass_big.png');
}

function create() {
  this.physics.world.bounds.width = 10 * config.width;
  this.physics.world.bounds.height = config.height;
  this.cameras.main.setBounds(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);

  frame = this.add.image(0.5 * config.width, 0.5 * config.height, 'frame').setDisplaySize(config.width, config.height);
  frame.setScrollFactor(0);

  //Mountains and clouds added as Tile sprites to allow simple parallax
  mountains = this.add.tileSprite(0.5 * config.width, 0.4 * config.height, 0, 0, 'mountains').setDisplaySize(config.width, 0.5 * config.height);
  mountains.setScrollFactor(0);
  clouds = this.add.tileSprite(0.5 * config.width, 0.2 * config.height, 0, 0, 'cloud').setDisplaySize(config.width, 0.3 * config.height);
  clouds.setScrollFactor(0);

  grass = this.physics.add.staticGroup();

  //Random grass
  for (var i = 0; i < 20; i++) {
    let rndX = 0.5 + 0.01 * Phaser.Math.RND.between(0, 50);
    let rndY = 0.9 + 0.01 * Phaser.Math.RND.between(0, 10);
    let grassImage = 'grass-small';

    if (Phaser.Math.RND.normal > 0) {
      grassImage = 'grass-big';
    }

    grass.create(0.5 * config.width * i * rndX, 0.8 * config.height * rndY, grassImage).setDisplaySize(0.1 * config.height, 0.1 * config.height);
  }

  player = this.physics.add.sprite(0.5 * config.width, config.height, 'player').setScale(0.25);
  player.setCollideWorldBounds(true);
  player.setBounce(0.1);

  this.cameras.main.startFollow(player);

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 7, end: 0 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'still',
    frames: [{ key: 'player', frame: 6 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
    frameRate: 20,
    repeat: -1
  });

  //this.physics.add.collider(player, )

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  mountains.tilePositionX = this.cameras.main.scrollX * 0.1;
  clouds.tilePositionX = this.cameras.main.scrollX * 0.2;

  if (cursors.left.isDown) {
    player.anims.play('left', true);
    player.setVelocityX(-150);
  }
  else if (cursors.right.isDown) {
    player.anims.play('right', true);
    player.setVelocityX(300);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('still');
  }

  if (cursors.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-300);
  }
}
