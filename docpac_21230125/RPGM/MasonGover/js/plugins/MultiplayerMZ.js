/*:
 * @target MZ
 * @plugindesc v1.0 A plugin that facilitates multiplayer in RPG Maker MZ.
 * @author Mason Gover
 *
 * Requires a backend server running from https://github.com/mason26611/MultiplayerMZ-Backend
 *
 * ------------------------------------------
 * PARAMETERS
 * ------------------------------------------
 *
 * @param backendServerUrl
 * @text Backend Server URL
 * @type string
 * @default http://localhost:3000
 * @desc Chooses a server to listen for events from.
 * 
 * 
 * @param enableDebug
 * @text Enable Debug Logs
 * @type boolean
 * @default true
 * @desc If true, logs info to the console.
*/

(() => {
    const PLUGIN_NAME = "MultiplayerMZ"
    const parameters = PluginManager.parameters("MultiplayerMZ")
    const BACKEND_SERVER_URL = parameters["backendServerUrl"]
    const DEBUG_MODE = parameters["enableDebug"]

    // Each player is an event with a sprite attached, and we need to store all of those events
    // [username] = { eventData, gameEvent, partyMembers: [ }
    const playerEvents = {}

    // Store target positions for syncing after movement completes
    // [username] = { x, y }
    const playerTargetPositions = {}

    // Store local socket and username info for this client
    let socket;
    let username;

    // Hook isGameActive to always return true so that the game doesn't pause when losing focus
    SceneManager.isGameActive = function() {
        return true
    }

    // Hook into player movement to send updates to server once the player moves
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);

        // Once the game is loaded, request the current players from the server
        // This is so we can spawn the existing players into the game
        if (socket) {
            socket.emit("request_current_players");

            // Send party member IDs when map starts in case party composition changed
            sendPartyMemberIds();
        }

        const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
        Game_Player.prototype.moveStraight = function (d) {
            _Game_Player_moveStraight.call(this, d);
            if (!socket || !username) {
                if (DEBUG_MODE) {
                    console.log("Socket or username not initialized, cannot send movement. Uh ok.");
                }
                return;
            }

            if (DEBUG_MODE) {
                console.log("Sending player movement to server");
            }

            socket.emit("move_player", {
                username: username,
                x: this.x,
                y: this.y
            });
        }

        const _Game_Follower_moveStraight = Game_Follower.prototype.moveStraight;
        Game_Follower.prototype.moveStraight = function (d) {
            _Game_Follower_moveStraight.call(this, d);
            if (!socket || !username) {
                if (DEBUG_MODE) {
                    console.log("Socket or username not initialized, cannot send follower movement.");
                }
                return;
            }

            if (DEBUG_MODE) {
                console.log("Sending follower movement to server");
            }

            socket.emit("move_party_member", {
                username: username,
                memberId: this._memberIndex,
                x: this.x,
                y: this.y
            });
        }
    };

    // Hook into Scene_Map update to check for completed movement routes
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        checkPlayerMovementComplete();
    };

    // Check if any player has completed their movement route and sync position
    function checkPlayerMovementComplete() {
        for (const key in playerTargetPositions) {
            const targetPos = playerTargetPositions[key];
            let gameEvent = null;

            // Check if this is a party member key (format: "username_member_memberId")
            if (key.includes("_member_")) {
                const parts = key.split("_member_");
                const username = parts[0];
                const memberId = parseInt(parts[1]);
                const arrayIndex = memberId - 1; // WHY MUST YOU BE A 1 BASED INDEX RPG MAKER

                const playerEvent = playerEvents[username];
                if (!playerEvent || !playerEvent.partyMembers[arrayIndex]) continue;

                gameEvent = playerEvent.partyMembers[arrayIndex].gameEvent;
            } else {
                // This is a regular player key
                const playerEvent = playerEvents[key];
                if (!playerEvent) continue;

                gameEvent = playerEvent.gameEvent;
            }

            if (!gameEvent) continue;

            // Check if the movement route has finished
            if (!gameEvent.isMoveRouteForcing()) {
                // Movement complete, snap to exact target position to avoid desync
                if (gameEvent.x !== targetPos.x || gameEvent.y !== targetPos.y) {
                    if (DEBUG_MODE) {
                        console.log(`Syncing ${key} from (${gameEvent.x}, ${gameEvent.y}) to target (${targetPos.x}, ${targetPos.y})`);
                    }
                    gameEvent.locate(targetPos.x, targetPos.y);
                }

                // Clear the target position after syncing
                delete playerTargetPositions[key];
            }
        }
    }

    // Load socket.io
    if (typeof io === "undefined") {
        let script = document.createElement("script");
        script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
        script.onload = function () {
            startSocketConnection(); // Call function to initialize socket after loading
        };
        document.head.appendChild(script);
    } else {
        startSocketConnection();
    }

    function startSocketConnection() {
        // Make connection to backend address
        socket = io(BACKEND_SERVER_URL);
        console.log("starting socket connection to", BACKEND_SERVER_URL);

        socket.on("connected", (data) => {
            username = data.username;

            // Send party member IDs to the server
            sendPartyMemberIds();
        });

        socket.on("player_connected", (data) => {
            createMultiplayerPlayer(data);
        });

        socket.on("player_disconnected", (data) => {
            const playerEvent = playerEvents[data.username];
            if (playerEvent && playerEvent.gameEvent) {
                // Remove all party members attached to this player
                for (const memberId in playerEvent.partyMembers) {
                    const partyMember = playerEvent.partyMembers[memberId];
                    if (partyMember && partyMember.gameEvent) {
                        partyMember.gameEvent.erase();
                        delete playerEvent.partyMembers[memberId];
                    }
                }

                // Remove the player
                playerEvent.gameEvent.erase()
                delete playerEvents[data.username];
            }
        });

        socket.on("player_moved", (data) => {
            // Ignore our own movement updates because our client handles our own movement
            if (data.username === username) {
                return;
            }

            player_moveTo(data.username, data.x, data.y)
        });

        socket.on("party_member_moved", (data) => {
            // Ignore our own movement updates because our client handles our own movement
            if (data.username === username) {
                return;
            }

            party_moveTo(data.username, data.memberId, data.x, data.y);
        })

        socket.on("current_players", (players) => {
            for (const player of players) {
                if (player.username === username) {
                    continue;
                }
                createMultiplayerPlayer(player);
            }
        });

        socket.on("player_party_updated", (data) => {
            // Ignore our own party updates
            if (data.username === username) {
                return;
            }

            if (DEBUG_MODE) {
                console.log(`Player ${data.username} party updated:`, data.partyMembers);
            }

            updatePlayerPartyMembers(data.username, data.partyMembers);
        });
    }

    // Creates a player event at the specified position with the given character sprite
    function createPlayerEvent(x, y, characterName, characterIndex, isPartyMember = false) {
        const eventId = $dataMap.events.length;

        // Create event data
        const eventData = {
            id: eventId,
            name: !isPartyMember ? "Player_" + eventId : "PartyMember_" + eventId,
            x: x,
            y: y,
            pages: [{
                conditions: {
                    actorId: 1,
                    actorValid: false,
                    itemId: 1,
                    itemValid: false,
                    selfSwitchCh: "A",
                    selfSwitchValid: false,
                    switch1Id: 1,
                    switch1Valid: false,
                    switch2Id: 1,
                    switch2Valid: false,
                    variableId: 1,
                    variableValid: false,
                    variableValue: 0
                },
                image: {
                    characterName: characterName,
                    characterIndex: characterIndex,
                    direction: 2,
                    pattern: 1,
                    tileId: 0
                },
                moveFrequency: 3,
                moveRoute: { list: [{ code: 0 }], repeat: true, skippable: false, wait: false },
                moveSpeed: 3,
                moveType: 0,
                priorityType: 1,
                stepAnime: false,
                through: false,
                trigger: 0,
                walkAnime: true,
                directionFix: false,
                list: []
            }]
        };

        // Add to map
        $dataMap.events[eventId] = eventData;

        // Create game event
        const gameEvent = new Game_Event($gameMap._mapId, eventId);
        $gameMap._events[eventId] = gameEvent;

        // Create sprite
        const spriteset = SceneManager._scene._spriteset;
        const sprite = new Sprite_Character(gameEvent);
        spriteset._characterSprites.push(sprite);
        spriteset._tilemap.addChild(sprite);

        return { eventData, gameEvent };
    }

    // Handles other players movements
    function player_moveTo(username, x, y) {
        const playerEvent = playerEvents[username];
        if (!playerEvent) {
            if (DEBUG_MODE) {
                console.log("No event found for username:", username);
            }
            return;
        }

        const gameEvent = playerEvent.gameEvent;

        if (DEBUG_MODE) {
            console.log(`Moving player ${username} to (${x}, ${y})`);
        }

        // Store the target position for syncing after movement completes
        playerTargetPositions[username] = { x: x, y: y };

        // Configure the event to move smoothly with a walk animation and match the speed of normal players
        gameEvent.setStepAnime(true)
        gameEvent.setMoveSpeed(5);

        // Calculate the distance from current position to target
        const distanceX = x - gameEvent.x;
        const distanceY = y - gameEvent.y;

        // Build movement route for smooth movement
        const moveRoute = {
            list: [],
            repeat: false,
            skippable: false,
            wait: false
        };

        // Push all vertical movements
        for (let i = 0; i < Math.abs(distanceY); i++) {
            if (distanceY > 0) {
                moveRoute.list.push({ code: 1 }); // Move Down
            } else if (distanceY < 0) {
                moveRoute.list.push({ code: 4 }); // Move Up
            }
        }

        // Push all horizontal movements
        for (let i = 0; i < Math.abs(distanceX); i++) {
            if (distanceX < 0) {
                moveRoute.list.push({ code: 2 }); // Move Left
            } else if (distanceX > 0) {
                moveRoute.list.push({ code: 3 }); // Move Right
            }
        }

        // Indicate that the route is finished and play the movement route
        moveRoute.list.push({ code: 0 });
        gameEvent.forceMoveRoute(moveRoute);
    }

    function party_moveTo(username, memberId, x, y) {
        const playerEvent = playerEvents[username];
        if (!playerEvent) {
            if (DEBUG_MODE) {
                console.log("No event found for username:", username);
            }
            return;
        }

        // Convert from 1-based memberId (Game_Follower._memberIndex) to 0-based array index
        const arrayIndex = memberId - 1;

        const partyMember = playerEvent.partyMembers[arrayIndex];
        if (!partyMember) {
            console.log(`No party member found for username: ${username}, memberId: ${memberId}, arrayIndex: ${arrayIndex}`);
            console.log(`Available party members:`, Object.keys(playerEvent.partyMembers || {}));
            return
        }

        const gameEvent = partyMember.gameEvent;

        if (DEBUG_MODE) {
            console.log(`Moving party member ${memberId} of player ${username} to (${x}, ${y})`);
        }

        // Store the target position for syncing after movement completes
        playerTargetPositions[`${username}_member_${memberId}`] = { x: x, y: y };

        // Configure the event to move smoothly with a walk animation and match the speed of normal players
        gameEvent.setStepAnime(true)
        gameEvent.setMoveSpeed(5);

        // Calculate the distance from current position to target
        const distanceX = x - gameEvent.x;
        const distanceY = y - gameEvent.y;

        // Build movement route for smooth movement
        const moveRoute = {
            list: [],
            repeat: false,
            skippable: false,
            wait: false
        };

        // Push all vertical movements
        for (let i = 0; i < Math.abs(distanceY); i++) {
            if (distanceY > 0) {
                moveRoute.list.push({ code: 1 }); // Move Down
            } else if (distanceY < 0) {
                moveRoute.list.push({ code: 4 }); // Move Up
            }
        }

        // Push all horizontal movements
        for (let i = 0; i < Math.abs(distanceX); i++) {
            if (distanceX < 0) {
                moveRoute.list.push({ code: 2 }); // Move Left
            } else if (distanceX > 0) {
                moveRoute.list.push({ code: 3 }); // Move Right
            }
        }

        // Indicate that the route is finished and play the movement route
        moveRoute.list.push({ code: 0 });
        gameEvent.forceMoveRoute(moveRoute);
    }

    // Send party member IDs to the server
    function sendPartyMemberIds() {
        if (!socket || !username) {
            if (DEBUG_MODE) {
                console.log("Socket or username not initialized, cannot send party member IDs");
            }
            return;
        }

        // Get the party member ids
        const partyMemberIds = $gameParty.battleMembers().map(actor => actor.actorId());

        if (DEBUG_MODE) {
            console.log("Sending party member IDs to server:", partyMemberIds);
        }

        socket.emit("set_party_members", {
            partyMemberIds: partyMemberIds
        });
    }

    // Update another player's party members
    function updatePlayerPartyMembers(username, partyMemberIds) {
        const playerEvent = playerEvents[username];
        if (!playerEvent) {
            if (DEBUG_MODE) {
                console.log("No event found for username:", username);
            }
            return;
        }

        // Remove existing party members
        if (playerEvent.partyMembers) {
            for (const partyMember of playerEvent.partyMembers) {
                if (partyMember && partyMember.gameEvent) {
                    partyMember.gameEvent.erase();
                }
            }
        }

        // Create new party members based on the updated IDs
        playerEvent.partyMembers = [];
        for (let i = 0; i < partyMemberIds.length - 1; i++) { // -1 because the leader is not a follower
            const actorId = partyMemberIds[i + 1]; // Skip the first actor cuz leader
            if (!actorId) continue;

            if (DEBUG_MODE) {
                console.log(`Creating party member ${i} (Actor ID: ${actorId}) for player ${username}`);
            }

            // Get the actor data to determine the character sprite
            const actor = $dataActors[actorId];
            if (!actor) {
                console.error(`Actor with ID ${actorId} not found`);
                continue;
            }

            // Create the party member event with the correct character sprite
            const partyMember = createPlayerEvent(
                playerEvent.gameEvent.x,
                playerEvent.gameEvent.y + i + 1,
                actor.characterName,
                actor.characterIndex,
                true
            );

            partyMember.gameEvent.setThrough(true);
            playerEvent.partyMembers[i] = partyMember;
        }

        if (DEBUG_MODE) {
            console.log(`Final partyMembers array for ${username}:`, playerEvent.partyMembers);
        }
    }

    // Creates a fake player sprite using events with sprites attached
    function createMultiplayerPlayer(data) {
        // Avoid creating a player for ourselves
        if (data.username === username) {
            return;
        }

        if (DEBUG_MODE) {
            console.log("Creating multiplayer player at", data);
        }

        // Check if we're in a valid game state
        if (!$gameMap || !$dataMap) {
            return;
        }

        // Check if we're in a map scene or else bad things may happen
        if (!SceneManager._scene || !SceneManager._scene._spriteset) {
            console.error("Cannot create multiplayer player: Not in map scene");
            return;
        }

        try {
            playerEvents[data.username] = createPlayerEvent(data.x, data.y, "Actor1", 0);
            const player = playerEvents[data.username];

            // Initialize party members array
            player.partyMembers = [];

            // If the player has party member data, create them
            if (data.partyMembers && data.partyMembers.length > 1) {
                for (let i = 1; i < data.partyMembers.length; i++) {
                    const actorId = data.partyMembers[i];
                    if (!actorId) continue;

                    const memberIndex = i - 1; // Convert to 0-based index for followers

                    if (DEBUG_MODE) {
                        console.log(`Creating party member ${memberIndex} (Actor ID: ${actorId}) for player ${data.username}`);
                    }

                    // Get the actor data to determine the character sprite
                    const actor = $dataActors[actorId];
                    if (!actor) {
                        console.error(`Actor with ID ${actorId} not found`);
                        continue;
                    }

                    // Create the party member event with the correct character sprite
                    const partyMember = createPlayerEvent(
                        data.x,
                        data.y + i,
                        actor.characterName,
                        actor.characterIndex,
                        true
                    );
                    partyMember.gameEvent.setThrough(true);

                    player.partyMembers[memberIndex] = partyMember;
                }
            }

            if (DEBUG_MODE) {
                console.log("Multiplayer player created successfully");
            }
        } catch (error) {
            console.error("Error creating multiplayer player:", error);
        }
    }
})();