class SkyPatrol extends Phaser.Scene {
    constructor() {
        super("skyPatrolScene");
        this.my = { player: {}, enemies: [], lasers: [] }; // Create an object to hold player, enemies, and lasers
        this.aircraftSpeed = 5; // Movement speed of the player aircraft
        this.shootCooldown = 200; // Cooldown time between shots
        this.lastShotTime = 0; // Timestamp of the last shot
        this.enemySpawnInterval = 5000; // Interval between enemy spawns (in milliseconds)
        this.lastSpawnTime = 0; // Timestamp of the last enemy spawn
        this.playerLives = 3; // Number of player lives
        this.score = 0; // Player score
        this.livesText = null; // Text object to display player lives
        this.scoreText = null; // Text object to display score
        this.gameOverText = null; // Text object to display "Game Over"
        this.isGameOver = false; // Flag to track game over state
        this.laserSound = null; // Laser sound effect
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("aircraftParts", "sheet.png", "sheet.xml"); // Load player aircraft assets
        this.load.image("enemyRed2", "enemyRed2.png"); // Load enemy aircraft asset
        this.load.image("enemyRed3", "enemyRed3.png"); // Load enemy aircraft asset
        this.load.audio("laserSound", ["laser1.ogg", "laser1.mp3"]); // Load laser sound effect

        // Update instruction text
        document.getElementById('description').innerHTML = '<h2>SkyPatrol.js<br>A - move left // D - move right // Space - shoot lasers</h2>';
    }

    create() {
        let my = this.my;

        // Create the main player aircraft sprite
        my.player.body = this.add.sprite(400, 500, "aircraftParts", "playerShip2_blue.png");

        // Add keyboard input listeners for continuous movement
        this.input.keyboard.on("keydown-A", () => {
            my.player.leftInput = true;
        });

        this.input.keyboard.on("keyup-A", () => {
            my.player.leftInput = false;
        });

        this.input.keyboard.on("keydown-D", () => {
            my.player.rightInput = true;
        });

        this.input.keyboard.on("keyup-D", () => {
            my.player.rightInput = false;
        });

        // Add keyboard input listeners for moving forward and backward
        this.input.keyboard.on("keydown-W", () => {
            my.player.upInput = true;
        });

        this.input.keyboard.on("keyup-W", () => {
            my.player.upInput = false;
        });

        this.input.keyboard.on("keydown-S", () => {
            my.player.downInput = true;
        });

        this.input.keyboard.on("keyup-S", () => {
            my.player.downInput = false;
        });

        // Add keyboard input listener for shooting
        this.input.keyboard.on("keydown-SPACE", () => {
            this.tryShoot();
        });

        // Display player lives
        this.livesText = this.add.text(670, 10, 'Lives: ' + this.playerLives, { fontSize: '16px', fill: '#fff' });

        // Display player score
        this.scoreText = this.add.text(670, 30, 'Score: ' + this.score, { fontSize: '16px', fill: '#fff' });

        // Initialize "Game Over" text but keep it hidden
        this.gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '32px', fill: '#fff' });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);

        // Load laser sound effect
        this.laserSound = this.sound.add("laserSound");
    }

    update() {
        if (this.isGameOver) return; // Exit update loop if game over

        let my = this.my;
        let player = my.player.body;

        // Move the player aircraft based on input
        if (my.player.leftInput) {
            player.x -= this.aircraftSpeed;
        }
        if (my.player.rightInput) {
            player.x += this.aircraftSpeed;
        }

        // Move forward
        if (my.player.upInput) {
            player.y -= this.aircraftSpeed;
        }

        // Move backward
        if (my.player.downInput) {
            player.y += this.aircraftSpeed;
        }

        // Spawn enemy aircraft periodically
        let currentTime = new Date().getTime();
        if (currentTime - this.lastSpawnTime > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
        }

        // Check for collisions between enemies and the player
        for (let i = 0; i < my.enemies.length; i++) {
            let enemy = my.enemies[i];

            // Check for collision with player
            if (Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), player.getBounds())) {
                // Reduce player lives and update display
                this.playerLives--;
                this.livesText.setText('Lives: ' + this.playerLives);

                // Destroy enemy and remove from array
                enemy.destroy();
                my.enemies.splice(i, 1);
                i--;

                // Check if player is out of lives
                if (this.playerLives <= 0) {
                    this.gameOver();
                    break; // Exit the loop
                }
            }

            enemy.y += this.aircraftSpeed; // Move enemy aircraft downwards

            // Check for collision with player lasers
            for (let j = 0; j < my.lasers.length; j++) {
                let laser = my.lasers[j];
                if (Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), laser.getBounds())) {
                    // Destroy enemy and laser if they intersect
                    enemy.destroy();
                    my.enemies.splice(i, 1);
                    i--;
                    laser.destroy();
                    my.lasers.splice(j, 1);
                    j--;

                    // Increment score and update display
                    this.score += 100;
                    this.scoreText.setText('Score: ' + this.score);

                    break; // Exit the inner loop since the laser can only hit one enemy
                }
            }

            // Remove enemy aircraft when they go out of screen
            if (enemy.y > 600) {
                enemy.destroy();
                my.enemies.splice(i, 1);
                i--;
            }
        }

        // Check if the score reaches 500
        if (this.score >= 500) {
            // Pause the game
            // this.scene.pause();
            // Display the button
            let button = this.add.text(400, 300, 'Proceed to Wave 2', { fontSize: '24px', fill: '#fff' });
            button.setOrigin(0.5);
            button.setInteractive();
            button.on('pointerdown', () => {
                // Start the second wave scene
                this.scene.start("SecondWaveScene");
            });
        }

        // Update laser positions
        for (let i = 0; i < my.lasers.length; i++) {
            let laser = my.lasers[i];
            laser.y -= 8; // Move lasers upwards
            if (laser.y < -50) {
                laser.destroy(); // Remove lasers when they go out of screen
                my.lasers.splice(i, 1);
                i--;
            }
        }
    }

    tryShoot() {
        let currentTime = new Date().getTime();
        if (currentTime - this.lastShotTime > this.shootCooldown) {
            this.shootLaser();
            this.lastShotTime = currentTime;
        }
    }

    shootLaser() {
        let laser = this.add.sprite(this.my.player.body.x, this.my.player.body.y - 50, "aircraftParts", "laserBlue01.png");
        this.my.lasers.push(laser); // Add the laser to the array
        this.laserSound.play(); // Play the laser sound effect
    }

    spawnEnemy() {
        let x = Phaser.Math.Between(50, 750); // Random x position within the screen width
        let enemy = this.add.sprite(x, -50, "enemyRed2");
        this.my.enemies.push(enemy); // Add the enemy to the array
    }

    spawnSideToSideEnemy() {
        let x = Phaser.Math.Between(50, 750); // Random x position within the screen width
        let enemy = this.add.sprite(x, -50, "enemyRed3");
        this.my.enemies.push(enemy); // Add the enemy to the array
    }

    gameOver() {
        this.isGameOver = true; // Set game over flag
        this.gameOverText.setVisible(true); // Display "Game Over" text
    }

    enemyShootLaser(enemy) {
        let laser = this.add.sprite(enemy.x, enemy.y, "aircraftParts", "laserRed01.png");
        this.physics.moveTo(laser, this.my.player.body.x, this.my.player.body.y, 200); // Move laser towards player
        this.my.lasers.push(laser);
    }
}
