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
let locations = [];
let currentBuildingType = null;
let isBuildingMode = false;
let activeMiniGame = null;
let sceneRef = null;

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
    icefishing: {
        title: "Jiekŋaguollevuohta - Ice Fishing",
        text: "Ice fishing is an important traditional activity for the Sámi people. They fish through holes in the ice during winter, providing food for their families.",
        samiWord: "Jiekŋaguollevuohta (Ice Fishing)"
    },
    bidos: {
        title: "Bidos - Traditional Sámi Stew",
        text: "Bidos is a traditional Sámi stew made with reindeer meat and vegetables. It's a hearty meal that provides warmth and nutrition during the cold Arctic winters.",
        samiWord: "Bidos (Traditional Stew)"
    },
    welcome: {
        title: "Welcome to Sámi Adventure!",
        text: "Learn about Sámi culture and language while building your own Sámi settlement. Complete tasks to earn rewards and discover more about this rich culture!",
        samiWord: "Bures boahtin! (Welcome!)"
    }
};

// Location definitions
const gameLocations = [
    {
        id: 'lake',
        name: 'Lake',
        x: 800,
        y: 600,
        icon: '🏞️',
        color: 0x4169E1,
        radius: 120
    },
    {
        id: 'kitchen',
        name: 'Kitchen Area',
        x: 1200,
        y: 400,
        icon: '🍳',
        color: 0xCD853F,
        radius: 100
    }
];

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
        target: 'tent',
        requiresLocation: null
    },
    {
        id: 'ice-fishing',
        title: 'Go Ice Fishing',
        description: 'Go to the lake and catch fish through the ice. Click on the lake when you are nearby!',
        samiWord: 'Jiekŋaguollevuohta',
        progress: 0,
        maxProgress: 3,
        reward: { xp: 100, reindeer: 0 },
        type: 'location',
        target: 'lake',
        requiresLocation: 'lake',
        miniGame: 'fishing'
    },
    {
        id: 'make-bidos',
        title: 'Make Bidos (Traditional Stew)',
        description: 'Go to the kitchen area and prepare bidos by cutting vegetables. Click on the kitchen when nearby!',
        samiWord: 'Bidos',
        progress: 0,
        maxProgress: 5,
        reward: { xp: 150, reindeer: 0 },
        type: 'location',
        target: 'kitchen',
        requiresLocation: 'kitchen',
        miniGame: 'cutting'
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
        target: 'storage',
        requiresLocation: null
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
        target: 'reindeer-farm',
        requiresLocation: null
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
        target: 'reindeer',
        requiresLocation: null
    }
];

// Initialize tasks
function initializeTasks() {
    gameState.tasks = availableTasks.map(task => ({ ...task }));
}

