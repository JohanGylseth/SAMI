// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
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

// Game State
let gameState = {
    level: 1,
    xp: 0,
    xpMax: 100,
    reindeer: 0,
    buildings: [],
    tasks: [],
    completedTasks: [],
    playerPosition: { x: 400, y: 300 }
};

// Game Objects
let player;
let cursors;
let wasd;
let buildings = [];
let interactables = [];
let currentBuildingType = null;
let isBuildingMode = false;

// Educational Content
const educationalContent = {
    tent: {
        title: "Lávvu - The Traditional Sámi Tent",
        text: "The lávvu is a traditional Sámi dwelling, similar to a tipi. It's portable and designed for the nomadic lifestyle, allowing Sámi people to move with their reindeer herds.",
        samiWord: "Lávvu (Tent)"
    },
    reindeer: {
        title: "Boazu - Reindeer",
        text: "Reindeer herding (boazodoallu) is central to Sámi culture. Reindeer provide food, clothing, and materials. Sámi people have been herding reindeer for thousands of years.",
        samiWord: "Boazu (Reindeer)"
    },
    farm: {
        title: "Boazodoallu - Reindeer Herding",
        text: "Reindeer herding is not just a job for the Sámi - it's a way of life that connects them to their land, culture, and traditions. Each reindeer is important to the herd.",
        samiWord: "Boazodoallu (Reindeer Herding)"
    },
    storage: {
        title: "Gárdi - Storage",
        text: "Traditional Sámi storage buildings (gárdi) were used to store food, tools, and supplies. They were built to withstand the harsh Arctic climate.",
        samiWord: "Gárdi (Storage)"
    },
    welcome: {
        title: "Welcome to Sámi Adventure!",
        text: "Learn about Sámi culture and language while building your own Sámi settlement. Complete tasks to earn rewards and discover more about this rich culture!",
        samiWord: "Bures boahtin! (Welcome!)"
    }
};

// Tasks System
const availableTasks = [
    {
        id: 'build-tent',
        title: 'Build Your First Lávvu',
        description: 'Build a traditional Sámi tent (lávvu) to learn about Sámi housing.',
        samiWord: 'Lávvu',
        progress: 0,
        maxProgress: 1,
        reward: { xp: 50, reindeer: 0 },
        type: 'build',
        target: 'tent'
    },
    {
        id: 'build-storage',
        title: 'Create Storage',
        description: 'Build a gárdi (storage) to store your supplies.',
        samiWord: 'Gárdi',
        progress: 0,
        maxProgress: 1,
        reward: { xp: 75, reindeer: 0 },
        type: 'build',
        target: 'storage'
    },
    {
        id: 'build-farm',
        title: 'Start Reindeer Herding',
        description: 'Build a reindeer farm (boazodoallu) to begin your reindeer herd.',
        samiWord: 'Boazodoallu',
        progress: 0,
        maxProgress: 1,
        reward: { xp: 200, reindeer: 5 },
        type: 'build',
        target: 'reindeer-farm'
    },
    {
        id: 'collect-reindeer',
        title: 'Grow Your Herd',
        description: 'Collect 10 reindeer to expand your herd.',
        samiWord: 'Boazu',
        progress: 0,
        maxProgress: 10,
        reward: { xp: 150, reindeer: 3 },
        type: 'collect',
        target: 'reindeer'
    }
];

// Initialize tasks
function initializeTasks() {
    gameState.tasks = availableTasks.map(task => ({ ...task }));
}

// Phaser Game Functions
function preload() {
    // Create simple colored rectangles as sprites
    this.add.graphics()
        .fillStyle(0x4a5d23)
        .fillRect(0, 0, 32, 48)
        .generateTexture('player', 32, 48);
    
    this.add.graphics()
        .fillStyle(0x8b4513)
        .fillRect(0, 0, 40, 40)
        .generateTexture('tent', 40, 40);
    
    this.add.graphics()
        .fillStyle(0x654321)
        .fillRect(0, 0, 60, 60)
        .generateTexture('reindeer-farm', 60, 60);
    
    this.add.graphics()
        .fillStyle(0x696969)
        .fillRect(0, 0, 50, 50)
        .generateTexture('storage', 50, 50);
    
    this.add.graphics()
        .fillStyle(0x228b22)
        .fillCircle(16, 16, 16)
        .generateTexture('reindeer', 32, 32);
}

