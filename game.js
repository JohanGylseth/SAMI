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

// Game State - Sámi Quest: Guardians of Sápmi
let gameState = {
    level: 1,
    chapter: 1, // Story chapters
    artifacts: [], // Collected artifacts: runebomme, reindeer-amulet, traditional-patterns, etc.
    culturalTokens: 0, // Cultural Knowledge Tokens earned
    quests: [], // Active quests
    completedQuests: [],
    playerPosition: { x: 400, y: 300 },
    storyProgress: 0, // Overall story progress (0-100)
    charactersMet: [], // NPCs the player has met
    locationsVisited: [] // Locations discovered
};

// Game Objects
let player;
let cursors;
let wasd;
let npcs = []; // Non-player characters
let interactables = [];
let locations = [];
let artifactSprites = []; // Artifact sprites in world
let activeMiniGame = null;
let sceneRef = null;
let currentDialogue = null;
let storyMode = false; // Whether player is in story/dialogue mode

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
    classroom: {
        title: "Skuvla - School",
        text: "Education is important in Sámi culture. Schools help preserve the Sámi language and teach about traditional ways of life.",
        samiWord: "Skuvla (School)"
    },
    painting: {
        title: "Dáidda - Art",
        text: "Sámi art includes duodji (handicrafts) and traditional patterns. Art is an important way to express Sámi culture and identity.",
        samiWord: "Dáidda (Art)"
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
        title: "Welcome to Sámi Quest: Guardians of Sápmi!",
        text: "You are a Yoik Guardian Apprentice, chosen to help protect Sápmi's cultural treasures. Ancient Sámi artifacts have been scattered across the land. Your quest is to find them by learning about Sámi culture, solving puzzles, and meeting the people of Sápmi. Each artifact you collect brings you closer to restoring the magical runebomme!",
        samiWord: "Bures boahtin! (Welcome!)"
    },
    runebomme: {
        title: "Runebomme - The Sacred Drum",
        text: "The runebomme (also called goavddis) is a traditional Sámi drum used by noaidi (shamans) for spiritual practices. It is decorated with symbols representing the Sámi worldview. This artifact represents the spiritual connection to Sápmi.",
        samiWord: "Runebomme (Sacred Drum)"
    },
    reindeerAmulet: {
        title: "Reindeer Amulet",
        text: "Reindeer are central to Sámi life. This amulet represents the deep connection between the Sámi people and their reindeer herds. Reindeer provide food, clothing, tools, and are essential to traditional Sámi livelihood.",
        samiWord: "Boazu (Reindeer)"
    },
    traditionalPattern: {
        title: "Traditional Sámi Patterns",
        text: "Duodji (Sámi handicrafts) include beautiful traditional patterns used in clothing (gákti), belts, and other items. Each pattern has meaning and is passed down through generations. These patterns represent Sámi identity and artistry.",
        samiWord: "Duodji (Handicrafts)"
    },
    yoik: {
        title: "Joik - Sámi Musical Tradition",
        text: "Joik (yoik) is a traditional Sámi form of song. It is not a song about something, but rather a way of expressing a person, place, or feeling. Joik is deeply personal and spiritual, connecting the singer to their subject. It is an important part of Sámi cultural identity.",
        samiWord: "Joik (Yoik)"
    },
    sapmi: {
        title: "Sápmi - The Sámi Homeland",
        text: "Sápmi is the traditional homeland of the Sámi people, spanning across northern Norway, Sweden, Finland, and Russia's Kola Peninsula. The Sámi are the only Indigenous people of Europe. Sápmi is not a country, but a cultural region where Sámi people have lived for thousands of years.",
        samiWord: "Sápmi (Sámi Homeland)"
    }
};

// Road grid system
const GRID_SIZE = 50; // Size of each grid cell
const ROAD_WIDTH = 40;
let roadGrid = {}; // Track which cells have roads
let playerGridX = 8; // Starting grid position (center)
let playerGridY = 8;

// Location definitions - placed at road ends
const gameLocations = [
    {
        id: 'lake',
        name: 'Lake',
        gridX: 8,
        gridY: 2, // North end
        color: 0x4169E1,
        radius: 80
    },
    {
        id: 'kitchen',
        name: 'Kitchen Area',
        gridX: 15,
        gridY: 8, // East end
        color: 0xCD853F,
        radius: 80
    },
    {
        id: 'classroom',
        name: 'Classroom',
        gridX: 1,
        gridY: 8, // West end
        color: 0x9370DB,
        radius: 80
    }
];

// Convert grid coordinates to pixel coordinates
function gridToPixel(gridX, gridY) {
    return {
        x: gridX * GRID_SIZE + GRID_SIZE / 2,
        y: gridY * GRID_SIZE + GRID_SIZE / 2
    };
}

// Convert pixel coordinates to grid coordinates
function pixelToGrid(x, y) {
    return {
        gridX: Math.floor(x / GRID_SIZE),
        gridY: Math.floor(y / GRID_SIZE)
    };
}

// Check if a grid cell has a road
function hasRoad(gridX, gridY) {
    return roadGrid[`${gridX},${gridY}`] === true;
}

// Decoration types
const decorationTypes = {
    'building-small': { name: 'Small Building', icon: '🏠', emoji: '🏠' },
    'building-large': { name: 'Large Building', icon: '🏛️', emoji: '🏛️' },
    'dog': { name: 'Dog', icon: '🐕', emoji: '🐕' },
    'reindeer': { name: 'Reindeer', icon: '🦌', emoji: '🦌' },
    'human': { name: 'Person', icon: '👤', emoji: '👤' },
    'tree': { name: 'Tree', icon: '🌲', emoji: '🌲' },
    'fire': { name: 'Campfire', icon: '🔥', emoji: '🔥' }
};

// Artifact Definitions
const artifacts = {
    'runebomme': {
        id: 'runebomme',
        name: 'Runebomme Drum',
        description: 'The sacred drum that connects to Sápmi\'s spiritual heritage',
        chapter: 7, // Final artifact
        challengeType: 'final-quest'
    },
    'reindeer-amulet': {
        id: 'reindeer-amulet',
        name: 'Reindeer Amulet',
        description: 'Represents the bond between Sámi people and reindeer',
        chapter: 2,
        challengeType: 'reindeer-herding'
    },
    'traditional-patterns': {
        id: 'traditional-patterns',
        name: 'Traditional Patterns',
        description: 'Sacred duodji patterns passed down through generations',
        chapter: 3,
        challengeType: 'duodji-crafting'
    },
    'language-stone': {
        id: 'language-stone',
        name: 'Language Stone',
        description: 'Carved with ancient Sámi words and meanings',
        chapter: 1,
        challengeType: 'language-puzzle'
    },
    'yoik-crystal': {
        id: 'yoik-crystal',
        name: 'Yoik Crystal',
        description: 'Resonates with the melodies of Sámi musical tradition',
        chapter: 4,
        challengeType: 'yoik-puzzle'
    },
    'environmental-seed': {
        id: 'environmental-seed',
        name: 'Environmental Seed',
        description: 'Represents traditional ecological knowledge',
        chapter: 5,
        challengeType: 'environmental-challenge'
    },
    'history-scroll': {
        id: 'history-scroll',
        name: 'History Scroll',
        description: 'Contains the timeline of Sámi history',
        chapter: 6,
        challengeType: 'history-timeline'
    }
};

// Quest System - Story-driven quests
const availableQuests = [
    {
        id: 'quest-1-language',
        title: 'The Language Stone',
        description: 'Meet Elder Ánne at the village. She will teach you Sámi words to unlock the Language Stone artifact.',
        samiWord: 'Giella (Language)',
        chapter: 1,
        artifact: 'language-stone',
        challengeType: 'language-puzzle',
        location: 'village',
        npc: 'elder-anne',
        progress: 0,
        maxProgress: 5,
        reward: { tokens: 10, artifact: 'language-stone' }
    },
    {
        id: 'quest-2-reindeer',
        title: 'The Reindeer Amulet',
        description: 'Help reindeer herder Máret guide her herd to safety. Learn about reindeer herding to earn the Reindeer Amulet.',
        samiWord: 'Boazodoallu (Reindeer Herding)',
        chapter: 2,
        artifact: 'reindeer-amulet',
        challengeType: 'reindeer-herding',
        location: 'tundra',
        npc: 'herder-maret',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 15, artifact: 'reindeer-amulet' }
    },
    {
        id: 'quest-3-duodji',
        title: 'Traditional Patterns',
        description: 'Visit the duodji workshop and learn to craft traditional Sámi patterns with craftsperson Nils.',
        samiWord: 'Duodji (Handicrafts)',
        chapter: 3,
        artifact: 'traditional-patterns',
        challengeType: 'duodji-crafting',
        location: 'workshop',
        npc: 'craftsperson-nils',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 15, artifact: 'traditional-patterns' }
    },
    {
        id: 'quest-4-yoik',
        title: 'The Yoik Crystal',
        description: 'Learn about joik from musician Elle. Understand the rhythm and meaning of Sámi music.',
        samiWord: 'Joik (Yoik)',
        chapter: 4,
        artifact: 'yoik-crystal',
        challengeType: 'yoik-puzzle',
        location: 'music-hut',
        npc: 'musician-elle',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 15, artifact: 'yoik-crystal' }
    },
    {
        id: 'quest-5-environmental',
        title: 'The Environmental Seed',
        description: 'Help fisherman Jovnna balance fishing, grazing, and resources to preserve the natural area.',
        samiWord: 'Eallin (Life/Environment)',
        chapter: 5,
        artifact: 'environmental-seed',
        challengeType: 'environmental-challenge',
        location: 'lake',
        npc: 'fisherman-jovnna',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 20, artifact: 'environmental-seed' }
    },
    {
        id: 'quest-6-history',
        title: 'The History Scroll',
        description: 'Travel through time portals and place key events in Sámi history on the timeline.',
        samiWord: 'Historia (History)',
        chapter: 6,
        artifact: 'history-scroll',
        challengeType: 'history-timeline',
        location: 'time-portal',
        npc: 'historian-sara',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 20, artifact: 'history-scroll' }
    },
    {
        id: 'quest-7-final',
        title: 'Restore the Runebomme',
        description: 'With all artifacts collected, restore the magical runebomme and complete your journey as a Yoik Guardian.',
        samiWord: 'Runebomme (Sacred Drum)',
        chapter: 7,
        artifact: 'runebomme',
        challengeType: 'final-quest',
        location: 'sacred-site',
        npc: 'guardian-leader',
        progress: 0,
        maxProgress: 1,
        reward: { tokens: 50, artifact: 'runebomme' },
        requiresArtifacts: ['language-stone', 'reindeer-amulet', 'traditional-patterns', 'yoik-crystal', 'environmental-seed', 'history-scroll']
    }
];

// Initialize quests
function initializeQuests() {
    gameState.quests = availableQuests
        .filter(quest => quest.chapter === gameState.chapter)
        .map(quest => ({ ...quest }));
}