// Phaser Game Functions
function preload() {
    sceneRef = this;
    
    // Create animated player character
    const playerGraphics = this.add.graphics();
    
    // Player body (head, torso, legs)
    // Standing frame
    playerGraphics.clear();
    playerGraphics.fillStyle(0xFF6B6B); // Head
    playerGraphics.fillCircle(16, 12, 8);
    playerGraphics.fillStyle(0x4ECDC4); // Torso
    playerGraphics.fillRect(12, 20, 8, 12);
    playerGraphics.fillStyle(0x2C3E50); // Legs
    playerGraphics.fillRect(10, 32, 4, 12);
    playerGraphics.fillRect(18, 32, 4, 12);
    playerGraphics.generateTexture('player-idle', 32, 48);
    
    // Walking frame 1
    playerGraphics.clear();
    playerGraphics.fillStyle(0xFF6B6B);
    playerGraphics.fillCircle(16, 12, 8);
    playerGraphics.fillStyle(0x4ECDC4);
    playerGraphics.fillRect(12, 20, 8, 12);
    playerGraphics.fillStyle(0x2C3E50);
    playerGraphics.fillRect(8, 32, 4, 12);
    playerGraphics.fillRect(20, 36, 4, 8);
    playerGraphics.generateTexture('player-walk1', 32, 48);
    
    // Walking frame 2
    playerGraphics.clear();
    playerGraphics.fillStyle(0xFF6B6B);
    playerGraphics.fillCircle(16, 12, 8);
    playerGraphics.fillStyle(0x4ECDC4);
    playerGraphics.fillRect(12, 20, 8, 12);
    playerGraphics.fillStyle(0x2C3E50);
    playerGraphics.fillRect(20, 32, 4, 12);
    playerGraphics.fillRect(8, 36, 4, 8);
    playerGraphics.generateTexture('player-walk2', 32, 48);
    
    // Create building textures
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
    
    // Create location markers
    this.add.graphics()
        .fillStyle(0x4169E1, 0.6)
        .fillCircle(0, 0, 120)
        .generateTexture('lake-area', 240, 240);
    
    this.add.graphics()
        .fillStyle(0xCD853F, 0.6)
        .fillCircle(0, 0, 100)
        .generateTexture('kitchen-area', 200, 200);
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
    
    // Create locations
    createLocations(this);
    
    // Create player with animations
    player = this.physics.add.sprite(
        gameState.playerPosition.x,
        gameState.playerPosition.y,
        'player-idle'
    );
    player.setCollideWorldBounds(true);
    player.setScale(1.5);
    
    // Create walking animation
    this.anims.create({
        key: 'walk',
        frames: [
            { key: 'player-walk1' },
            { key: 'player-idle' },
            { key: 'player-walk2' },
            { key: 'player-idle' }
        ],
        frameRate: 8,
        repeat: -1
    });
    
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
    
    // Initialize tasks only if not loaded from save
    if (!gameState.tasks || gameState.tasks.length === 0) {
        initializeTasks();
    }
    
    // Load existing buildings
    loadBuildings(this);
    
    // Show welcome message
    setTimeout(() => {
        showEducationalPopup('welcome');
    }, 500);
    
    // Update UI
    updateUI();
}

function createLocations(scene) {
    gameLocations.forEach(locData => {
        // Create location area
        const location = scene.add.sprite(locData.x, locData.y, locData.id + '-area');
        location.setAlpha(0.3);
        location.setInteractive();
        location.setData('locationId', locData.id);
        location.setData('locationName', locData.name);
        
        // Add location label
        const label = scene.add.text(locData.x, locData.y - locData.radius - 20, locData.name, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        });
        label.setOrigin(0.5);
        
        // Add icon
        const icon = scene.add.text(locData.x, locData.y, locData.icon, {
            fontSize: '40px',
            fontFamily: 'Arial'
        });
        icon.setOrigin(0.5);
        
        locations.push({
            sprite: location,
            label: label,
            icon: icon,
            data: locData
        });
    });
}

function update() {
    // Player movement
    const speed = 200;
    let isMoving = false;
    player.setVelocity(0);
    
    if (cursors.left.isDown || wasd.A.isDown) {
        player.setVelocityX(-speed);
        isMoving = true;
    } else if (cursors.right.isDown || wasd.D.isDown) {
        player.setVelocityX(speed);
        isMoving = true;
    }
    
    if (cursors.up.isDown || wasd.W.isDown) {
        player.setVelocityY(-speed);
        isMoving = true;
    } else if (cursors.down.isDown || wasd.S.isDown) {
        player.setVelocityY(speed);
        isMoving = true;
    }
    
    // Handle animations
    if (isMoving && !player.anims.isPlaying) {
        player.anims.play('walk', true);
    } else if (!isMoving && player.anims.isPlaying) {
        player.anims.stop();
        player.setTexture('player-idle');
    }
    
    // Update player position in state
    gameState.playerPosition = { x: player.x, y: player.y };
    
    // Check if player is near locations
    checkLocationProximity();
    
    // Auto-save every 30 seconds
    if (Math.floor(this.time.now / 1000) % 30 === 0) {
        saveGame();
    }
}