function create() {
    // Create world background
    this.add.rectangle(0, 0, config.width * 2, config.height * 2, 0x87CEEB)
        .setOrigin(0, 0);
    
    // Add some terrain features
    for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(0, config.width * 2);
        const y = Phaser.Math.Between(0, config.height * 2);
        const size = Phaser.Math.Between(20, 40);
        this.add.circle(x, y, size, 0x90EE90, 0.3);
    }
    
    // Create player
    player = this.physics.add.sprite(
        gameState.playerPosition.x,
        gameState.playerPosition.y,
        'player'
    );
    player.setCollideWorldBounds(true);
    player.setScale(1.5);
    
    // Create camera to follow player
    this.cameras.main.setBounds(0, 0, config.width * 2, config.height * 2);
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(1);
    
    // Input controls
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,S,A,D');
    
    // Keyboard shortcuts
    this.input.keyboard.on('keydown-M', () => toggleMenu());
    this.input.keyboard.on('keydown-B', () => toggleBuildingPanel());
    this.input.keyboard.on('keydown-T', () => toggleTaskPanel());
    
    // Mouse click for building/interaction
    this.input.on('pointerdown', (pointer) => {
        if (isBuildingMode && currentBuildingType) {
            placeBuilding(this, pointer.worldX, pointer.worldY);
        } else {
            checkInteractions(this, pointer.worldX, pointer.worldY);
        }
    });
    
    // Load saved game
    loadGame();
    
    // Initialize tasks
    initializeTasks();
    
    // Load existing buildings
    loadBuildings(this);
    
    // Show welcome message
    setTimeout(() => {
        showEducationalPopup('welcome');
    }, 500);
    
    // Update UI
    updateUI();
}

function update() {
    // Player movement
    const speed = 200;
    player.setVelocity(0);
    
    if (cursors.left.isDown || wasd.A.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || wasd.D.isDown) {
        player.setVelocityX(speed);
    }
    
    if (cursors.up.isDown || wasd.W.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown || wasd.S.isDown) {
        player.setVelocityY(speed);
    }
    
    // Update player position in state
    gameState.playerPosition = { x: player.x, y: player.y };
    
    // Auto-save every 30 seconds
    if (Math.floor(this.time.now / 1000) % 30 === 0) {
        saveGame();
    }
}

// Building System
function toggleBuildingPanel() {
    const panel = document.getElementById('building-panel');
    panel.classList.toggle('hidden');
    isBuildingMode = !panel.classList.contains('hidden');
    if (!isBuildingMode) {
        currentBuildingType = null;
    }
}

function placeBuilding(scene, x, y) {
    if (!currentBuildingType) return;
    
    const buildingCosts = {
        'tent': 50,
        'reindeer-farm': 200,
        'storage': 100
    };
    
    const cost = buildingCosts[currentBuildingType];
    if (gameState.xp < cost) {
        alert(`Not enough XP! You need ${cost} XP to build this.`);
        return;
    }
    
    // Check if too close to other buildings
    const minDistance = 100;
    for (let building of buildings) {
        const distance = Phaser.Math.Distance.Between(x, y, building.x, building.y);
        if (distance < minDistance) {
            alert('Too close to another building!');
            return;
        }
    }
    
    // Create building sprite
    const building = scene.physics.add.sprite(x, y, currentBuildingType);
    building.setScale(1.5);
    building.setInteractive();
    building.setData('type', currentBuildingType);
    
    buildings.push(building);
    
    // Add to game state
    gameState.buildings.push({
        type: currentBuildingType,
        x: x,
        y: y
    });
    
    // Deduct XP
    gameState.xp -= cost;
    
    // Show educational content
    showEducationalPopup(currentBuildingType);
    
    // Update tasks
    updateTaskProgress('build', currentBuildingType);
    
    // Give rewards
    if (currentBuildingType === 'reindeer-farm') {
        gameState.reindeer += 3;
        showReward('You built a reindeer farm! +3 Reindeer');
    }
    
    // Update UI
    updateUI();
    
    // Save game
    saveGame();
    
    // Exit building mode
    toggleBuildingPanel();
}

function loadBuildings(scene) {
    gameState.buildings.forEach(buildingData => {
        const building = scene.physics.add.sprite(
            buildingData.x,
            buildingData.y,
            buildingData.type
        );
        building.setScale(1.5);
        building.setInteractive();
        building.setData('type', buildingData.type);
        buildings.push(building);
    });
}

// Interaction System
function checkInteractions(scene, x, y) {
    // Check building interactions
    buildings.forEach(building => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            building.x, building.y
        );
        
        if (distance < 80) {
            const type = building.getData('type');
            interactWithBuilding(type);
        }
    });
}