// NPC Character Definitions
const npcCharacters = {
    'elder-anne': {
        id: 'elder-anne',
        name: 'Elder Ánne',
        role: 'Language Teacher',
        description: 'A wise elder who teaches the Sámi language',
        location: 'village',
        dialogue: {
            greeting: "Bures! I am Ánne. I see you are a Yoik Guardian Apprentice. To find the Language Stone, you must learn our words. Are you ready?",
            questStart: "Good! I will teach you Sámi words. Match each word to its meaning, and you will unlock the Language Stone.",
            questComplete: "Excellent! You have learned well. The Language Stone is yours. It will help you understand more about our culture."
        },
        appearance: { color: 0x8B4513, emoji: '👵' }
    },
    'herder-maret': {
        id: 'herder-maret',
        name: 'Máret',
        role: 'Reindeer Herder',
        description: 'A skilled reindeer herder who knows the ways of the tundra',
        location: 'tundra',
        dialogue: {
            greeting: "Bures! I am Máret. My reindeer need to reach the grazing area, but there are dangers. Can you help guide them?",
            questStart: "Reindeer herding is about understanding the land, seasons, and the herd. Guide my reindeer safely, and you will earn the Reindeer Amulet.",
            questComplete: "You understand the ways of reindeer herding! The Reindeer Amulet recognizes your knowledge."
        },
        appearance: { color: 0x4169E1, emoji: '👩' }
    },
    'craftsperson-nils': {
        id: 'craftsperson-nils',
        name: 'Nils',
        role: 'Duodji Craftsperson',
        description: 'A master of traditional Sámi handicrafts',
        location: 'workshop',
        dialogue: {
            greeting: "Bures! I am Nils. I create duodji - traditional Sámi handicrafts. Each pattern tells a story. Would you like to learn?",
            questStart: "To earn the Traditional Patterns artifact, you must create a piece of duodji. Assemble the pattern pieces correctly.",
            questComplete: "Beautiful work! You understand the meaning in our patterns. The Traditional Patterns artifact is yours."
        },
        appearance: { color: 0xFF6347, emoji: '👨' }
    },
    'musician-elle': {
        id: 'musician-elle',
        name: 'Elle',
        role: 'Joik Musician',
        description: 'A musician who shares the tradition of joik',
        location: 'music-hut',
        dialogue: {
            greeting: "Bures! I am Elle. Joik is not a song about something - it IS something. It connects us to people, places, and feelings.",
            questStart: "Learn the rhythm and pattern of joik. When you understand its essence, the Yoik Crystal will respond to you.",
            questComplete: "You feel the joik in your heart. The Yoik Crystal resonates with your understanding."
        },
        appearance: { color: 0x9370DB, emoji: '🎵' }
    },
    'fisherman-jovnna': {
        id: 'fisherman-jovnna',
        name: 'Jovnna',
        role: 'Fisherman',
        description: 'A fisherman who understands the balance of nature',
        location: 'lake',
        dialogue: {
            greeting: "Bures! I am Jovnna. The land gives us what we need, but we must take care of it. Balance is everything.",
            questStart: "Help me balance fishing, grazing, and resources. Traditional knowledge teaches us to respect the land. Complete this challenge to earn the Environmental Seed.",
            questComplete: "You understand traditional ecological knowledge! The Environmental Seed recognizes your wisdom."
        },
        appearance: { color: 0x20B2AA, emoji: '🎣' }
    },
    'historian-sara': {
        id: 'historian-sara',
        name: 'Sara',
        role: 'Historian',
        description: 'A keeper of Sámi history and stories',
        location: 'time-portal',
        dialogue: {
            greeting: "Bures! I am Sara. History is not just the past - it shapes who we are today. Come, travel through time with me.",
            questStart: "Place the key events of Sámi history in the correct order on the timeline. Understanding our past will unlock the History Scroll.",
            questComplete: "You understand our history! The History Scroll contains the knowledge you have gained."
        },
        appearance: { color: 0xFFD700, emoji: '📚' }
    },
    'guardian-leader': {
        id: 'guardian-leader',
        name: 'Guardian Leader',
        role: 'Yoik Guardian Leader',
        description: 'The leader of the Yoik Guardians',
        location: 'sacred-site',
        dialogue: {
            greeting: "Welcome, apprentice. You have collected all the artifacts. Now, restore the runebomme and complete your journey.",
            questStart: "With all artifacts united, the runebomme can be restored. This will complete your training as a Yoik Guardian.",
            questComplete: "Congratulations! You have restored the runebomme and become a true Yoik Guardian. Sápmi's cultural treasures are safe in your hands."
        },
        appearance: { color: 0xFF4500, emoji: '🛡️' }
    }
};

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
    
    // Create building textures - Tent (Lávvu) - triangular tent shape
    const tentGraphics = this.add.graphics();
    tentGraphics.fillStyle(0x8B4513); // Brown tent
    tentGraphics.beginPath();
    tentGraphics.moveTo(20, 5); // Top center
    tentGraphics.lineTo(5, 35); // Bottom left
    tentGraphics.lineTo(35, 35); // Bottom right
    tentGraphics.closePath();
    tentGraphics.fillPath();
    // Tent opening
    tentGraphics.fillStyle(0x654321);
    tentGraphics.fillRect(15, 25, 10, 10);
    // Tent poles
    tentGraphics.lineStyle(2, 0x654321);
    tentGraphics.lineBetween(20, 5, 20, 35);
    tentGraphics.lineBetween(5, 35, 20, 5);
    tentGraphics.lineBetween(35, 35, 20, 5);
    tentGraphics.generateTexture('tent', 40, 40);
    
    // Reindeer Farm - building with roof and fence
    const farmGraphics = this.add.graphics();
    // Building base
    farmGraphics.fillStyle(0x8B7355); // Brown building
    farmGraphics.fillRect(5, 25, 50, 35);
    // Roof
    farmGraphics.fillStyle(0x654321);
    farmGraphics.beginPath();
    farmGraphics.moveTo(5, 25);
    farmGraphics.lineTo(30, 5);
    farmGraphics.lineTo(55, 25);
    farmGraphics.closePath();
    farmGraphics.fillPath();
    // Door
    farmGraphics.fillStyle(0x4A2C2A);
    farmGraphics.fillRect(25, 40, 10, 20);
    // Windows
    farmGraphics.fillStyle(0xFFD700, 0.7);
    farmGraphics.fillRect(12, 30, 8, 8);
    farmGraphics.fillRect(40, 30, 8, 8);
    // Fence posts
    farmGraphics.fillStyle(0x654321);
    farmGraphics.fillRect(0, 50, 3, 10);
    farmGraphics.fillRect(57, 50, 3, 10);
    farmGraphics.generateTexture('reindeer-farm', 60, 60);
    
    // Storage (Gárdi) - building with roof and door
    const storageGraphics = this.add.graphics();
    // Building base
    storageGraphics.fillStyle(0x696969); // Gray building
    storageGraphics.fillRect(5, 20, 40, 30);
    // Roof
    storageGraphics.fillStyle(0x555555);
    storageGraphics.beginPath();
    storageGraphics.moveTo(5, 20);
    storageGraphics.lineTo(25, 5);
    storageGraphics.lineTo(45, 20);
    storageGraphics.closePath();
    storageGraphics.fillPath();
    // Door
    storageGraphics.fillStyle(0x4A2C2A);
    storageGraphics.fillRect(20, 35, 10, 15);
    // Door handle
    storageGraphics.fillStyle(0xFFD700);
    storageGraphics.fillCircle(28, 42, 2);
    storageGraphics.generateTexture('storage', 50, 50);
    
    // Reindeer - proper reindeer shape
    const reindeerGraphics = this.add.graphics();
    // Body (oval)
    reindeerGraphics.fillStyle(0x8B7355); // Brown body
    reindeerGraphics.fillEllipse(16, 20, 20, 14);
    // Head
    reindeerGraphics.fillStyle(0x6B5B4A);
    reindeerGraphics.fillEllipse(16, 8, 10, 8);
    // Antlers
    reindeerGraphics.lineStyle(2, 0x654321);
    reindeerGraphics.lineBetween(12, 6, 8, 2);
    reindeerGraphics.lineBetween(12, 6, 10, 2);
    reindeerGraphics.lineBetween(20, 6, 24, 2);
    reindeerGraphics.lineBetween(20, 6, 22, 2);
    // Legs (front and back, left and right)
    reindeerGraphics.fillStyle(0x654321);
    reindeerGraphics.fillRect(10, 26, 3, 6); // Front left
    reindeerGraphics.fillRect(19, 26, 3, 6); // Front right
    reindeerGraphics.fillRect(10, 28, 3, 6); // Back left
    reindeerGraphics.fillRect(19, 28, 3, 6); // Back right
    // Eye
    reindeerGraphics.fillStyle(0x000000);
    reindeerGraphics.fillCircle(14, 8, 1);
    reindeerGraphics.generateTexture('reindeer', 32, 32);
    
    // Create location markers
    this.add.graphics()
        .fillStyle(0x4169E1, 0.6)
        .fillCircle(0, 0, 120)
        .generateTexture('lake-area', 240, 240);
    
    this.add.graphics()
        .fillStyle(0xCD853F, 0.6)
        .fillCircle(0, 0, 100)
        .generateTexture('kitchen-area', 200, 200);
    
    this.add.graphics()
        .fillStyle(0x9370DB, 0.6)
        .fillCircle(0, 0, 110)
        .generateTexture('classroom-area', 220, 220);
    
    // Create decoration textures - Small Building
    const smallBuildingGraphics = this.add.graphics();
    // Building base
    smallBuildingGraphics.fillStyle(0x8B4513);
    smallBuildingGraphics.fillRect(3, 12, 24, 18);
    // Roof
    smallBuildingGraphics.fillStyle(0x654321);
    smallBuildingGraphics.beginPath();
    smallBuildingGraphics.moveTo(3, 12);
    smallBuildingGraphics.lineTo(15, 2);
    smallBuildingGraphics.lineTo(27, 12);
    smallBuildingGraphics.closePath();
    smallBuildingGraphics.fillPath();
    // Window
    smallBuildingGraphics.fillStyle(0xFFD700, 0.7);
    smallBuildingGraphics.fillRect(10, 16, 6, 6);
    // Door
    smallBuildingGraphics.fillStyle(0x4A2C2A);
    smallBuildingGraphics.fillRect(12, 22, 6, 8);
    smallBuildingGraphics.generateTexture('decoration-building-small', 30, 30);
    
    // Large Building
    const largeBuildingGraphics = this.add.graphics();
    // Building base
    largeBuildingGraphics.fillStyle(0x654321);
    largeBuildingGraphics.fillRect(4, 16, 32, 24);
    // Roof
    largeBuildingGraphics.fillStyle(0x4A2C2A);
    largeBuildingGraphics.beginPath();
    largeBuildingGraphics.moveTo(4, 16);
    largeBuildingGraphics.lineTo(20, 2);
    largeBuildingGraphics.lineTo(36, 16);
    largeBuildingGraphics.closePath();
    largeBuildingGraphics.fillPath();
    // Windows
    largeBuildingGraphics.fillStyle(0xFFD700, 0.7);
    largeBuildingGraphics.fillRect(8, 20, 6, 6);
    largeBuildingGraphics.fillRect(26, 20, 6, 6);
    // Door
    largeBuildingGraphics.fillStyle(0x2A1A1A);
    largeBuildingGraphics.fillRect(17, 28, 6, 12);
    largeBuildingGraphics.generateTexture('decoration-building-large', 40, 40);
    
    // Dog
    const dogGraphics = this.add.graphics();
    // Body
    dogGraphics.fillStyle(0xFFD700);
    dogGraphics.fillEllipse(15, 18, 12, 10);
    // Head
    dogGraphics.fillEllipse(15, 8, 8, 8);
    // Ears
    dogGraphics.fillStyle(0xD4AF37);
    dogGraphics.fillEllipse(11, 6, 3, 4);
    dogGraphics.fillEllipse(19, 6, 3, 4);
    // Legs (front and back, left and right)
    dogGraphics.fillStyle(0xD4AF37);
    dogGraphics.fillRect(10, 22, 3, 5); // Front left
    dogGraphics.fillRect(17, 22, 3, 5); // Front right
    dogGraphics.fillRect(10, 24, 3, 5); // Back left
    dogGraphics.fillRect(17, 24, 3, 5); // Back right
    // Eye
    dogGraphics.fillStyle(0x000000);
    dogGraphics.fillCircle(13, 8, 1);
    dogGraphics.generateTexture('decoration-dog', 30, 30);
    
    // Decoration Reindeer (smaller version)
    const decReindeerGraphics = this.add.graphics();
    // Body
    decReindeerGraphics.fillStyle(0x8B7355);
    decReindeerGraphics.fillEllipse(18, 22, 16, 12);
    // Head
    decReindeerGraphics.fillStyle(0x6B5B4A);
    decReindeerGraphics.fillEllipse(18, 10, 8, 7);
    // Antlers
    decReindeerGraphics.lineStyle(2, 0x654321);
    decReindeerGraphics.lineBetween(14, 8, 10, 3);
    decReindeerGraphics.lineBetween(14, 8, 12, 3);
    decReindeerGraphics.lineBetween(22, 8, 26, 3);
    decReindeerGraphics.lineBetween(22, 8, 24, 3);
    // Legs (front and back, left and right)
    decReindeerGraphics.fillStyle(0x654321);
    decReindeerGraphics.fillRect(12, 26, 2, 5); // Front left
    decReindeerGraphics.fillRect(22, 26, 2, 5); // Front right
    decReindeerGraphics.fillRect(12, 28, 2, 5); // Back left
    decReindeerGraphics.fillRect(22, 28, 2, 5); // Back right
    // Eye
    decReindeerGraphics.fillStyle(0x000000);
    decReindeerGraphics.fillCircle(16, 10, 1);
    decReindeerGraphics.generateTexture('decoration-reindeer', 36, 36);
    
    this.add.graphics()
        .fillStyle(0xFF6B6B)
        .fillCircle(0, 0, 12)
        .generateTexture('decoration-human', 24, 24);
    
    this.add.graphics()
        .fillStyle(0x228B22)
        .fillRect(0, 0, 20, 30)
        .generateTexture('decoration-tree', 20, 30);
    
    this.add.graphics()
        .fillStyle(0xFF4500)
        .fillCircle(0, 0, 15)
        .generateTexture('decoration-fire', 30, 30);
}

