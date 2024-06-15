class SecondWaveScene extends Phaser.Scene {
    constructor() {
        super("SecondWaveScene");
        this.player = null; // Reference to the player aircraft
        this.enemy = null; // Reference to the enemy aircraft
        this.enemyHealth = 5; // Enemy health
        this.enemyShootTimer = 0; // Timer for enemy shooting
        this.shootCooldown = 2000; // Cooldown time between enemy shots
        this.aircraftSpeed = 5; // Movement speed of the player aircraft
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("aircraftParts", "sheet.png", "sheet.xml"); // Load player and enemy aircraft assets
        this.load.image("laserRed01", "laserRed02.png"); // Load enemy laser asset
    }

    create() {
        // Create the player aircraft sprite
        this.player = this.add.sprite(400, 500, "aircraftParts", "playerShip2_blue.png");

        // Create the enemy aircraft sprite
        this.enemy = this.add.sprite(400, 50, "aircraftParts", "enemyRed2.png");

        // Set up the enemy's health display
        this.setupHealthDisplay();

        // Set up the main player's input
        this.setupPlayerInput();

        // Add the "Play Again" button
        this.addPlayAgainButton();
    }

    update() {
        // Move the player aircraft based on input
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('A'))) {
            this.player.x -= this.aircraftSpeed;
        }
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('D'))) {
            this.player.x += this.aircraftSpeed;
        }
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('W'))) {
            this.player.y -= this.aircraftSpeed;
        }
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('S'))) {
            this.player.y += this.aircraftSpeed;
        }

        // Move the enemy aircraft from side to side
        this.enemy.x += Math.sin(this.time.now / 1000) * 2;

        // Check if it's time for the enemy to shoot
        if (this.time.now > this.enemyShootTimer) {
            this.enemyShoot();
            this.enemyShootTimer = this.time.now + this.shootCooldown;
        }
    }

    setupHealthDisplay() {
        // Display the enemy's health using hearts
        this.hearts = [];
        for (let i = 0; i < this.enemyHealth; i++) {
            let heart = this.add.sprite(20 + i * 30, 20, "aircraftParts", "heartFull.png");
            this.hearts.push(heart);
        }
    }

    setupPlayerInput() {
        // Listen for the player to press "E" to return to the first scene
        this.input.keyboard.on("keydown-E", () => {
            this.scene.start("SkyPatrol");
        });
    }

    enemyShoot() {
        // Create a laser shot by the enemy
        let laser = this.add.sprite(this.enemy.x, this.enemy.y + 50, "laserRed01");
        laser.setOrigin(0.5, 1);
        // Move the laser downwards
        this.tweens.add({
            targets: laser,
            y: 600,
            duration: 1000,
            onComplete: () => {
                laser.destroy();
            }
        });
    }

    addPlayAgainButton() {
        // Create the "Play Again" button
        let playAgainButton = this.add.text(750, 550, 'Play Again', { fontSize: '24px', fill: '#fff' });
        playAgainButton.setOrigin(1);
        playAgainButton.setInteractive();
        playAgainButton.on('pointerdown', () => {
            // Transition to the SkyPatrol scene
            this.scene.start("skyPatrolScene");
        });
    }
}