function interactWithBuilding(type) {
    switch(type) {
        case 'reindeer-farm':
            // Collect reindeer
            const collected = Math.floor(Math.random() * 2) + 1;
            gameState.reindeer += collected;
            gameState.xp += collected * 5;
            showReward(`Collected ${collected} reindeer! +${collected * 5} XP`);
            updateTaskProgress('collect', 'reindeer', collected);
            updateUI();
            saveGame();
            break;
        case 'tent':
            showEducationalPopup('tent');
            break;
        case 'storage':
            showEducationalPopup('storage');
            break;
    }
}

// Task System
function updateTaskProgress(type, target, amount = 1) {
    gameState.tasks.forEach(task => {
        if (task.type === type && task.target === target && !task.completed) {
            task.progress += amount;
            if (task.progress >= task.maxProgress) {
                completeTask(task);
            }
            updateTaskUI();
        }
    });
}

function completeTask(task) {
    task.completed = true;
    gameState.xp += task.reward.xp;
    gameState.reindeer += task.reward.reindeer;
    gameState.completedTasks.push(task.id);
    
    // Check for level up
    checkLevelUp();
    
    showReward(`Task Complete! +${task.reward.xp} XP, +${task.reward.reindeer} Reindeer`);
    updateUI();
    updateTaskUI();
    saveGame();
}

function checkLevelUp() {
    while (gameState.xp >= gameState.xpMax) {
        gameState.xp -= gameState.xpMax;
        gameState.level++;
        gameState.xpMax = Math.floor(gameState.xpMax * 1.5);
        showReward(`Level Up! You are now level ${gameState.level}!`);
    }
}

// UI Functions
function toggleMenu() {
    const panel = document.getElementById('menu-panel');
    panel.classList.toggle('hidden');
}

function toggleTaskPanel() {
    const panel = document.getElementById('task-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        updateTaskUI();
    }
}

function updateUI() {
    document.getElementById('player-level').textContent = gameState.level;
    document.getElementById('player-xp').textContent = gameState.xp;
    document.getElementById('player-xp-max').textContent = gameState.xpMax;
    document.getElementById('reindeer-count').textContent = gameState.reindeer;
}

function updateTaskUI() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    gameState.tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const progressPercent = Math.min((task.progress / task.maxProgress) * 100, 100);
        
        taskItem.innerHTML = `
            <div class="task-title">${task.title} - ${task.samiWord}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-reward">Reward: ${task.reward.xp} XP, ${task.reward.reindeer} Reindeer</div>
            <div class="task-progress">
                <div class="task-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div style="font-size: 12px; margin-top: 5px;">Progress: ${task.progress}/${task.maxProgress}</div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

function showReward(text) {
    const popup = document.getElementById('reward-popup');
    const rewardText = document.getElementById('reward-text');
    rewardText.textContent = text;
    popup.classList.remove('hidden');
}

function showEducationalPopup(key) {
    const content = educationalContent[key];
    if (!content) return;
    
    const popup = document.getElementById('educational-popup');
    document.getElementById('edu-title').textContent = content.title;
    document.getElementById('edu-text').textContent = content.text;
    document.getElementById('edu-sami-word').textContent = content.samiWord;
    popup.classList.remove('hidden');
}

// Save/Load System
function saveGame() {
    const saveData = {
        level: gameState.level,
        xp: gameState.xp,
        xpMax: gameState.xpMax,
        reindeer: gameState.reindeer,
        buildings: gameState.buildings,
        tasks: gameState.tasks,
        completedTasks: gameState.completedTasks,
        playerPosition: gameState.playerPosition
    };
    
    localStorage.setItem('samiAdventureSave', JSON.stringify(saveData));
    
    // Show save indicator
    const indicator = document.getElementById('save-indicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

function loadGame() {
    const saveData = localStorage.getItem('samiAdventureSave');
    if (saveData) {
        const data = JSON.parse(saveData);
        gameState = { ...gameState, ...data };
        updateUI();
    }
}

// Event Listeners
document.getElementById('save-btn').addEventListener('click', () => {
    saveGame();
    toggleMenu();
});

document.getElementById('load-btn').addEventListener('click', () => {
    loadGame();
    toggleMenu();
    location.reload(); // Reload to rebuild buildings
});

document.getElementById('close-menu-btn').addEventListener('click', toggleMenu);
document.getElementById('close-building-btn').addEventListener('click', toggleBuildingPanel);
document.getElementById('close-task-btn').addEventListener('click', toggleTaskPanel);
document.getElementById('close-reward-btn').addEventListener('click', () => {
    document.getElementById('reward-popup').classList.add('hidden');
});
document.getElementById('close-edu-btn').addEventListener('click', () => {
    document.getElementById('educational-popup').classList.add('hidden');
});

// Building button handlers
document.querySelectorAll('.build-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentBuildingType = btn.getAttribute('data-building');
        // Building will be placed on next mouse click
    });
});

// Initialize game
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