function create() {
    // Create world background
    this.add.rectangle(0, 0, config.width, config.height, 0x87CEEB)
        .setOrigin(0, 0);
    
    // Add mountains in background
    createMountains(this);
    
    // Add trees in background (not on roads)
    createTrees(this);
    
    // Create road system
    createRoads(this);
    
    // Create locations at road ends
    createLocations(this);
    
    // Create player with animations at starting position
    const startPos = gridToPixel(playerGridX, playerGridY);
    player = this.physics.add.sprite(startPos.x, startPos.y, 'player-idle');
    player.setCollideWorldBounds(false); // No world bounds, we control movement
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
    this.cameras.main.setBounds(0, 0, config.width, config.height);
    this.cameras.main.startFollow(player);
    this.cameras.main.setZoom(1);
    
    // Input controls
    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,S,A,D');
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Keyboard shortcuts
    this.input.keyboard.on('keydown-M', () => toggleMenu());
    this.input.keyboard.on('keydown-B', () => toggleBuildingPanel());
    this.input.keyboard.on('keydown-T', () => toggleTaskPanel());
    this.input.keyboard.on('keydown-E', () => toggleDecorationPanel());
    
    // Space bar for interaction
    this.input.keyboard.on('keydown-SPACE', () => {
        if (!isBuildingMode && !isDecorationMode) {
            interactAtCurrentLocation(this);
        }
    });
    
    // Mouse click for building/decoration placement only
    this.input.on('pointerdown', (pointer) => {
        if (isBuildingMode && currentBuildingType) {
            const grid = pixelToGrid(pointer.worldX, pointer.worldY);
            if (hasRoad(grid.gridX, grid.gridY)) {
                placeBuilding(this, pointer.worldX, pointer.worldY);
            }
        } else if (isDecorationMode && currentDecorationType) {
            placeDecoration(this, pointer.worldX, pointer.worldY);
        }
    });
    
    // Load saved game
    loadGame();
    
    // Restore player grid position
    if (gameState.playerPosition && gameState.playerPosition.gridX) {
        playerGridX = gameState.playerPosition.gridX;
        playerGridY = gameState.playerPosition.gridY;
        const pos = gridToPixel(playerGridX, playerGridY);
        player.setPosition(pos.x, pos.y);
    }
    
    // Initialize quests only if not loaded from save
    if (!gameState.quests || gameState.quests.length === 0) {
        initializeQuests();
    }
    
    // Load existing buildings
    loadBuildings(this);
    
    // Load existing decorations
    loadDecorations(this);
    
    // Show welcome message
    setTimeout(() => {
        showEducationalPopup('welcome');
    }, 500);
    
    // Update UI
    updateUI();
}

function createLocations(scene) {
    gameLocations.forEach(locData => {
        const pixelPos = gridToPixel(locData.gridX, locData.gridY);
        
        // Create location using shapes
        let locationShape;
        if (locData.id === 'lake') {
            // Create lake shape (blue circle/ellipse)
            locationShape = scene.add.ellipse(pixelPos.x, pixelPos.y, locData.radius * 2, locData.radius * 1.5, locData.color, 0.8);
            // Add wave lines
            for (let i = 0; i < 3; i++) {
                const wave = scene.add.graphics();
                wave.lineStyle(3, 0x5B9BD5, 0.6);
                wave.beginPath();
                wave.arc(pixelPos.x - locData.radius + i * 30, pixelPos.y, 20, 0, Math.PI * 2);
                wave.strokePath();
            }
        } else if (locData.id === 'kitchen') {
            // Create kitchen shape (brown rectangle with roof)
            const kitchenGraphics = scene.add.graphics();
            kitchenGraphics.fillStyle(locData.color, 0.9);
            // Building base
            kitchenGraphics.fillRect(pixelPos.x - 40, pixelPos.y - 20, 80, 50);
            // Roof (triangle)
            kitchenGraphics.fillStyle(0x8B4513, 0.9);
            kitchenGraphics.beginPath();
            kitchenGraphics.moveTo(pixelPos.x - 45, pixelPos.y - 20);
            kitchenGraphics.lineTo(pixelPos.x, pixelPos.y - 40);
            kitchenGraphics.lineTo(pixelPos.x + 45, pixelPos.y - 20);
            kitchenGraphics.closePath();
            kitchenGraphics.fillPath();
            // Door
            kitchenGraphics.fillStyle(0x654321, 1);
            kitchenGraphics.fillRect(pixelPos.x - 10, pixelPos.y + 5, 20, 25);
            locationShape = kitchenGraphics;
        } else if (locData.id === 'classroom') {
            // Create school shape (purple rectangle with flag)
            const schoolGraphics = scene.add.graphics();
            schoolGraphics.fillStyle(locData.color, 0.9);
            // Building base
            schoolGraphics.fillRect(pixelPos.x - 50, pixelPos.y - 30, 100, 70);
            // Roof
            schoolGraphics.fillStyle(0x6A5ACD, 0.9);
            schoolGraphics.fillRect(pixelPos.x - 55, pixelPos.y - 35, 110, 10);
            // Windows
            schoolGraphics.fillStyle(0xFFD700, 0.7);
            schoolGraphics.fillRect(pixelPos.x - 35, pixelPos.y - 15, 20, 20);
            schoolGraphics.fillRect(pixelPos.x + 15, pixelPos.y - 15, 20, 20);
            // Door
            schoolGraphics.fillStyle(0x654321, 1);
            schoolGraphics.fillRect(pixelPos.x - 10, pixelPos.y + 10, 20, 30);
            // Flag pole
            schoolGraphics.lineStyle(3, 0x654321, 1);
            schoolGraphics.lineBetween(pixelPos.x + 50, pixelPos.y - 30, pixelPos.x + 50, pixelPos.y - 50);
            // Flag
            schoolGraphics.fillStyle(0xFF0000, 1);
            schoolGraphics.fillRect(pixelPos.x + 50, pixelPos.y - 50, 20, 15);
            locationShape = schoolGraphics;
        }
        
        // Add location label
        const label = scene.add.text(pixelPos.x, pixelPos.y - locData.radius - 30, locData.name, {
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontFamily: 'Arial'
        });
        label.setOrigin(0.5);
        
        locations.push({
            sprite: locationShape,
            label: label,
            data: { ...locData, x: pixelPos.x, y: pixelPos.y }
        });
    });
}

let moveCooldown = 0;
const MOVE_COOLDOWN_TIME = 200; // milliseconds between moves

