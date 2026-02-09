/*:
 * @target MZ
 * @plugindesc v1.0 - Plugin to create and delete NPCs on the current map. Currently can auto-create one NPC and as many as you want manually.
 * @author Gabby Stevens
 *
 * @help
 * What am I even doing
 * 
 * Please keep in mind that this plugin will only work on the current map. 
 * Spawning NPCs from one map to another is not supported.
 * 
 * Adjust the parameters to set up auto-creation of an NPC on map load.
 * You can create and delete NPCs manually via plugin commands.
 *
 * No plugin dependencies.
 * ------------------------------------------
 * PARAMETERS -->
 * ------------------------------------------
 * @param defaultNPCName
 * @text Default NPC Name
 * @type string
 * @default NPC
 * @desc The default name for created NPCs
 * 
 * @param allowMultipleNPCs
 * @text Allow Multiple NPCs
 * @type boolean
 * @default false
 * @desc If true, allows creating multiple NPCs. If false, only one NPC can exist.
 * 
 * @param autoCreateEnabled
 * @text Auto-Create NPC on Load
 * @type boolean
 * @default true
 * @desc Automatically creates an NPC when the map loads.
 * 
 * @param autoCreateMapId
 * @text Auto-Create Map ID
 * @type number
 * @default 1
 * @min 1
 * @desc Which map to auto-create the NPC on.
 * 
 * @param autoCreateX
 * @text Auto-Create X Position
 * @type number
 * @default 5
 * @min 0
 * @desc X coordinate for auto-created NPC.
 * 
 * @param autoCreateY
 * @text Auto-Create Y Position
 * @type number
 * @default 3
 * @min 0
 * @desc Y coordinate for auto-created NPC.
 * 
 * @param autoCreateDialogue
 * @text Auto-Create Dialogue
 * @type multiline_string
 * @default Welcome to the game!\nI'm an NPC!\nTalk to me anytime!
 * @desc Dialogue for the auto-created NPC.
 * 
 * @param autoCreateCharacter
 * @text Auto-Create Character
 * @type string
 * @default People1
 * @desc Character file for auto-created NPC.
 * 
 * @param autoCreateCharacterIndex
 * @text Auto-Create Character Index
 * @type number
 * @default 0
 * @min 0
 * @max 7
 * @desc Character index for auto-created NPC.
 * 
 * ------------------------------------------
 * COMMANDS
 * ------------------------------------------
 * 
 * @command createNPC
 * @text Create NPC
 * @desc Creates an NPC at a specified location on the map.
 * 
 * @arg x
 * @text X Coordinate
 * @type number
 * @default 0
 * @desc The X coordinate on the map where the NPC will be placed.
 * 
 * @arg y
 * @text Y Coordinate
 * @type number
 * @default 0
 * @desc The Y coordinate on the map where the NPC will be placed.
 * 
 * @arg dialogue
 * @text Dialogue
 * @type multiline_string
 * @default Hello! I'm an NPC!\nHow can I help you today?
 * @desc Enter dialogue text. Use \n for new lines/text boxes.
 * 
 * @arg characterName
 * @text Character File
 * @type string
 * @default People1
 * @desc Character file name (without .png extension).
 * 
 * @arg characterIndex
 * @text Character Index
 * @type number
 * @default 0
 * @min 0
 * @max 7
 * @desc Character index in the file (0-7, top-left to bottom-right).
 * 
 * @command deleteNPC
 * @text Delete NPC
 * @desc Deletes an NPC at a specified location.
 * 
 * @arg x
 * @text X Coordinate
 * @type number
 * @default 0
 * @desc The X coordinate of the NPC to delete.
 * 
 * @arg y
 * @text Y Coordinate
 * @type number
 * @default 0
 * @desc The Y coordinate of the NPC to delete.
 * 
 * @command deleteAllNPCs
 * @text Delete All NPCs
 * @desc Deletes all NPCs from the current map.
 */