function checkLocationProximity() {
    locations.forEach(loc => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            loc.data.x, loc.data.y
        );
        
        if (distance < loc.data.radius + 20) {
            // Player is near location - highlight it
            loc.sprite.setAlpha(0.6);
            loc.label.setStyle({ fill: '#ffd700' });
        } else {
            loc.sprite.setAlpha(0.3);
            loc.label.setStyle({ fill: '#ffffff' });
        }
    });
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
    // Check location interactions first
    locations.forEach(loc => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            loc.data.x, loc.data.y
        );
        
        if (distance < loc.data.radius + 30) {
            interactWithLocation(loc.data.id, scene);
            return;
        }
    });
    
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

function interactWithLocation(locationId, scene) {
    // Find active tasks that require this location
    const activeTasks = gameState.tasks.filter(task => 
        !task.completed && 
        task.requiresLocation === locationId
    );
    
    if (activeTasks.length === 0) {
        // No active tasks for this location
        if (locationId === 'lake') {
            showEducationalPopup('icefishing');
        } else if (locationId === 'kitchen') {
            showEducationalPopup('bidos');
        }
        return;
    }
    
    // Start the mini-game for the first active task
    const task = activeTasks[0];
    if (task.miniGame) {
        startMiniGame(task.miniGame, task, scene);
    }
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
            saveGame();
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
        const locationHint = task.requiresLocation ? 
            `<div style="font-size: 12px; color: #ffd700; margin-top: 5px;">📍 Go to: ${task.requiresLocation === 'lake' ? 'Lake' : 'Kitchen Area'}</div>` : '';
        
        taskItem.innerHTML = `
            <div class="task-title">${task.title} - ${task.samiWord}</div>
            <div class="task-description">${task.description}</div>
            ${locationHint}
            <div class="task-reward">Reward: ${task.reward.xp} XP, ${task.reward.reindeer} Reindeer</div>
            <div class="task-progress">
                <div class="task-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div style="font-size: 12px; margin-top: 5px;">Progress: ${task.progress}/${task.maxProgress}</div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

// Mini-Game System
function startMiniGame(gameType, task, scene) {
    activeMiniGame = { type: gameType, task: task, scene: scene };
    
    if (gameType === 'fishing') {
        startFishingGame(task, scene);
    } else if (gameType === 'cutting') {
        startCuttingGame(task, scene);
    }
}

function startFishingGame(task, scene) {
    // Create mini-game overlay
    const overlay = document.createElement('div');
    overlay.id = 'fishing-minigame';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 5000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Ice Fishing - Jiekŋaguollevuohta</h2>
        <div style="background: #4169E1; width: 400px; height: 300px; border-radius: 10px; position: relative; overflow: hidden; border: 3px solid #fff;">
            <div id="ice-hole" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: #000; border-radius: 50%; border: 5px solid #fff;"></div>
            <div id="fish" style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%) scale(0.5); font-size: 40px; transition: all 0.3s; opacity: 0;">🐟</div>
        </div>
        <p style="margin-top: 20px; font-size: 18px;">Click when the fish appears in the hole!</p>
        <p id="fish-score" style="margin-top: 10px; font-size: 16px;">Fish caught: ${task.progress}/${task.maxProgress}</p>
        <button id="close-fishing" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    const fishElement = document.getElementById('fish');
    const scoreElement = document.getElementById('fish-score');
    let fishVisible = false;
    let fishTimer = null;
    
    function showFish() {
        fishVisible = true;
        fishElement.style.opacity = '1';
        fishElement.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // Fish disappears after 1.5 seconds
        setTimeout(() => {
            if (fishVisible) {
                hideFish();
            }
        }, 1500);
    }
    
    function hideFish() {
        fishVisible = false;
        fishElement.style.opacity = '0';
        fishElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }
    
    // Click handler for catching fish
    document.getElementById('ice-hole').addEventListener('click', () => {
        if (fishVisible) {
            task.progress++;
            scoreElement.textContent = `Fish caught: ${task.progress}/${task.maxProgress}`;
            hideFish();
            
            if (task.progress >= task.maxProgress) {
                completeTask(task);
                overlay.remove();
                activeMiniGame = null;
                showReward(`Ice Fishing Complete! +${task.reward.xp} XP`);
                showEducationalPopup('icefishing');
                return;
            }
        }
    });
    
    // Close button
    document.getElementById('close-fishing').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
    
    // Start showing fish
    function scheduleFish() {
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        fishTimer = setTimeout(() => {
            showFish();
            if (task.progress < task.maxProgress) {
                scheduleFish();
            }
        }, delay);
    }
    
    scheduleFish();
}

function startCuttingGame(task, scene) {
    // Create mini-game overlay
    const overlay = document.createElement('div');
    overlay.id = 'cutting-minigame';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 5000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Making Bidos - Cutting Vegetables</h2>
        <div style="background: #CD853F; width: 500px; height: 400px; border-radius: 10px; padding: 20px; border: 3px solid #fff; display: flex; flex-direction: column; align-items: center;">
            <div id="vegetables" style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; justify-content: center;"></div>
            <p style="margin-top: 20px; font-size: 18px;">Click on vegetables to cut them!</p>
            <p id="cut-score" style="margin-top: 10px; font-size: 16px;">Vegetables cut: ${task.progress}/${task.maxProgress}</p>
            <button id="close-cutting" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    const vegetablesContainer = document.getElementById('vegetables');
    const scoreElement = document.getElementById('cut-score');
    const vegetables = ['🥕', '🥔', '🧅', '🥬', '🌶️'];
    
    // Create vegetable buttons
    function createVegetables() {
        vegetablesContainer.innerHTML = '';
        const needed = task.maxProgress - task.progress;
        const vegsToShow = Math.min(needed, 5);
        
        for (let i = 0; i < vegsToShow; i++) {
            const veg = document.createElement('div');
            const vegType = vegetables[Math.floor(Math.random() * vegetables.length)];
            veg.textContent = vegType;
            veg.style.cssText = `
                font-size: 60px;
                cursor: pointer;
                transition: transform 0.2s;
                padding: 10px;
            `;
            
            veg.addEventListener('mouseenter', () => {
                veg.style.transform = 'scale(1.2)';
            });
            
            veg.addEventListener('mouseleave', () => {
                veg.style.transform = 'scale(1)';
            });
            
            veg.addEventListener('click', () => {
                veg.style.transform = 'scale(0.5) rotate(180deg)';
                veg.style.opacity = '0.5';
                setTimeout(() => {
                    task.progress++;
                    scoreElement.textContent = `Vegetables cut: ${task.progress}/${task.maxProgress}`;
                    
                    if (task.progress >= task.maxProgress) {
                        completeTask(task);
                        overlay.remove();
                        activeMiniGame = null;
                        showReward(`Bidos Complete! +${task.reward.xp} XP`);
                        showEducationalPopup('bidos');
                        return;
                    } else {
                        createVegetables();
                    }
                }, 300);
            });
            
            vegetablesContainer.appendChild(veg);
        }
    }
    
    createVegetables();
    
    // Close button
    document.getElementById('close-cutting').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
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
        
        // Migrate tasks if needed (add new properties to old saves)
        if (gameState.tasks && gameState.tasks.length > 0) {
            const savedTaskIds = gameState.tasks.map(t => t.id);
            gameState.tasks = gameState.tasks.map(savedTask => {
                // Find matching task template
                const template = availableTasks.find(t => t.id === savedTask.id);
                if (template) {
                    // Merge saved progress with template properties
                    return {
                        ...template,
                        progress: savedTask.progress || 0,
                        completed: savedTask.completed || false
                    };
                }
                return savedTask;
            });
            
            // Add any new tasks that weren't in the save
            availableTasks.forEach(template => {
                if (!savedTaskIds.includes(template.id)) {
                    gameState.tasks.push({ ...template });
                }
            });
        }
        
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