function update() {
    // Grid-based movement on roads only
    if (moveCooldown > 0) {
        moveCooldown -= this.game.loop.delta;
    }
    
    let moved = false;
    let targetGridX = playerGridX;
    let targetGridY = playerGridY;
    
    if (moveCooldown <= 0) {
        if (cursors.left.isDown || wasd.A.isDown) {
            targetGridX = playerGridX - 1;
            moved = true;
        } else if (cursors.right.isDown || wasd.D.isDown) {
            targetGridX = playerGridX + 1;
            moved = true;
        } else if (cursors.up.isDown || wasd.W.isDown) {
            targetGridY = playerGridY - 1;
            moved = true;
        } else if (cursors.down.isDown || wasd.S.isDown) {
            targetGridY = playerGridY + 1;
            moved = true;
        }
        
        // Only move if target cell has a road
        if (moved && hasRoad(targetGridX, targetGridY)) {
            playerGridX = targetGridX;
            playerGridY = targetGridY;
            moveCooldown = MOVE_COOLDOWN_TIME;
            
            // Animate movement
            const targetPos = gridToPixel(playerGridX, playerGridY);
            this.tweens.add({
                targets: player,
                x: targetPos.x,
                y: targetPos.y,
                duration: MOVE_COOLDOWN_TIME,
                ease: 'Linear'
            });
            
            // Play walking animation
            if (!player.anims.isPlaying) {
                player.anims.play('walk', true);
            }
        }
    }
    
    // Stop animation when not moving
    if (!moved && player.anims.isPlaying) {
        player.anims.stop();
        player.setTexture('player-idle');
    }
    
    // Update player position in state
    gameState.playerPosition = { gridX: playerGridX, gridY: playerGridY };
    
    // Check if player is at a location
    checkLocationProximity();
    
    // Auto-save every 30 seconds
    if (Math.floor(this.time.now / 1000) % 30 === 0) {
        saveGame();
    }
}

function createRoads(scene) {
    const roadGraphics = scene.add.graphics();
    roadGraphics.fillStyle(0xD2B48C, 1);
    
    const centerX = 8;
    const centerY = 8;
    
    // Horizontal road (center to east and west)
    for (let x = 1; x <= 15; x++) {
        roadGrid[`${x},${centerY}`] = true;
        roadGraphics.fillRect(x * GRID_SIZE - ROAD_WIDTH/2, centerY * GRID_SIZE - ROAD_WIDTH/2, ROAD_WIDTH, ROAD_WIDTH);
    }
    
    // Vertical road (center to north and south)
    for (let y = 2; y <= 14; y++) {
        roadGrid[`${centerX},${y}`] = true;
        roadGraphics.fillRect(centerX * GRID_SIZE - ROAD_WIDTH/2, y * GRID_SIZE - ROAD_WIDTH/2, ROAD_WIDTH, ROAD_WIDTH);
    }
    
    // Add location cells to road grid so player can reach them
    gameLocations.forEach(loc => {
        roadGrid[`${loc.gridX},${loc.gridY}`] = true;
    });
}

function createMountains(scene) {
    // Create mountain shapes in background
    const mountains = [
        { x: 100, y: 100, width: 200, height: 150 },
        { x: 300, y: 80, width: 180, height: 140 },
        { x: 500, y: 120, width: 220, height: 160 },
        { x: 1200, y: 100, width: 200, height: 150 },
        { x: 1000, y: 80, width: 180, height: 140 },
        { x: 100, y: 600, width: 200, height: 150 },
        { x: 300, y: 580, width: 180, height: 140 },
        { x: 1200, y: 600, width: 200, height: 150 },
    ];
    
    mountains.forEach(m => {
        // Create triangular mountain shape
        const mountain = scene.add.graphics();
        mountain.fillStyle(0x696969, 0.7);
        mountain.beginPath();
        mountain.moveTo(m.x, m.y + m.height);
        mountain.lineTo(m.x + m.width/2, m.y);
        mountain.lineTo(m.x + m.width, m.y + m.height);
        mountain.closePath();
        mountain.fillPath();
        
        // Add snow cap
        const snow = scene.add.graphics();
        snow.fillStyle(0xFFFFFF, 0.8);
        snow.beginPath();
        snow.moveTo(m.x + m.width/2 - 30, m.y + 20);
        snow.lineTo(m.x + m.width/2, m.y);
        snow.lineTo(m.x + m.width/2 + 30, m.y + 20);
        snow.closePath();
        snow.fillPath();
    });
}

function createTrees(scene) {
    // Create trees avoiding road areas
    const treePositions = [
        { x: 150, y: 200 }, { x: 250, y: 180 }, { x: 350, y: 220 },
        { x: 550, y: 200 }, { x: 650, y: 180 }, { x: 750, y: 220 },
        { x: 950, y: 200 }, { x: 1050, y: 180 }, { x: 1150, y: 220 },
        { x: 150, y: 500 }, { x: 250, y: 480 }, { x: 350, y: 520 },
        { x: 550, y: 500 }, { x: 750, y: 480 }, { x: 850, y: 520 },
        { x: 950, y: 500 }, { x: 1050, y: 480 }, { x: 1150, y: 520 },
    ];
    
    treePositions.forEach(pos => {
        const grid = pixelToGrid(pos.x, pos.y);
        // Only place trees where there's no road
        if (!hasRoad(grid.gridX, grid.gridY)) {
            // Trunk
            scene.add.rectangle(pos.x, pos.y, 12, 30, 0x8B4513, 0.8);
            // Leaves (circle)
            scene.add.circle(pos.x, pos.y - 15, 25, 0x228B22, 0.7);
        }
    });
}

function interactAtCurrentLocation(scene) {
    // Check if player is at a location
    locations.forEach(loc => {
        if (playerGridX === loc.data.gridX && playerGridY === loc.data.gridY) {
            interactWithLocation(loc.data.id, scene);
        }
    });
    
    // Check if player is near a building
    buildings.forEach(building => {
        const buildingGrid = pixelToGrid(building.x, building.y);
        if (playerGridX === buildingGrid.gridX && playerGridY === buildingGrid.gridY) {
            const type = building.getData('type');
            interactWithBuilding(type);
        }
    });
}