(() => {
    'use strict';
    const PLUGIN_NAME = "NPC_Creator&Deleter";

    const params = PluginManager.parameters(PLUGIN_NAME);
    console.log(`[${PLUGIN_NAME}] Plugin loaded successfully`);

    function createNPC(x, y, dialogue = "Hello! I'm an NPC!", characterName = "People1", characterIndex = 0) {
        console.log(`[${PLUGIN_NAME}] createNPC called at (${x}, ${y})`);

        if (!$dataMap || !$gameMap) {
            console.error("Cannot create NPC: Map not available");
            $gameMessage.add("Error: Map not available");
            return;
        }

        const allowMultiple = params.allowMultipleNPCs === "true";

        if (!allowMultiple) {
            const existingEvent = $dataMap.events.find(event =>
                event && event.name === "NPC"
            );
            if (existingEvent) {
                console.log("NPC already exists, multiple NPCs not allowed");
                $gameMessage.add("An NPC already exists on this map!");
                return;
            }
        }

        // Ensure coordinates are integers
        x = Math.floor(Number(x));
        y = Math.floor(Number(y));

        console.log(`Creating NPC at (${x}, ${y}) with character ${characterName}[${characterIndex}]`);

        // Find a free event ID
        let eventId = 1;
        while ($dataMap.events[eventId]) {
            eventId++;
        }
        console.log(`Using event ID: ${eventId}`);

        // Split dialogue
        const textLines = dialogue.split('\\n').filter(line => line.trim());
        let commandList = [{ code: 101, parameters: ["", 0, 0, 2] }];
        textLines.forEach(line => {
            commandList.push({ code: 401, parameters: [line.trim()] });
        });
        commandList.push({ code: 0, parameters: [] });

        // Create event data using RPG Maker's expected format
        const eventData = {
            id: eventId,
            name: "NPC",
            note: "",
            pages: [{
                conditions: { //Here to make RPG Maker work apparently
                    actorId: 1, actorValid: false, itemId: 1, itemValid: false,
                    selfSwitchCh: "A", selfSwitchValid: false, switch1Id: 1, switch1Valid: false,
                    switch2Id: 1, switch2Valid: false, variableId: 1, variableValid: false, variableValue: 0
                },
                directionFix: false,
                image: {
                    characterIndex: characterIndex,
                    characterName: characterName,
                    direction: 2,
                    pattern: 0,
                    tileId: 0
                },
                list: commandList,
                moveFrequency: 3,
                moveRoute: { list: [{ code: 0, parameters: [] }], repeat: true, skippable: false, wait: false },
                moveSpeed: 3,
                moveType: 0,
                priorityType: 1,
                stepAnime: false,
                through: false,
                trigger: 0,
                walkAnime: true
            }],
            x: x,
            y: y
        };

        // Add event to map data
        $dataMap.events[eventId] = eventData;

        // Create and setup the game event
        const gameEvent = new Game_Event($gameMap.mapId(), eventId);
        gameEvent.refresh();
        $gameMap._events[eventId] = gameEvent;
        $gameMap.refresh();

        // Force sprite creation
        if (SceneManager._scene instanceof Scene_Map) {
            const spriteset = SceneManager._scene._spriteset;
            if (spriteset) {
                // Create character sprite for this event
                const sprite = new Sprite_Character(gameEvent);
                spriteset._characterSprites.push(sprite);
                spriteset._tilemap.addChild(sprite);
            }
        }

        console.log(`NPC created at (${x}, ${y}) with character ${characterName}[${characterIndex}]`);
    }

    function deleteNPC(x, y) {
        console.log(`[${PLUGIN_NAME}] deleteNPC called for position (${x}, ${y})`);

        if (!$dataMap || !$gameMap) {
            console.error("Cannot delete NPC: Map not available");
            $gameMessage.add("Error: Map not available");
            return;
        }

        // Find NPC at the specified position
        const npcToDelete = $dataMap.events.find(event =>
            event && event.name === "NPC" && event.x === x && event.y === y
        );

        if (!npcToDelete) {
            console.log(`No NPC found at (${x}, ${y})`);
            $gameMessage.add(`No NPC found at (${x}, ${y})!`);
            return;
        }

        const eventId = npcToDelete.id;
        console.log(`Deleting NPC with event ID ${eventId} at (${x}, ${y})`);

        // Get the game event BEFORE deleting it
        const gameEvent = $gameMap._events[eventId];

        // Remove sprite FIRST (while game event still exists)
        if (SceneManager._scene instanceof Scene_Map) {
            const spriteset = SceneManager._scene._spriteset;
            if (spriteset && gameEvent) {
                const spriteIndex = spriteset._characterSprites.findIndex(
                    sprite => sprite._character === gameEvent
                );
                if (spriteIndex >= 0) {
                    const sprite = spriteset._characterSprites[spriteIndex];
                    spriteset._tilemap.removeChild(sprite);
                    spriteset._characterSprites.splice(spriteIndex, 1);
                    console.log(`Sprite removed for event ${eventId}`);
                }
            }
        }

        // Remove from data map
        $dataMap.events[eventId] = null;

        // Remove from game map
        if ($gameMap._events[eventId]) {
            delete $gameMap._events[eventId];
        }

        // Refresh the map
        $gameMap.refresh();

        console.log(`NPC deleted successfully from (${x}, ${y})`);
        $gameMessage.add(`NPC deleted from (${x}, ${y})!`);
    }

    function deleteAllNPCs() {
        console.log(`[${PLUGIN_NAME}] deleteAllNPCs called`);

        if (!$dataMap || !$gameMap) {
            console.error("Cannot delete NPCs: Map not available");
            return;
        }

        let deletedCount = 0;

        // Find all NPCs and store their IDs
        const npcEventIds = [];
        $dataMap.events.forEach((event, index) => {
            if (event && event.name === "NPC") {
                npcEventIds.push(index);
            }
        });

        console.log(`Found ${npcEventIds.length} NPCs to delete:`, npcEventIds);

        // Remove sprites and events
        if (SceneManager._scene instanceof Scene_Map) {
            const spriteset = SceneManager._scene._spriteset;
            if (spriteset) {
                // Remove sprites in reverse order to avoid index issues
                for (let i = spriteset._characterSprites.length - 1; i >= 0; i--) {
                    const sprite = spriteset._characterSprites[i];
                    const character = sprite._character;

                    // Check if this sprite belongs to the NPC being deleted
                    if (character instanceof Game_Event && npcEventIds.includes(character.eventId())) {
                        spriteset._tilemap.removeChild(sprite);
                        spriteset._characterSprites.splice(i, 1);
                        console.log(`Sprite removed for event ${character.eventId()}`);
                    }
                }
            }
        }

        // Delete the event data
        npcEventIds.forEach(eventId => {
            $dataMap.events[eventId] = null;
            if ($gameMap._events[eventId]) {
                delete $gameMap._events[eventId];
            }
            deletedCount++;
        });

        $gameMap.refresh();

        console.log(`Deleted ${deletedCount} NPCs`);
        $gameMessage.add(`Deleted ${deletedCount} NPC(s)!`);
    }

    // Register commands
    PluginManager.registerCommand(PLUGIN_NAME, "createNPC", args => {
        console.log(`[${PLUGIN_NAME}] Plugin command called with args:`, args);

        const x = parseInt(args.x) || 0;
        const y = parseInt(args.y) || 0;
        const dialogue = args.dialogue || "Hello! I'm an NPC!";
        const characterName = args.characterName || "People1";
        const characterIndex = parseInt(args.characterIndex) || 0;

        console.log(`Parsed: x=${x}, y=${y}, dialogue="${dialogue}", characterName="${characterName}", characterIndex=${characterIndex}`);

        // Validate coordinates are within map bounds
        if ($dataMap) {
            if (x < 0 || x >= $dataMap.width) {
                console.warn(`X coordinate ${x} is out of bounds (0-${$dataMap.width - 1})`);
                $gameMessage.add(`X coordinate ${x} is out of bounds!`);
                return;
            }
            if (y < 0 || y >= $dataMap.height) {
                console.warn(`Y coordinate ${y} is out of bounds (0-${$dataMap.height - 1})`);
                $gameMessage.add(`Y coordinate ${y} is out of bounds!`);
                return;
            }
        }

        createNPC(x, y, dialogue, characterName, characterIndex);
    });

    // Register delete command
    PluginManager.registerCommand(PLUGIN_NAME, "deleteNPC", args => {
        console.log(`[${PLUGIN_NAME}] Delete NPC command called with args:`, args);

        const x = parseInt(args.x) || 0;
        const y = parseInt(args.y) || 0;

        console.log(`Parsed: x=${x}, y=${y}`);

        deleteNPC(x, y);
    });

    // Register delete all command
    PluginManager.registerCommand(PLUGIN_NAME, "deleteAllNPCs", args => {
        console.log(`[${PLUGIN_NAME}] Delete All NPCs command called`);

        deleteAllNPCs();
    });

    console.log(`[${PLUGIN_NAME}] Plugin commands registered`);

    // Auto-create NPC on map load
    let autoNPCsCreated = false; // Flag to prevent creating multiple times

    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function () {
        _Scene_Map_onMapLoaded.call(this);

        const currentMapId = $gameMap.mapId();

        // Auto-create NPCs
        if (params.autoCreateEnabled === "true" &&
            currentMapId === Number(params.autoCreateMapId) &&
            !autoNPCsCreated) {
            createNPC(
                Number(params.autoCreateX),
                Number(params.autoCreateY),
                params.autoCreateDialogue,
                params.autoCreateCharacter,
                Number(params.autoCreateCharacterIndex)
            );
            autoNPCsCreated = true;
        }
    };

})();