var config = {
  type: Phaser.AUTO,
  width: 512,
  height: 640,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var platforms;
var ship;
var cursors;
var pointer;
var invaders;
var score = 0;
var scoreText;
var gameOver = false;
var shots;
var explode = [];
var laser = [];
var gameOverSound;

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('background', 'assets/background.png');
  this.load.image('builds', 'assets/builds.png');
  this.load.image('ship', 'assets/ship.png');
  this.load.image('shot', 'assets/shot.png');
  this.load.spritesheet('invader1', 'assets/invader1.png', { frameWidth: 11, frameHeight: 9 });
  this.load.spritesheet('invader2', 'assets/invader2.png', { frameWidth: 11, frameHeight: 8 });
  this.load.spritesheet('invader3', 'assets/invader3.png', { frameWidth: 8, frameHeight: 8 });
  this.load.spritesheet('invader4', 'assets/invader4.png', { frameWidth: 8, frameHeight: 8 });
  this.load.spritesheet('invader5', 'assets/invader5.png', { frameWidth: 8, frameHeight: 8 });
  this.load.spritesheet('explode', 'assets/explode.png', { frameWidth: 15, frameHeight: 11 });

  this.load.audio('sExplode1', 'assets/s_explode_1.wav');
  this.load.audio('sExplode2', 'assets/s_explode_2.wav');
  this.load.audio('sExplode3', 'assets/s_explode_3.wav');
  this.load.audio('sExplode4', 'assets/s_explode_4.wav');
  this.load.audio('sLaser1', 'assets/s_laser_1.wav');
  this.load.audio('sLaser2', 'assets/s_laser_2.wav');
  this.load.audio('sGameOver', 'assets/s_gameover.wav');
}

function create() {
  this.add.tileSprite(0, 0, 1024, 1280, 'sky');
  this.add.tileSprite(0, 600, 1024, 200, 'background');
  this.add.tileSprite(0, 470, 1024, 64, 'builds');

  explode.push(this.sound.add('sExplode1'));
  explode.push(this.sound.add('sExplode2'));
  explode.push(this.sound.add('sExplode3'));
  explode.push(this.sound.add('sExplode4'));

  laser.push(this.sound.add('sLaser1'));
  laser.push(this.sound.add('sLaser2'));

  gameOverSound = this.sound.add('sGameOver');

  ship = this.physics.add.sprite(136, 550, 'ship').setScale(3);
  ship.setBounce(0);
  ship.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: 'explode',
    frames: this.anims.generateFrameNumbers('explode', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: 0
  });

  this.anims.create({
    key: 'invaderA1',
    frames: this.anims.generateFrameNumbers('invader1', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });

  this.anims.create({
    key: 'invaderA2',
    frames: this.anims.generateFrameNumbers('invader2', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });

  this.anims.create({
    key: 'invaderA3',
    frames: this.anims.generateFrameNumbers('invader3', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });

  this.anims.create({
    key: 'invaderA4',
    frames: this.anims.generateFrameNumbers('invader4', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });

  this.anims.create({
    key: 'invaderA5',
    frames: this.anims.generateFrameNumbers('invader5', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });

  invaders = this.physics.add.group({
    key: 'invader1',
    repeat: 5,
    setXY: { x: 80, y: 60, stepX: 64 },
    setScale: { x: 3.5, y: 3.5 }
  });

  invaders.createMultiple({
    key: 'invader2',
    repeat: 5,
    setXY: { x: 80, y: 100, stepX: 64 },
    setScale: { x: 3.5, y: 3.5 }
  });

  invaders.createMultiple({
    key: 'invader3',
    repeat: 5,
    setXY: { x: 80, y: 140, stepX: 64 },
    setScale: { x: 3.5, y: 3.5 }
  });

  invaders.createMultiple({
    key: 'invader4',
    repeat: 5,
    setXY: { x: 80, y: 180, stepX: 64 },
    setScale: { x: 3.5, y: 3.5 }
  });

  invaders.createMultiple({
    key: 'invader5',
    repeat: 5,
    setXY: { x: 80, y: 220, stepX: 64 },
    setScale: { x: 3.5, y: 3.5 }
  });

  invaders.children.iterate((child) => {
    switch (child.texture.key) {
      case 'invader1':
        child.anims.play('invaderA1', true);
        break;
      case 'invader2':
        child.anims.play('invaderA2', true);
        break;
      case 'invader3':
        child.anims.play('invaderA3', true);
        break;
      case 'invader4':
        child.anims.play('invaderA4', true);
        break;
      case 'invader5':
        child.anims.play('invaderA5', true);
        break;
    }
  });

  invadersLoop(this);

  shots = this.physics.add.group();

  scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: 'Consolas', fontSize: '24px', fill: '#fff' });
  this.physics.add.collider(shots, invaders, killInvader, null, this);
  this.physics.add.collider(ship, invaders, dead, null, this);
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    ship.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    ship.setVelocityX(120);
  } else {
    ship.setVelocityX(0);
  }

  if (this.input.keyboard.checkDown(cursors.up, 500)) {
    var bomb = shots.create(ship.x, ship.y, 'shot').setScale(3);
    laser[Math.floor(Math.random() * laser.length)].play();
    bomb.setBounce(0);
    bomb.setCollideWorldBounds(true);
    bomb.body.onWorldBounds = true;
    bomb.setVelocity(0, -300);
    bomb.allowGravity = false;
    bomb.body.world.on('worldbounds', function (body) {
      // Checks if it's the sprite that you'listening for
      if (body.gameObject === this) {
        // Make the enemy sprite unactived & make it disappear
        this.setActive(false);
        this.setVisible(false);
      }
    }, bomb);
  }
}

function killInvader(shot, invader) {
  shot.disableBody(true, true);
  invader.setVelocity(0);
  explode[Math.floor(Math.random() * explode.length)].play();
  invader.play('explode', false);
  invader.once('animationcomplete', () => {
    invader.disableBody(true, true);
  });

  if (invaders.countActive(true) === 0) {
  }

  score += 10;
  scoreText.setText('Score: ' + score);
}

function invadersLoop(context) {
  var timeline = context.tweens.timeline({
    targets: invaders.getChildren(),

    tweens: [
      {
        x: '+=30',
        duration: 1000
      },
      {
        y: '+=20',
        duration: 1000
      },
      {
        x: '-=30',
        duration: 1000
      },
      {
        y: '+=20',
        duration: 1000
      }
    ],
    onComplete: () => {
      if (!gameOver) {
        invadersLoop(context);
      }
    }
  });
}

function dead(ship, invaders) {
  this.physics.pause();
  gameOverSound.play();
  ship.setTint(0xff0000);
  gameOver = true;
}