function checkLocationProximity() {
    locations.forEach(loc => {
        if (playerGridX === loc.data.gridX && playerGridY === loc.data.gridY) {
            // Player is at location - highlight it
            if (loc.sprite && loc.sprite.setAlpha) {
                loc.sprite.setAlpha(1);
            }
            if (loc.label) {
                loc.label.setStyle({ fill: '#ffd700', fontSize: '20px' });
            }
        } else {
            if (loc.sprite && loc.sprite.setAlpha) {
                loc.sprite.setAlpha(0.8);
            }
            if (loc.label) {
                loc.label.setStyle({ fill: '#ffffff', fontSize: '18px' });
            }
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
    
    const grid = pixelToGrid(x, y);
    
    // Check if too close to other buildings (same grid cell)
    for (let building of buildings) {
        const buildingGrid = pixelToGrid(building.x, building.y);
        if (grid.gridX === buildingGrid.gridX && grid.gridY === buildingGrid.gridY) {
            alert('A building is already here!');
            return;
        }
    }
    
    // Place at grid center
    const gridPos = gridToPixel(grid.gridX, grid.gridY);
    x = gridPos.x;
    y = gridPos.y;
    
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
    
    // Show educational content
    showEducationalPopup(currentBuildingType);
    
    // Update tasks
    updateTaskProgress('build', currentBuildingType);
    
    // Update UI
    updateUI();
    
    // Save game
    saveGame();
    
    // Exit building mode
    toggleBuildingPanel();
}

function toggleDecorationPanel() {
    const panel = document.getElementById('decoration-panel');
    panel.classList.toggle('hidden');
    isDecorationMode = !panel.classList.contains('hidden');
    if (!isDecorationMode) {
        currentDecorationType = null;
    } else {
        updateDecorationPanel();
    }
}

function updateDecorationPanel() {
    const container = document.getElementById('decoration-options');
    container.innerHTML = '';
    
    if (gameState.decorationsUnlocked.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Complete tasks to unlock decorations!</p>';
        return;
    }
    
    gameState.decorationsUnlocked.forEach(decType => {
        const dec = decorationTypes[decType];
        if (!dec) return;
        
        const count = gameState.decorations.filter(d => d.type === decType).length;
        const btn = document.createElement('button');
        btn.className = 'decoration-btn';
        btn.innerHTML = `
            <div style="font-size: 48px;">${dec.emoji}</div>
            <div style="font-weight: bold; margin-top: 5px;">${dec.name}</div>
            <div style="font-size: 12px; color: #ffd700;">Placed: ${count}</div>
        `;
        btn.setAttribute('data-decoration', decType);
        btn.style.cssText = `
            background: rgba(102, 126, 234, 0.2);
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s;
            color: white;
            text-align: center;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(102, 126, 234, 0.4)';
            btn.style.transform = 'scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(102, 126, 234, 0.2)';
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            currentDecorationType = decType;
            document.querySelectorAll('.decoration-btn').forEach(b => {
                b.style.borderColor = '#667eea';
            });
            btn.style.borderColor = '#ffd700';
        });
        
        container.appendChild(btn);
    });
}

function placeDecoration(scene, x, y) {
    if (!currentDecorationType) return;
    
    // Create decoration sprite
    const decoration = scene.add.sprite(x, y, 'decoration-' + currentDecorationType);
    decoration.setScale(1.2);
    decoration.setInteractive();
    decoration.setData('type', currentDecorationType);
    
    decorations.push(decoration);
    
    // Add to game state
    gameState.decorations.push({
        type: currentDecorationType,
        x: x,
        y: y
    });
    
    // Update UI
    updateUI();
    
    // Save game
    saveGame();
}

function loadDecorations(scene) {
    if (!gameState.decorations) return;
    
    gameState.decorations.forEach(decData => {
        const decoration = scene.add.sprite(decData.x, decData.y, 'decoration-' + decData.type);
        decoration.setScale(1.2);
        decoration.setInteractive();
        decoration.setData('type', decData.type);
        decorations.push(decoration);
    });
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

// Interaction System - now handled by space bar in update()

function interactWithLocation(locationId, scene) {
    // Find quests that require this location
    const activeQuests = gameState.quests.filter(quest => 
        !quest.completed && 
        quest.location === locationId
    );
    
    if (activeQuests.length > 0) {
        // Find NPC for this quest
        const quest = activeQuests[0];
        if (quest.npc) {
            showNPCDialogue(quest.npc, quest);
            return;
        }
    }
    
    // Check if there's an NPC at this location (for general interaction)
    const npcAtLocation = Object.values(npcCharacters).find(npc => npc.location === locationId);
    if (npcAtLocation) {
        // Find associated quest
        const associatedQuest = gameState.quests.find(q => q.npc === npcAtLocation.id);
        showNPCDialogue(npcAtLocation.id, associatedQuest);
        return;
    }
    
    // Fallback: show educational content for location
    if (locationId === 'lake') {
        showEducationalPopup('icefishing');
    } else if (locationId === 'kitchen') {
        showEducationalPopup('bidos');
    } else if (locationId === 'classroom') {
        showClassroomMenu(scene);
    } else {
        // Track location visit
        if (!gameState.locationsVisited.includes(locationId)) {
            gameState.locationsVisited.push(locationId);
        }
    }
}

function showClassroomMenu(scene) {
    const overlay = document.createElement('div');
    overlay.id = 'classroom-menu';
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
        <h2 style="margin-bottom: 30px; color: #ffd700; font-size: 32px;">Classroom - Skuvla</h2>
        <div style="display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;">
            <button id="paint-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 30px 40px; border-radius: 15px; cursor: pointer; font-size: 20px; min-width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 48px; margin-bottom: 10px;">🎨</div>
                <div>Paint</div>
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">Dáidda</div>
            </button>
            <button id="language-quiz-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 30px 40px; border-radius: 15px; cursor: pointer; font-size: 20px; min-width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 48px; margin-bottom: 10px;">📚</div>
                <div>Language Quiz</div>
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">Giella</div>
            </button>
            <button id="history-quiz-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 30px 40px; border-radius: 15px; cursor: pointer; font-size: 20px; min-width: 200px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <div style="font-size: 48px; margin-bottom: 10px;">📖</div>
                <div>History Quiz</div>
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">Historia</div>
            </button>
        </div>
        <button id="close-classroom" style="margin-top: 30px; padding: 12px 30px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('paint-btn').addEventListener('click', () => {
        overlay.remove();
        const task = gameState.tasks.find(t => t.id === 'paint' && !t.completed);
        if (task) {
            startMiniGame('painting', task, scene);
        } else {
            startMiniGame('painting', { id: 'paint', progress: 0, maxProgress: 1, reward: { decorations: ['human', 'tree'] } }, scene);
        }
    });
    
    document.getElementById('language-quiz-btn').addEventListener('click', () => {
        overlay.remove();
        const task = gameState.tasks.find(t => t.id === 'language-quiz' && !t.completed);
        if (task) {
            startMiniGame('language-quiz', task, scene);
        } else {
            startMiniGame('language-quiz', { id: 'language-quiz', progress: 0, maxProgress: 5, reward: { decorations: ['building-small', 'dog'] } }, scene);
        }
    });
    
    document.getElementById('history-quiz-btn').addEventListener('click', () => {
        overlay.remove();
        const task = gameState.tasks.find(t => t.id === 'history-quiz' && !t.completed);
        if (task) {
            startMiniGame('history-quiz', task, scene);
        } else {
            startMiniGame('history-quiz', { id: 'history-quiz', progress: 0, maxProgress: 5, reward: { decorations: ['building-large', 'reindeer'] } }, scene);
        }
    });
    
    document.getElementById('close-classroom').addEventListener('click', () => {
        overlay.remove();
    });
}

function interactWithBuilding(type) {
    switch(type) {
        case 'reindeer-farm':
            // Give decoration reward
            if (!gameState.decorationsUnlocked.includes('reindeer')) {
                gameState.decorationsUnlocked.push('reindeer');
            }
            showReward('You can now place reindeer decorations!');
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
    gameState.completedTasks.push(task.id);
    
    // Give decoration rewards
    if (task.reward && task.reward.decorations) {
        task.reward.decorations.forEach(decorationType => {
            if (!gameState.decorationsUnlocked.includes(decorationType)) {
                gameState.decorationsUnlocked.push(decorationType);
            }
        });
        
        const rewardText = `Task Complete! You earned: ${task.reward.decorations.map(d => decorationTypes[d].name).join(', ')}`;
        showReward(rewardText);
        showDecorationReward(task.reward.decorations);
    }
    
    updateUI();
    updateTaskUI();
    saveGame();
}

function showDecorationReward(decorationTypes) {
    setTimeout(() => {
        const message = `You can now place these decorations! Press E to open the decoration menu.`;
        alert(message);
    }, 2000);
}

// UI Functions
function toggleMenu() {
    const panel = document.getElementById('menu-panel');
    panel.classList.toggle('hidden');
}

function toggleTaskPanel() {
    const panel = document.getElementById('task-panel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            updateQuestUI();
        }
    }
}

// NPC Dialogue System
function showNPCDialogue(npcId, quest) {
    const npc = npcCharacters[npcId];
    if (!npc) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'npc-dialogue';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); z-index: 4000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    let dialogueText = npc.dialogue.greeting;
    if (quest && quest.completed) {
        dialogueText = npc.dialogue.questComplete;
    } else if (quest) {
        dialogueText = npc.dialogue.questStart;
    }
    
    overlay.innerHTML = `
        <div style="background: rgba(30, 30, 40, 0.95); padding: 40px; border-radius: 15px; max-width: 600px; border: 3px solid #667eea;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="font-size: 64px; margin-right: 20px;">${npc.appearance.emoji}</div>
                <div>
                    <h2 style="color: #ffd700; margin: 0;">${npc.name}</h2>
                    <p style="color: #aaa; margin: 5px 0 0 0;">${npc.role}</p>
                </div>
            </div>
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">${dialogueText}</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                ${quest && !quest.completed ? `
                    <button id="start-quest" style="padding: 12px 30px; font-size: 16px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">Start Quest</button>
                ` : ''}
                <button id="close-dialogue" style="padding: 12px 30px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    if (quest && !quest.completed) {
        document.getElementById('start-quest').addEventListener('click', () => {
            overlay.remove();
            if (quest.challengeType) {
                startMiniGame(quest.challengeType, quest, sceneRef);
            }
        });
    }
    
    document.getElementById('close-dialogue').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Track that player met this NPC
    if (!gameState.charactersMet.includes(npcId)) {
        gameState.charactersMet.push(npcId);
    }
}

function updateUI() {
    // Update chapter/level display
    if (document.getElementById('player-level')) {
        document.getElementById('player-level').textContent = `Chapter ${gameState.chapter}`;
    }
    
    // Update cultural tokens
    if (document.getElementById('player-xp')) {
        document.getElementById('player-xp').textContent = gameState.culturalTokens;
    }
    if (document.getElementById('player-xp-max')) {
        document.getElementById('player-xp-max').textContent = 'Tokens';
    }
    
    // Update artifacts count
    if (document.getElementById('reindeer-count')) {
        document.getElementById('reindeer-count').textContent = `${gameState.artifacts.length}/7`;
    }
    
    // Update story progress if element exists
    const progressEl = document.getElementById('story-progress');
    if (progressEl) {
        progressEl.textContent = `Story: ${gameState.storyProgress}%`;
    }
}

function updateQuestUI() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    // Show active quests for current chapter
    const activeQuests = gameState.quests.filter(q => !q.completed);
    const completedQuests = gameState.quests.filter(q => q.completed);
    
    // Show active quests first
    activeQuests.forEach(quest => {
        const questItem = document.createElement('div');
        questItem.className = `task-item`;
        
        const progressPercent = Math.min((quest.progress / quest.maxProgress) * 100, 100);
        const locationHint = quest.location ? 
            `<div style="font-size: 12px; color: #ffd700; margin-top: 5px;">📍 Location: ${quest.location}</div>` : '';
        
        const rewardText = quest.reward ? 
            `Reward: ${quest.reward.tokens || 0} Tokens + ${artifacts[quest.reward.artifact]?.name || 'Artifact'}` :
            'Reward: Artifact';
        
        questItem.innerHTML = `
            <div class="task-title">${quest.title} - ${quest.samiWord}</div>
            <div class="task-description">${quest.description}</div>
            ${locationHint}
            <div class="task-reward">${rewardText}</div>
            <div class="task-progress">
                <div class="task-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div style="font-size: 12px; margin-top: 5px;">Progress: ${quest.progress}/${quest.maxProgress}</div>
        `;
        
        taskList.appendChild(questItem);
    });
    
    // Show completed quests
    completedQuests.forEach(quest => {
        const questItem = document.createElement('div');
        questItem.className = `task-item completed`;
        questItem.innerHTML = `
            <div class="task-title">✓ ${quest.title} - ${quest.samiWord}</div>
            <div class="task-description" style="opacity: 0.7;">${quest.description}</div>
            <div style="font-size: 12px; color: #27ae60; margin-top: 5px;">✓ Completed</div>
        `;
        taskList.appendChild(questItem);
    });
    
    // Show artifact collection
    if (gameState.artifacts.length > 0) {
        const artifactSection = document.createElement('div');
        artifactSection.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;';
        artifactSection.innerHTML = `
            <div style="font-weight: bold; color: #ffd700; margin-bottom: 10px;">Artifacts Collected: ${gameState.artifacts.length}/7</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${gameState.artifacts.map(a => {
                    const art = artifacts[a];
                    return `<div style="padding: 5px 10px; background: rgba(255, 215, 0, 0.2); border: 1px solid #ffd700; border-radius: 5px; font-size: 12px;">✨ ${art?.name || a}</div>`;
                }).join('')}
            </div>
        `;
        taskList.appendChild(artifactSection);
    }
}

// Mini-Game System - All Challenge Types
function startMiniGame(gameType, quest, scene) {
    activeMiniGame = { type: gameType, quest: quest, scene: scene };
    
    if (gameType === 'language-puzzle') {
        startLanguagePuzzle(quest, scene);
    } else if (gameType === 'reindeer-herding') {
        startReindeerHerdingGame(quest, scene);
    } else if (gameType === 'duodji-crafting') {
        startDuodjiCraftingGame(quest, scene);
    } else if (gameType === 'yoik-puzzle') {
        startYoikPuzzle(quest, scene);
    } else if (gameType === 'environmental-challenge') {
        startEnvironmentalChallenge(quest, scene);
    } else if (gameType === 'history-timeline') {
        startHistoryTimelineQuest(quest, scene);
    } else if (gameType === 'final-quest') {
        startFinalQuest(quest, scene);
    } else if (gameType === 'fishing') {
        startFishingGame(quest, scene);
    } else if (gameType === 'cutting') {
        startCuttingGame(quest, scene);
    } else if (gameType === 'painting') {
        startPaintingGame(quest, scene);
    } else if (gameType === 'language-quiz') {
        startLanguageQuiz(quest, scene);
    } else if (gameType === 'history-quiz') {
        startHistoryQuiz(quest, scene);
    }
}

// Challenge Type 1: Language Puzzle
function startLanguagePuzzle(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'language-puzzle';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    const samiWords = [
        { word: 'Boazu', meaning: 'Reindeer', image: '🦌' },
        { word: 'Lávvu', meaning: 'Tent', image: '⛺' },
        { word: 'Giella', meaning: 'Language', image: '📚' },
        { word: 'Skuvla', meaning: 'School', image: '🏫' },
        { word: 'Duodji', meaning: 'Handicrafts', image: '🎨' },
        { word: 'Gákti', meaning: 'Traditional Clothing', image: '👕' },
        { word: 'Joik', meaning: 'Yoik (Song)', image: '🎵' },
        { word: 'Sápmi', meaning: 'Sámi Homeland', image: '🗺️' }
    ];
    
    let currentMatches = 0;
    let selectedWord = null;
    let selectedMeaning = null;
    const matchedPairs = [];
    
    function createGame() {
        const shuffledWords = [...samiWords].sort(() => Math.random() - 0.5);
        const shuffledMeanings = [...samiWords].map(w => w.meaning).sort(() => Math.random() - 0.5);
        
        overlay.innerHTML = `
            <h2 style="margin-bottom: 20px; color: #ffd700;">Language Puzzle - Match Sámi Words</h2>
            <p style="margin-bottom: 20px;">Match each Sámi word to its meaning. Complete ${quest.maxProgress} matches to earn the Language Stone!</p>
            <div style="display: flex; gap: 30px; margin-bottom: 20px;">
                <div id="words-column" style="display: flex; flex-direction: column; gap: 10px;"></div>
                <div id="meanings-column" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
            <p id="match-progress" style="margin-top: 20px;">Matches: ${currentMatches}/${quest.maxProgress}</p>
            <button id="close-language" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        `;
        
        const wordsCol = document.getElementById('words-column');
        const meaningsCol = document.getElementById('meanings-column');
        
        shuffledWords.slice(0, quest.maxProgress).forEach((wordObj, idx) => {
            if (matchedPairs.includes(idx)) return;
            
            const wordBtn = document.createElement('button');
            wordBtn.textContent = `${wordObj.image} ${wordObj.word}`;
            wordBtn.style.cssText = 'padding: 15px 20px; font-size: 16px; background: rgba(102, 126, 234, 0.3); color: white; border: 2px solid #667eea; border-radius: 10px; cursor: pointer; min-width: 200px;';
            wordBtn.addEventListener('click', () => {
                document.querySelectorAll('#words-column button').forEach(b => b.style.borderColor = '#667eea');
                wordBtn.style.borderColor = '#ffd700';
                selectedWord = wordObj;
                checkMatch();
            });
            wordsCol.appendChild(wordBtn);
        });
        
        shuffledMeanings.slice(0, quest.maxProgress).forEach((meaning, idx) => {
            const meaningBtn = document.createElement('button');
            meaningBtn.textContent = meaning;
            meaningBtn.style.cssText = 'padding: 15px 20px; font-size: 16px; background: rgba(102, 126, 234, 0.3); color: white; border: 2px solid #667eea; border-radius: 10px; cursor: pointer; min-width: 200px;';
            meaningBtn.addEventListener('click', () => {
                document.querySelectorAll('#meanings-column button').forEach(b => b.style.borderColor = '#667eea');
                meaningBtn.style.borderColor = '#ffd700';
                selectedMeaning = meaning;
                checkMatch();
            });
            meaningsCol.appendChild(meaningBtn);
        });
        
        function checkMatch() {
            if (selectedWord && selectedMeaning) {
                if (selectedWord.meaning === selectedMeaning) {
                    currentMatches++;
                    document.getElementById('match-progress').textContent = `Matches: ${currentMatches}/${quest.maxProgress}`;
                    selectedWord = null;
                    selectedMeaning = null;
                    
                    if (currentMatches >= quest.maxProgress) {
                        completeQuest(quest);
                        overlay.remove();
                        activeMiniGame = null;
                        showArtifactReward(quest.reward.artifact);
                        return;
                    }
                } else {
                    setTimeout(() => {
                        document.querySelectorAll('#words-column button, #meanings-column button').forEach(b => b.style.borderColor = '#667eea');
                        selectedWord = null;
                        selectedMeaning = null;
                    }, 1000);
                }
            }
        }
        
        document.getElementById('close-language').addEventListener('click', () => {
            overlay.remove();
            activeMiniGame = null;
        });
    }
    
    document.body.appendChild(overlay);
    createGame();
}

// Challenge Type 2: Reindeer Herding Mini-Game
function startReindeerHerdingGame(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'reindeer-herding';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Reindeer Herding Challenge</h2>
        <p style="margin-bottom: 20px;">Guide the reindeer herd to the safe grazing area. Avoid predators and obstacles!</p>
        <canvas id="herding-canvas" width="600" height="400" style="border: 3px solid #fff; border-radius: 10px; background: #87CEEB; cursor: crosshair;"></canvas>
        <div style="margin-top: 20px; display: flex; gap: 20px; align-items: center;">
            <p id="herd-status">Reindeer: 5/5 | Distance: 0%</p>
            <button id="close-herding" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
        <p style="margin-top: 10px; font-size: 14px;">Click to guide the herd. Watch for wolves and dangerous terrain!</p>
    `;
    
    document.body.appendChild(overlay);
    const canvas = document.getElementById('herding-canvas');
    const ctx = canvas.getContext('2d');
    
    let reindeer = [
        { x: 50, y: 200, speed: 2 },
        { x: 80, y: 180, speed: 2 },
        { x: 80, y: 220, speed: 2 },
        { x: 110, y: 200, speed: 2 },
        { x: 110, y: 190, speed: 2 }
    ];
    let targetX = 550;
    let targetY = 200;
    let progress = 0;
    let gameWon = false;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw target area (green circle)
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw reindeer
        reindeer.forEach(r => {
            ctx.fillStyle = '#8B7355';
            ctx.beginPath();
            ctx.arc(r.x, r.y, 12, 0, Math.PI * 2);
            ctx.fill();
            // Antlers
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(r.x - 8, r.y - 8);
            ctx.lineTo(r.x - 12, r.y - 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(r.x + 8, r.y - 8);
            ctx.lineTo(r.x + 12, r.y - 12);
            ctx.stroke();
        });
        
        // Calculate progress
        const avgX = reindeer.reduce((sum, r) => sum + r.x, 0) / reindeer.length;
        progress = Math.min((avgX / targetX) * 100, 100);
        
        // Update status
        document.getElementById('herd-status').textContent = `Reindeer: ${reindeer.length}/5 | Progress: ${Math.floor(progress)}%`;
        
        if (progress >= 95 && !gameWon) {
            gameWon = true;
            completeQuest(quest);
            setTimeout(() => {
                overlay.remove();
                activeMiniGame = null;
                showArtifactReward(quest.reward.artifact);
            }, 1000);
        }
    }
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
    });
    
    function update() {
        reindeer.forEach(r => {
            const dx = targetX - r.x;
            const dy = targetY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                r.x += (dx / dist) * r.speed;
                r.y += (dy / dist) * r.speed;
            }
        });
        draw();
        if (!gameWon) requestAnimationFrame(update);
    }
    
    document.getElementById('close-herding').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
    
    draw();
    update();
}

// Challenge Type 3: Duodji Crafting Challenge
function startDuodjiCraftingGame(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'duodji-crafting';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Duodji Crafting Challenge</h2>
        <p style="margin-bottom: 20px;">Assemble the traditional Sámi pattern by dragging the pieces into place.</p>
        <div style="display: flex; gap: 30px;">
            <div id="pattern-pieces" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px; background: rgba(30, 30, 40, 0.8); border-radius: 10px;"></div>
            <div id="pattern-board" style="width: 300px; height: 300px; border: 3px dashed #667eea; border-radius: 10px; background: rgba(255, 255, 255, 0.1); position: relative;"></div>
        </div>
        <button id="check-pattern" style="margin-top: 20px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Check Pattern</button>
        <button id="close-duodji" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    const pieces = ['◊', '▲', '●', '■', '◆', '★'];
    const piecesContainer = document.getElementById('pattern-pieces');
    const board = document.getElementById('pattern-board');
    const placedPieces = [];
    
    pieces.forEach((piece, idx) => {
        const pieceEl = document.createElement('div');
        pieceEl.textContent = piece;
        pieceEl.style.cssText = `
            width: 60px; height: 60px; font-size: 40px; display: flex;
            align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.3);
            border: 2px solid #667eea; border-radius: 5px; cursor: move;
            user-select: none;
        `;
        pieceEl.draggable = true;
        pieceEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('piece', piece);
            e.dataTransfer.setData('index', idx);
        });
        piecesContainer.appendChild(pieceEl);
    });
    
    board.addEventListener('dragover', (e) => e.preventDefault());
    board.addEventListener('drop', (e) => {
        e.preventDefault();
        const piece = e.dataTransfer.getData('piece');
        const rect = board.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const placed = document.createElement('div');
        placed.textContent = piece;
        placed.style.cssText = `
            position: absolute; left: ${x - 30}px; top: ${y - 30}px;
            width: 60px; height: 60px; font-size: 40px; display: flex;
            align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.5);
            border: 2px solid #ffd700; border-radius: 5px;
        `;
        board.appendChild(placed);
        placedPieces.push({ piece, x, y });
    });
    
    document.getElementById('check-pattern').addEventListener('click', () => {
        if (placedPieces.length >= 4) {
            completeQuest(quest);
            overlay.remove();
            activeMiniGame = null;
            showArtifactReward(quest.reward.artifact);
        } else {
            alert('Place at least 4 pattern pieces to complete the duodji!');
        }
    });
    
    document.getElementById('close-duodji').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
}

// Challenge Type 4: Yoik Puzzle
function startYoikPuzzle(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'yoik-puzzle';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Yoik Rhythm Puzzle</h2>
        <p style="margin-bottom: 20px;">Listen to the rhythm pattern and repeat it. Joik connects us to feelings and places.</p>
        <div id="rhythm-display" style="font-size: 48px; margin: 30px 0; min-height: 80px; display: flex; align-items: center; justify-content: center; gap: 10px;"></div>
        <div id="rhythm-input" style="display: flex; gap: 15px; margin: 20px 0;"></div>
        <p id="rhythm-feedback" style="margin-top: 20px; font-size: 18px;"></p>
        <button id="play-rhythm" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Rhythm</button>
        <button id="check-rhythm" style="margin-top: 10px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Check</button>
        <button id="close-yoik" style="margin-top: 10px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    const rhythmPattern = ['♪', '♪', '♫', '♪', '♫', '♪'];
    const userPattern = [];
    let patternShown = false;
    
    function showPattern() {
        const display = document.getElementById('rhythm-display');
        display.innerHTML = '';
        rhythmPattern.forEach((note, idx) => {
            setTimeout(() => {
                const noteEl = document.createElement('span');
                noteEl.textContent = note;
                noteEl.style.cssText = 'animation: pulse 0.5s;';
                display.appendChild(noteEl);
            }, idx * 500);
        });
        patternShown = true;
    }
    
    const inputContainer = document.getElementById('rhythm-input');
    ['♪', '♫'].forEach(note => {
        const btn = document.createElement('button');
        btn.textContent = note;
        btn.style.cssText = 'font-size: 32px; padding: 15px 20px; background: rgba(102, 126, 234, 0.3); color: white; border: 2px solid #667eea; border-radius: 10px; cursor: pointer;';
        btn.addEventListener('click', () => {
            userPattern.push(note);
            document.getElementById('rhythm-feedback').textContent = `Your pattern: ${userPattern.join(' ')}`;
        });
        inputContainer.appendChild(btn);
    });
    
    document.getElementById('play-rhythm').addEventListener('click', () => {
        showPattern();
        userPattern.length = 0;
        document.getElementById('rhythm-feedback').textContent = '';
    });
    
    document.getElementById('check-rhythm').addEventListener('click', () => {
        if (userPattern.length === 0) {
            document.getElementById('rhythm-feedback').textContent = 'Please create a rhythm pattern first!';
            return;
        }
        const correct = JSON.stringify(userPattern) === JSON.stringify(rhythmPattern);
        if (correct) {
            document.getElementById('rhythm-feedback').textContent = 'Perfect! You understand the rhythm of joik!';
            setTimeout(() => {
                completeQuest(quest);
                overlay.remove();
                activeMiniGame = null;
                showArtifactReward(quest.reward.artifact);
            }, 1500);
        } else {
            document.getElementById('rhythm-feedback').textContent = 'Not quite right. Try again!';
            userPattern.length = 0;
        }
    });
    
    document.getElementById('close-yoik').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
}

// Challenge Type 5: Environmental Challenge
function startEnvironmentalChallenge(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'environmental-challenge';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    let fishing = 50;
    let grazing = 50;
    let resources = 50;
    let balance = 0;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Environmental Balance Challenge</h2>
        <p style="margin-bottom: 20px;">Balance fishing, grazing, and resources. Traditional knowledge teaches us to respect the land.</p>
        <div style="display: flex; gap: 30px; margin: 20px 0;">
            <div style="text-align: center;">
                <p>Fishing</p>
                <div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                    <div id="fishing-bar" style="width: ${fishing}%; height: 100%; background: #20B2AA; transition: width 0.3s;"></div>
                </div>
                <p id="fishing-value">${fishing}%</p>
                <button id="fish-more" style="margin: 5px; padding: 5px 10px; background: #20B2AA; color: white; border: none; border-radius: 5px; cursor: pointer;">Fish More</button>
                <button id="fish-less" style="margin: 5px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Fish Less</button>
            </div>
            <div style="text-align: center;">
                <p>Grazing</p>
                <div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                    <div id="grazing-bar" style="width: ${grazing}%; height: 100%; background: #228B22; transition: width 0.3s;"></div>
                </div>
                <p id="grazing-value">${grazing}%</p>
                <button id="graze-more" style="margin: 5px; padding: 5px 10px; background: #228B22; color: white; border: none; border-radius: 5px; cursor: pointer;">Graze More</button>
                <button id="graze-less" style="margin: 5px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Graze Less</button>
            </div>
            <div style="text-align: center;">
                <p>Resources</p>
                <div style="width: 200px; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                    <div id="resources-bar" style="width: ${resources}%; height: 100%; background: #FFD700; transition: width 0.3s;"></div>
                </div>
                <p id="resources-value">${resources}%</p>
                <button id="restore-resources" style="margin: 5px; padding: 5px 10px; background: #FFD700; color: white; border: none; border-radius: 5px; cursor: pointer;">Restore</button>
            </div>
        </div>
        <p id="balance-status" style="margin-top: 20px; font-size: 18px;">Balance: ${balance}%</p>
        <button id="check-balance" style="margin-top: 20px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Check Balance</button>
        <button id="close-environmental" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    
    function updateBalance() {
        const avg = (fishing + grazing + resources) / 3;
        const variance = Math.abs(fishing - avg) + Math.abs(grazing - avg) + Math.abs(resources - avg);
        balance = Math.max(0, 100 - variance);
        document.getElementById('balance-status').textContent = `Balance: ${Math.floor(balance)}%`;
    }
    
    function updateBars() {
        document.getElementById('fishing-bar').style.width = fishing + '%';
        document.getElementById('fishing-value').textContent = fishing + '%';
        document.getElementById('grazing-bar').style.width = grazing + '%';
        document.getElementById('grazing-value').textContent = grazing + '%';
        document.getElementById('resources-bar').style.width = resources + '%';
        document.getElementById('resources-value').textContent = resources + '%';
        updateBalance();
    }
    
    document.getElementById('fish-more').addEventListener('click', () => {
        if (fishing < 100) fishing += 10;
        if (resources > 0) resources -= 5;
        updateBars();
    });
    document.getElementById('fish-less').addEventListener('click', () => {
        if (fishing > 0) fishing -= 10;
        if (resources < 100) resources += 5;
        updateBars();
    });
    document.getElementById('graze-more').addEventListener('click', () => {
        if (grazing < 100) grazing += 10;
        if (resources > 0) resources -= 5;
        updateBars();
    });
    document.getElementById('graze-less').addEventListener('click', () => {
        if (grazing > 0) grazing -= 10;
        if (resources < 100) resources += 5;
        updateBars();
    });
    document.getElementById('restore-resources').addEventListener('click', () => {
        if (resources < 100) resources = Math.min(100, resources + 20);
        if (fishing > 0) fishing = Math.max(0, fishing - 10);
        if (grazing > 0) grazing = Math.max(0, grazing - 10);
        updateBars();
    });
    
    document.getElementById('check-balance').addEventListener('click', () => {
        if (balance >= 80) {
            completeQuest(quest);
            overlay.remove();
            activeMiniGame = null;
            showArtifactReward(quest.reward.artifact);
        } else {
            alert(`Balance is ${Math.floor(balance)}%. You need at least 80% balance. Keep adjusting!`);
        }
    });
    
    document.getElementById('close-environmental').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
    
    updateBars();
}

// Challenge Type 6: History Timeline Quest
function startHistoryTimelineQuest(quest, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'history-timeline';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    const events = [
        { year: '1000 BCE', event: 'Sámi people begin reindeer herding', order: 1 },
        { year: '1500s', event: 'First written records of Sámi culture', order: 2 },
        { year: '1852', event: 'Kautokeino Uprising - Sámi resistance', order: 3 },
        { year: '1917', event: 'Sámi flag first designed', order: 4 },
        { year: '1989', event: 'First Sámi Parliament in Norway', order: 5 },
        { year: '2000', event: 'Sámi Language Act passed', order: 6 }
    ];
    
    const shuffledEvents = [...events].sort(() => Math.random() - 0.5);
    const placedEvents = [];
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">History Timeline Quest</h2>
        <p style="margin-bottom: 20px;">Place the events in chronological order on the timeline.</p>
        <div id="event-pool" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; max-height: 200px; overflow-y: auto;"></div>
        <div id="timeline" style="width: 800px; height: 100px; border: 3px solid #667eea; border-radius: 10px; background: rgba(255, 255, 255, 0.1); position: relative; margin: 20px 0;">
            <div style="position: absolute; left: 0; top: 50%; width: 100%; height: 2px; background: #ffd700;"></div>
        </div>
        <button id="check-timeline" style="margin-top: 20px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Check Timeline</button>
        <button id="close-timeline" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(overlay);
    const eventPool = document.getElementById('event-pool');
    const timeline = document.getElementById('timeline');
    
    shuffledEvents.forEach((evt, idx) => {
        const eventEl = document.createElement('div');
        eventEl.textContent = `${evt.year}: ${evt.event}`;
        eventEl.style.cssText = `
            padding: 10px 15px; background: rgba(102, 126, 234, 0.3);
            border: 2px solid #667eea; border-radius: 5px; cursor: move;
            user-select: none;
        `;
        eventEl.draggable = true;
        eventEl.dataset.order = evt.order;
        eventEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('event', JSON.stringify(evt));
        });
        eventPool.appendChild(eventEl);
    });
    
    timeline.addEventListener('dragover', (e) => e.preventDefault());
    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        const evt = JSON.parse(e.dataTransfer.getData('event'));
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        const placed = document.createElement('div');
        placed.textContent = evt.year;
        placed.style.cssText = `
            position: absolute; left: ${x - 30}px; top: 20px;
            padding: 5px 10px; background: rgba(255, 215, 0, 0.8);
            border: 2px solid #ffd700; border-radius: 5px; font-size: 12px;
        `;
        placed.dataset.order = evt.order;
        placed.dataset.x = x;
        timeline.appendChild(placed);
        placedEvents.push({ event: evt, x: x });
        
        // Remove from pool
        eventPool.querySelectorAll('div').forEach(el => {
            if (el.textContent.includes(evt.year)) el.remove();
        });
    });
    
    document.getElementById('check-timeline').addEventListener('click', () => {
        if (placedEvents.length < events.length) {
            alert(`Place all ${events.length} events on the timeline!`);
            return;
        }
        
        // Check if events are in correct order (simplified check)
        const sorted = [...placedEvents].sort((a, b) => a.x - b.x);
        let correct = true;
        for (let i = 0; i < sorted.length; i++) {
            if (parseInt(sorted[i].event.order) !== i + 1) {
                correct = false;
                break;
            }
        }
        
        if (correct) {
            completeQuest(quest);
            overlay.remove();
            activeMiniGame = null;
            showArtifactReward(quest.reward.artifact);
        } else {
            alert('The timeline order is not quite right. Try again!');
        }
    });
    
    document.getElementById('close-timeline').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
}

// Challenge Type 7: Final Quest - Restore Runebomme
function startFinalQuest(quest, scene) {
    // Check if all artifacts are collected
    const required = quest.requiresArtifacts || [];
    const missing = required.filter(a => !gameState.artifacts.includes(a));
    
    if (missing.length > 0) {
        alert(`You need to collect all artifacts first! Missing: ${missing.join(', ')}`);
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'final-quest';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.95); z-index: 5000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h1 style="margin-bottom: 20px; color: #ffd700; font-size: 36px;">Restore the Runebomme</h1>
        <p style="margin-bottom: 30px; font-size: 20px; text-align: center; max-width: 600px;">
            With all artifacts collected, you can now restore the sacred runebomme drum. 
            This will complete your journey as a Yoik Guardian Apprentice.
        </p>
        <div style="font-size: 120px; margin: 30px 0;">🥁</div>
        <div style="display: flex; gap: 20px; margin: 30px 0;">
            ${required.map(a => `<div style="font-size: 48px;" title="${artifacts[a]?.name || a}">✨</div>`).join('')}
        </div>
        <p style="margin-bottom: 20px;">All artifacts are united. The runebomme is restored!</p>
        <button id="restore-drum" style="padding: 15px 30px; font-size: 18px; background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); color: #000; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">Restore Runebomme</button>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('restore-drum').addEventListener('click', () => {
        completeQuest(quest);
        gameState.storyProgress = 100;
        overlay.innerHTML = `
            <h1 style="margin-bottom: 20px; color: #ffd700; font-size: 36px;">Congratulations!</h1>
            <p style="margin-bottom: 30px; font-size: 20px; text-align: center; max-width: 600px;">
                You have successfully restored the runebomme and completed your training as a Yoik Guardian!
                You have learned about Sámi culture, history, language, and traditions.
            </p>
            <div style="font-size: 120px; margin: 30px 0;">🎉</div>
            <p style="font-size: 18px; margin-bottom: 20px;">Sápmi's cultural treasures are safe in your hands.</p>
            <button id="close-final" style="padding: 15px 30px; font-size: 18px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer;">Continue</button>
        `;
        
        document.getElementById('close-final').addEventListener('click', () => {
            overlay.remove();
            activeMiniGame = null;
            showArtifactReward(quest.reward.artifact);
            updateUI();
        });
    });
}

// Quest completion system
function completeQuest(quest) {
    quest.progress = quest.maxProgress;
    if (!quest.completed) {
        quest.completed = true;
        gameState.completedQuests.push(quest.id);
        
        // Award tokens
        if (quest.reward && quest.reward.tokens) {
            gameState.culturalTokens += quest.reward.tokens;
        }
        
        // Award artifact
        if (quest.reward && quest.reward.artifact) {
            if (!gameState.artifacts.includes(quest.reward.artifact)) {
                gameState.artifacts.push(quest.reward.artifact);
            }
        }
        
        // Update story progress
        const totalQuests = availableQuests.length;
        const completed = gameState.completedQuests.length;
        gameState.storyProgress = Math.floor((completed / totalQuests) * 100);
        
        // Check if chapter complete, advance to next
        const chapterQuests = availableQuests.filter(q => q.chapter === gameState.chapter);
        const chapterComplete = chapterQuests.every(q => gameState.completedQuests.includes(q.id));
        if (chapterComplete && gameState.chapter < 7) {
            gameState.chapter++;
            initializeQuests();
        }
        
        updateUI();
        updateQuestUI();
        saveGame();
    }
}

function showArtifactReward(artifactId) {
    const artifact = artifacts[artifactId];
    if (artifact) {
        showEducationalPopup(artifactId.replace('-', ''));
        setTimeout(() => {
            showReward(`Artifact Collected: ${artifact.name}! +${gameState.culturalTokens} Cultural Knowledge Tokens`);
        }, 2000);
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

function startPaintingGame(task, scene) {
    const overlay = document.createElement('div');
    overlay.id = 'painting-minigame';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 5000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    `;
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #ffd700;">Paint Traditional Sámi Art - Dáidda</h2>
        <canvas id="paint-canvas" width="600" height="400" style="border: 3px solid #fff; border-radius: 10px; background: white; cursor: crosshair;"></canvas>
        <div style="margin-top: 20px; display: flex; gap: 10px; align-items: center;">
            <input type="color" id="paint-color" value="#FF0000" style="width: 50px; height: 50px; border: none; border-radius: 5px; cursor: pointer;">
            <button id="clear-canvas" style="padding: 10px 20px; font-size: 16px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Clear</button>
            <button id="finish-painting" style="padding: 10px 20px; font-size: 16px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Finish Painting</button>
            <button id="close-painting" style="padding: 10px 20px; font-size: 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
        <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">Draw traditional Sámi patterns or designs!</p>
    `;
    
    document.body.appendChild(overlay);
    
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    document.getElementById('paint-color').addEventListener('change', (e) => {
        ctx.strokeStyle = e.target.value;
    });
    ctx.strokeStyle = document.getElementById('paint-color').value;
    
    document.getElementById('clear-canvas').addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    document.getElementById('finish-painting').addEventListener('click', () => {
        task.progress = task.maxProgress;
        completeTask(task);
        overlay.remove();
        activeMiniGame = null;
        showEducationalPopup('painting');
    });
    
    document.getElementById('close-painting').addEventListener('click', () => {
        overlay.remove();
        activeMiniGame = null;
    });
}

// Quiz questions
const languageQuizQuestions = [
    { question: 'What does "Boazu" mean?', options: ['Reindeer', 'Tent', 'Lake', 'Food'], correct: 0 },
    { question: 'What does "Lávvu" mean?', options: ['School', 'Tent', 'Reindeer', 'Fish'], correct: 1 },
    { question: 'What does "Bures boahtin" mean?', options: ['Goodbye', 'Welcome', 'Thank you', 'Hello'], correct: 1 },
    { question: 'What does "Giella" mean?', options: ['History', 'Art', 'Language', 'School'], correct: 2 },
    { question: 'What does "Skuvla" mean?', options: ['Kitchen', 'School', 'Lake', 'Tent'], correct: 1 },
    { question: 'What does "Dáidda" mean?', options: ['Art', 'Food', 'Music', 'Dance'], correct: 0 },
    { question: 'What does "Gárdi" mean?', options: ['Storage', 'House', 'Tent', 'Farm'], correct: 0 },
    { question: 'What does "Boazodoallu" mean?', options: ['Fishing', 'Reindeer Herding', 'Cooking', 'Building'], correct: 1 }
];

const historyQuizQuestions = [
    { question: 'Where do the Sámi people traditionally live?', options: ['Sápmi (Northern Scandinavia)', 'Southern Europe', 'Asia', 'America'], correct: 0 },
    { question: 'What is traditional Sámi livelihood?', options: ['Farming', 'Reindeer Herding', 'Fishing Only', 'Trading'], correct: 1 },
    { question: 'What is the traditional Sámi tent called?', options: ['Tipi', 'Lávvu', 'Yurt', 'Igloo'], correct: 1 },
    { question: 'How many Sámi languages are there?', options: ['1', '3', '9', '15'], correct: 2 },
    { question: 'What is traditional Sámi art called?', options: ['Duodji', 'Origami', 'Pottery', 'Weaving'], correct: 0 },
    { question: 'What color is the Sámi flag?', options: ['Red, Yellow, Green, Blue', 'Blue, Red, Yellow, Green', 'Red, Blue, Green, Yellow', 'Green, Blue, Red, Yellow'], correct: 1 },
    { question: 'What is the Sámi National Day?', options: ['February 6', 'May 1', 'December 6', 'January 1'], correct: 0 },
    { question: 'What is traditional Sámi clothing called?', options: ['Gákti', 'Kimono', 'Sari', 'Kilt'], correct: 0 }
];

function startLanguageQuiz(task, scene) {
    startQuiz('language-quiz', task, scene, languageQuizQuestions, 'Learn Sámi Language - Giella');
}

function startHistoryQuiz(task, scene) {
    startQuiz('history-quiz', task, scene, historyQuizQuestions, 'Learn Sámi History - Historia');
}

function startQuiz(quizType, task, scene, questions, title) {
    let currentQuestion = 0;
    let correctAnswers = task.progress || 0;
    
    const overlay = document.createElement('div');
    overlay.id = `${quizType}-minigame`;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 5000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
    `;
    
    function showQuestion() {
        if (currentQuestion >= questions.length || correctAnswers >= task.maxProgress) {
            completeTask(task);
            overlay.remove();
            activeMiniGame = null;
            if (quizType === 'language-quiz') {
                showEducationalPopup('classroom');
            } else {
                showEducationalPopup('classroom');
            }
            return;
        }
        
        const q = questions[currentQuestion];
        overlay.innerHTML = `
            <h2 style="margin-bottom: 30px; color: #ffd700; font-size: 28px;">${title}</h2>
            <div style="background: rgba(30, 30, 40, 0.95); padding: 40px; border-radius: 15px; min-width: 500px; max-width: 700px;">
                <div style="font-size: 18px; margin-bottom: 10px; color: #ffd700;">Question ${currentQuestion + 1} of ${questions.length}</div>
                <h3 style="font-size: 24px; margin-bottom: 30px;">${q.question}</h3>
                <div id="quiz-options" style="display: flex; flex-direction: column; gap: 15px;">
                    ${q.options.map((opt, idx) => `
                        <button class="quiz-option" data-index="${idx}" style="padding: 15px 20px; font-size: 18px; background: rgba(102, 126, 234, 0.3); color: white; border: 2px solid #667eea; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div style="margin-top: 20px; font-size: 16px;">Correct answers: ${correctAnswers}/${task.maxProgress}</div>
            </div>
            <button id="close-quiz" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        `;
        
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedIdx = parseInt(e.target.getAttribute('data-index'));
                const buttons = document.querySelectorAll('.quiz-option');
                
                if (selectedIdx === q.correct) {
                    e.target.style.background = '#27ae60';
                    e.target.style.borderColor = '#27ae60';
                    correctAnswers++;
                    task.progress = correctAnswers;
                    updateTaskProgress('location', task.target, 0);
                    
                    setTimeout(() => {
                        currentQuestion++;
                        showQuestion();
                    }, 1000);
                } else {
                    e.target.style.background = '#e74c3c';
                    e.target.style.borderColor = '#e74c3c';
                    buttons[q.correct].style.background = '#27ae60';
                    buttons[q.correct].style.borderColor = '#27ae60';
                    
                    setTimeout(() => {
                        currentQuestion++;
                        showQuestion();
                    }, 2000);
                }
            });
        });
        
        document.getElementById('close-quiz').addEventListener('click', () => {
            overlay.remove();
            activeMiniGame = null;
        });
    }
    
    document.body.appendChild(overlay);
    showQuestion();
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
        chapter: gameState.chapter,
        artifacts: gameState.artifacts,
        culturalTokens: gameState.culturalTokens,
        quests: gameState.quests,
        completedQuests: gameState.completedQuests,
        playerPosition: gameState.playerPosition,
        storyProgress: gameState.storyProgress,
        charactersMet: gameState.charactersMet,
        locationsVisited: gameState.locationsVisited
    };
    
    localStorage.setItem('samiQuestSave', JSON.stringify(saveData));
    
    // Show save indicator
    const indicator = document.getElementById('save-indicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

function loadGame() {
    const saveData = localStorage.getItem('samiQuestSave') || localStorage.getItem('samiAdventureSave'); // Support old saves
    if (saveData) {
        const data = JSON.parse(saveData);
        gameState = { ...gameState, ...data };
        
        // Initialize arrays if missing
        if (!gameState.artifacts) gameState.artifacts = [];
        if (!gameState.quests) gameState.quests = [];
        if (!gameState.completedQuests) gameState.completedQuests = [];
        if (!gameState.charactersMet) gameState.charactersMet = [];
        if (!gameState.locationsVisited) gameState.locationsVisited = [];
        if (!gameState.culturalTokens) gameState.culturalTokens = 0;
        if (!gameState.chapter) gameState.chapter = 1;
        if (!gameState.storyProgress) gameState.storyProgress = 0;
        
        // Migrate quests if needed
        if (gameState.quests && gameState.quests.length > 0) {
            const savedQuestIds = gameState.quests.map(q => q.id);
            gameState.quests = gameState.quests.map(savedQuest => {
                const template = availableQuests.find(q => q.id === savedQuest.id);
                if (template) {
                    return {
                        ...template,
                        progress: savedQuest.progress || 0,
                        completed: savedQuest.completed || false
                    };
                }
                return savedQuest;
            });
            
            // Add any new quests that weren't in the save
            availableQuests.forEach(template => {
                if (!savedQuestIds.includes(template.id) && template.chapter === gameState.chapter) {
                    gameState.quests.push({ ...template });
                }
            });
        } else {
            // Initialize quests if none exist
            initializeQuests();
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
document.getElementById('close-decoration-btn').addEventListener('click', toggleDecorationPanel);
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

