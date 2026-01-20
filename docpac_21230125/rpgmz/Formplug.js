/*:
 * @target MZ
 * @plugindesc Allows users to give a thumbs up, down or Wiggle to Formbar and interact with Formbar API via socket.io-client.
 * @author Bryce Lynd, C. Smith
 * 
 * @command thumbsUp
 * @text Thumbs Up
 * @desc Sends a ThumbsUp
 * 
 * @command thumbsDown
 * @text Thumbs Down
 * @desc Sends a ThumbsDown
 * 
 * @command Wiggle
 * @text Wiggle
 * @desc Sends a Wiggle
 * 
 * @command remove
 * @text Remove Vote
 * @desc Removes the user's vote
 * 
 * @command Clear
 * @text Clear Poll
 * @desc Clears the current poll
 * 
 * @command End
 * @text End Poll
 * @desc Ends the current poll
 * 
 * @command Start
 * @text Start Poll
 * @desc Starts a poll
 * 
 * @arg prompt
 * @text Prompt
 * @desc The question the users must answer
 * 
 * @arg answer
 * @text Answer
 * @desc Correct Answer (0 if none)
 * 
 * @arg response1
 * @text Response Green
 * @desc Response text (leave blank if none)
 * 
 * @arg response2
 * @text Response Blue
 * @desc Response text (leave blank if none)
 * 
 * @arg response3
 * @text Response Yellow
 * @desc Response text (leave blank if none)
 * 
 * @arg response4
 * @text Response Red
 * @desc Response text (leave blank if none)
 * 
 * @arg textBox
 * 
 * @text Enable Text Answers
 * @desc Students can answer with text replies
 * @type boolean
 * @default false
 * 
 * @command ShowPollWindows
 * @text Show Poll Windows
 * @desc Shows windows displaying the current poll prompt and responses
 * 
 * @command ShowPollResults
 * @text Show Poll Results
 * @desc Shows a HUD window displaying the poll results (most chosen answer and correct answer if applicable)
 * 
 * @command Quiz
 * @text Quiz
 * @desc Picks a random question from a bank or online
 *
 * @arg timerSeconds
 * @text Timer Seconds
 * @desc How many seconds to wait before automatically finishing the quiz (0 = no timer)
 * @type number
 * @default 15
 *
 * @arg randomPlayer
 * @text Random Player
 * @desc If true, selects a random number between 0 and 2
 * @type boolean
 * @default false
 *
 * @command Encounter
 * @text Random Encounter
 * @desc Picks a random item from an array of weights
 *
 * @arg encounterIndex
 * @text Encounter Variable
 * @desc Where is the result stored?
 * @type variable
 * 
 * @arg encounterWeights
 * @text Weights Variable
 * @desc Variable containing the array of possibilities by weights
 * @type variable
 * 
 * @arg modifierVar
 * @text Modifier Variable
 * @desc Subtract the value of the variable with this id from the first weight
 * @type variable
 * 
 * @arg chanceVar
 * @text Chance Variable
 * @desc Where to store the random weight
 * @type variable
 * 
 * @command Select Actor
 * @text Select Actor
 * @desc Starts a poll to select an actor from party
 *
 * @arg actorVar
 * @text Actor Variable
 * @desc Where is the list of selectable actors stored?
 * @type variable
 * 
 * @command Get Actors
 * @text Get Actors
 * @desc Gets the list of actors in the party
 * @type variable
 *
 * @arg actorVar
 * @text Actor Variable
 * @desc Where is the list of selectable actors stored?
 * @type variable
 * 
 * @command Custom Poll
 * @text Custom Poll
 * @desc Starts a poll by getting poll data from a variable
 * @type variable
 *
 * @arg pollDataVar
 * @text Poll Variable
 * @desc Where is the object containing the poll data stored?
 * @type variable
 * 
 * @command Save Game With Class ID
 * @text Save Game With Class ID
 * @desc Saves the game and stores the class ID in variable 64
 * @type variable
 * 
 * @command Award digipogs
 * @text Award digipogs
 * @desc Sends digipogs to all active students
 * 
 * @arg amount
 * @text Amount
 * @desc Number of digipogs to award to each student
 * @type number
 * @default 1
 * 
 * @command Class Update
 * @text Class Update
 * @desc Sends a class update signal to the server
 * 
 * @param Formbar URL
 * @text Formbar URL
 * @desc The URL of the Formbar server.
 * @type text
 * @default https://formbeta.yorktechapps.com/
 * 
 * @param API Key
 * @text API Key
 * @desc The API key for Formbar.
 * @type text
 * @default 
 *
 * @param First VB Variable
 * @text First VB Variable
 * @desc Where the first value is stored for number of poll answers. Subsequent poll answers are stored in the variable numbers that follow.
 * @type variable
 * @default 11
 *
 * @param First VB Switch
 * @text First VB Switch
 * @desc Where the first value is stored for poll switches. Subsequent switches are stored in the switch numbers that follow.
 * @type switch
 * @default 11
 * 
 * @param Is Server
 * @text Is Server
 * @type boolean
 * @default false
 * @desc Is your game a server? If you just want the thumbs feature, set this to false.
 * 
 * @param Quiz Source
 * @text Quiz Source
 * @desc Select the source of the quiz questions.
 * @type select
 * @option local
 * @option opentbd.com
 * @option quizbank
 * @option openai
 * @default local
 * 
 * @param QuizBank URL
 * @text QuizBank URL
 * @desc Provide the link of the QuizBank source.
 * @type text
 * @default http://localhost:3000/
 * 
 * @param OpenAI API Key
 * @text OpenAI API Key
 * @desc The API key for OpenAI to generate quiz questions.
 * @type text
 * @default
 * 
 * @param Quiz Generator Subject
 * @text Quiz Generator Subject
 * @desc The subject/topic for OpenAI-generated quiz questions (e.g., Minecraft, Python, History).
 * @type text
 * @default Minecraft
 * 
 * @param Testing Actor ID
 * @text Testing Actor ID
 * @desc Actor ID used for testing purposes.
 * @type actor
 * @default 10
 * 
 * @param Reference Actor ID
 * @text Reference Actor ID
 * @desc Actor ID used as reference for level copying.
 * @type actor
 * @default 1
 * 
 * 
 * @help
 * This plugin allows users to give a thumbs up, down or wiggle to Formbar, and interact with Formbar API via socket.io-client.
 * 
 * Plugin Commands:
 *  - Formplug thumbsUp: Sends a Thumbs Up.
 *  - Formplug thumbsDown: Sends a Thumbs Down.
 *  - Formplug Wiggle: Sends a Wiggle.
 *  - Formplug remove: Removes the user's vote.
 *  - Formplug Start: Starts a poll with custom prompt and responses.
 *  - Formplug Clear: Clears the current poll.
 *  - Formplug End: Ends the current poll.
 *  - Formplug Quiz: Picks a random question from a bank or online with customizable timer and optional random player selection.
 *  - Formplug ShowPollWindows: Shows poll prompt and responses in windows.
 *  - Formplug Encounter: Picks a random item from an array of weights.
 *  - Formplug Select Actor: Starts a poll to select an actor from the party.
 *  - Formplug Get Actors: Gets the list of actors in the party.
 *  - Formplug Custom Poll: Starts a poll using poll data from a variable.
 *  - Formplug Save Game With Class ID: Saves the game and stores the class ID in the configured variable.
 *  - Formplug Award digipogs: Sends digipogs to all active students.
 *  - Formplug Class Update: Sends a class update signal to the server.
 *
 * Quiz Timer:
 * The Quiz command now accepts a "Timer Seconds" argument that controls how long
 * the quiz runs before automatically finishing. Set to 0 to disable the timer.
 * 
 * Random Player:
 * The Quiz command also accepts a "Random Player" boolean argument. When set to true,
 * it will select a random number between 0 and 2. This can be used for random player
 * selection in multiplayer scenarios.
 */

(() => {

    // ============================================================================
    // PLUGIN INITIALIZATION AND CONFIGURATION
    // ============================================================================

    //Set up the plugin
    const pluginName = "Formplug";
    const parameters = PluginManager.parameters('Formplug');
    const QUIZ_SOURCE = parameters['Quiz Source'];
    const QUIZBANK_URL = parameters['QuizBank URL'];
    const OPENAI_API_KEY = parameters['OpenAI API Key'];
    const QUIZ_GENERATOR_SUBJECT = parameters['Quiz Generator Subject'] || 'Minecraft';
    var FORMBAR_URL = parameters['Formbar URL'];
    var API_KEY = parameters['API Key'];
    const FIRST_VAR = parameters['First VB Variable'];
    const FIRST_SW = parameters['First VB Switch'];
    const SERVER = parameters['Is Server'];
    const TESTING_ACTOR_ID = Number(parameters['Testing Actor ID']) || 10;
    const REFERENCE_ACTOR_ID = Number(parameters['Reference Actor ID']) || 1;
    const POTION_ITEM_ID = Number(parameters['Potion Item ID']) || 7;
    const COMMON_EVENT_ID = Number(parameters['Common Event ID']) || 4;
    //Set up the variables and switches for polling
    const DEBUG_SWITCH = Number(FIRST_SW);      //Is the Debug Switch?
    const CONTINUE_SWITCH = Number(FIRST_SW) + 1;   //Is the Continue Switch?
    const POLL_FINISHED = Number(FIRST_SW) + 2;         //Is the Poll Finished?
    const POLL_RUNNING = Number(FIRST_SW) + 3;      //Is the Poll Running?
    const BOSS_FIGHT = Number(FIRST_SW) + 12;        //Is a Boss Fight Active?
    const CUSTOM_RANDOM = Number(FIRST_SW) + 18;      //Is a Custom Random Player Active?

    // Track last 20 questions for variety (store only the prompt strings)
    let recentQuestions = [];

    // Variable order starting at FIRST_VAR:
    // 0: classId
    // 1: Random Player
    // 2: Poll Data
    // 3: Custom Poll Data
    // 4: FlashPollMax
    // 5: FlashPollLoops
    // 6: Responders
    // 7: Responses
    // 8: Majority
    // 9: Correct
    // 10: Percent
    // 11: SavePollPercent
    // 12: Consolidated Text
    // 13..16: Response 1..4
    const CLASS_ID_VARIABLE = Number(FIRST_VAR) + 0;
    const RANDOM_PLAYER_VAR = Number(FIRST_VAR) + 1;
    const POLL_DATA_VAR = Number(FIRST_VAR) + 2;
    const CUSTOM_POLL_DATA_VAR = Number(FIRST_VAR) + 3;
    const FLASH_POLL_MAX = Number(FIRST_VAR) + 4;
    const FLASH_POLL_LOOPS = Number(FIRST_VAR) + 5;
    const POLL_RESPONDERS = Number(FIRST_VAR) + 6;  //Total number of people listed to respond
    const POLL_RESPONSES = Number(FIRST_VAR) + 7;   //Total number of people who have responded already
    const POLL_MAJORITY = Number(FIRST_VAR) + 8;    //Which answer was the most selected?
    const POLL_CORRECT = Number(FIRST_VAR) + 9;     //For a quiz-like poll, this is the correct answer's number
    const POLL_PERCENT = Number(FIRST_VAR) + 10;    //The number of people who have selected the correct answer
    const CONSOLIDATED_TEXT_VAR = Number(FIRST_VAR) + 12;
    const POLL_RES_START = Number(FIRST_VAR) + 13;  //Where the poll responses start (4 variables that start here)
    const AUTO_END_PERCENT = Number(FIRST_VAR) + 17; //The percentage of students that must respond before the poll auto-finishes
    const AUTO_END_TIMER = Number(FIRST_VAR) + 18; //The timer in seconds before the poll auto-finishes

    var pollPrompt = "";
    var pollResponses = [];
    var activeStudents = [];
    var excludedStudents = [];
    var pollTextResponses = []; // Array to track poll text responses

    // Function to consolidate poll responses from students' response.textRes using regex and JavaScript methods
    function consolidatePollResponses(students) {
        if (!students || students.length === 0) return [];

        // Extract text responses from students and normalize: trim, lowercase, remove extra spaces
        const textResponses = students
            .map(s => (s && s.response && typeof s.response.textRes === 'string') ? s.response.textRes : '')
            .filter(t => t && t.trim().length > 0);

        if (textResponses.length === 0) return [];

        const normalizedResponses = textResponses.map(response =>
            response.toString().trim().toLowerCase().replace(/\s+/g, ' ')
        );

        // Group similar responses using various matching strategies
        const groups = [];
        const processed = new Set();

        for (let i = 0; i < normalizedResponses.length; i++) {
            if (processed.has(i)) continue;

            const currentResponse = normalizedResponses[i];
            const group = {
                original: textResponses[i], // Keep original for reference
                normalized: currentResponse,
                count: 1,
                indices: [i]
            };

            // Find similar responses
            for (let j = i + 1; j < normalizedResponses.length; j++) {
                if (processed.has(j)) continue;

                const otherResponse = normalizedResponses[j];

                // Check for exact match
                if (currentResponse === otherResponse) {
                    group.count++;
                    group.indices.push(j);
                    processed.add(j);
                    continue;
                }

                // Check for similarity using various methods
                if (isSimilarResponse(currentResponse, otherResponse)) {
                    group.count++;
                    group.indices.push(j);
                    processed.add(j);
                }
            }

            groups.push(group);
            processed.add(i);
        }

        // Sort by count (most common first)
        groups.sort((a, b) => b.count - a.count);

        // Save top 4 groups to game variable
        const top4Groups = groups.slice(0, 4);

        $gameVariables.setValue(CONSOLIDATED_TEXT_VAR, top4Groups);

        return groups;
    }

    // Helper function to determine if two responses are similar
    function isSimilarResponse(response1, response2) {
        // Exact match
        if (response1 === response2) return true;

        // Check if one contains the other (for partial matches)
        if (response1.includes(response2) || response2.includes(response1)) {
            return true;
        }

        // Check for common words (at least 50% word overlap)
        const words1 = response1.split(/\s+/).filter(w => w.length > 0);
        const words2 = response2.split(/\s+/).filter(w => w.length > 0);

        if (words1.length === 0 || words2.length === 0) return false;

        const commonWords = words1.filter(word => words2.includes(word));
        const overlapRatio = commonWords.length / Math.min(words1.length, words2.length);

        if (overlapRatio >= 0.5) return true;

        // Check for character similarity (Levenshtein distance approximation)
        const maxLength = Math.max(response1.length, response2.length);
        const minLength = Math.min(response1.length, response2.length);

        if (minLength === 0) return false;

        // Simple character overlap check
        let commonChars = 0;
        for (let i = 0; i < Math.min(response1.length, response2.length); i++) {
            if (response1[i] === response2[i]) commonChars++;
        }

        const charSimilarity = commonChars / maxLength;
        return charSimilarity >= 0.7;
    }

    let classId = 0;
    let socket = null; // Global socket instance

    // Queue incoming socket data until the game variables/switches are ready
    let pendingClassUpdates = [];
    function isGameReady() {
        try {
            return !!(window.$gameSwitches && $gameSwitches._data && $gameSwitches._data.length > 0 && window.$gameVariables && $gameVariables._data);
        } catch (e) {
            return false;
        }
    }

    function flushPendingClassUpdates() {
        if (!isGameReady()) return;
        while (pendingClassUpdates.length) {
            const data = pendingClassUpdates.shift();
            applyClassUpdateData(data);
        }
    }

    // ============================================================================
    // CUSTOM TIMER SYSTEM
    // ============================================================================

    // Custom timer system that works in all scenes including combat
    let customPollTimer = null;
    let customPollTimerSeconds = 0;
    let customPollTimerDisplay = null;

    // Create custom timer display
    function createCustomTimerDisplay() {
        if (customPollTimerDisplay) {
            document.body.removeChild(customPollTimerDisplay);
        }

        customPollTimerDisplay = document.createElement('div');
        customPollTimerDisplay.id = 'customPollTimer';
        customPollTimerDisplay.style.cssText = `
            position: fixed;
            top: 26.5%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: rmmz-mainfont, Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 2px 2px black;
            z-index: 9999;
            border: 4px solid rgb(109, 181, 214);
            box-shadow: 0 0 10px rgba(77, 205, 255, 0.8);
        `;
        document.body.appendChild(customPollTimerDisplay);
    }

    // Update custom timer display
    function updateCustomTimerDisplay() {
        if (customPollTimerDisplay && customPollTimerSeconds > 0) {
            customPollTimerDisplay.textContent = customPollTimerSeconds.toString();
        }
    }

    // Start custom timer
    function startCustomTimer(seconds) {
        if (seconds <= 0) return;

        customPollTimerSeconds = seconds;
        createCustomTimerDisplay();
        updateCustomTimerDisplay();

        customPollTimer = setInterval(() => {
            customPollTimerSeconds--;
            updateCustomTimerDisplay();

            if (customPollTimerSeconds <= 0) {
                stopCustomTimer();
            }
        }, 1000);
    }

    // Stop custom timer
    function stopCustomTimer() {
        if (customPollTimer) {
            clearInterval(customPollTimer);
            customPollTimer = null;
        }
        if (customPollTimerDisplay) {
            document.body.removeChild(customPollTimerDisplay);
            customPollTimerDisplay = null;
        }
        customPollTimerSeconds = 0;
    }

    // Safety function to ensure all timers are stopped when poll ends
    function ensureTimersStopped() {
        if (window.pollAutoFinishTimer) {
            clearTimeout(window.pollAutoFinishTimer);
            window.pollAutoFinishTimer = null;
        }
        stopCustomTimer();
    }

    // ============================================================================
    // EXTERNAL SCRIPT LOADING
    // ============================================================================

    // Check if Socket.IO is already loaded
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

    if (QUIZ_SOURCE == "local" || QUIZ_SOURCE == "openai") {
        if (typeof QUESTIONS === "undefined") {
            let script = document.createElement("script");
            script.src = "./js/plugins/questions/questions.js";
            script.onload = function () {
                console.log("Questions loaded");
            };
            document.head.appendChild(script);
        }
    }

    // ============================================================================
    // SOCKET CONNECTION AND EVENT HANDLING
    // ============================================================================

    // Run this function when socketio is loaded to set up all of the socket events and plugin commands
    function startSocketConnection() {
        // make connection to address with API key
        socket = io(FORMBAR_URL, {
            extraHeaders: {
                api: API_KEY
            }
        });

        // When connected
        socket.on('connect', () => {
            console.log('Connected');

            // Ensure all timers are stopped when connecting
            ensureTimersStopped();

            socket.emit('getActiveClass');  // See what class the user is in
            socket.emit('getOwnedClasses'); // Get list of owned classes
        });

        socket.on('setClass', (receivedId) => {
            console.log(`The user is currently in the class with id ${receivedId}`);
            classId = receivedId;
            socket.emit('classUpdate');

            // Search for matching save file when class is set
            if (classId && classId !== 0) {
                console.log(`Searching for save file with classId: ${classId}`);
                searchSaveFilesForClassId(classId).then(savefileId => {
                    window.matchingSaveFileId = savefileId;
                    if (savefileId > 0) {
                        console.log(`Found matching save file: ${savefileId}`);
                    } else {
                        console.log('No matching save file found');
                    }
                });
            } else {
                console.log('No classId available');
                window.matchingSaveFileId = 0;
            }
        });

        // Handle errors
        socket.on('connect_error', (error) => {
            if (error.message == 'xhr poll error') {
                console.log('no connection');
            } else {
                console.log(error.message);
            }

            setTimeout(() => {
                console.log('Reconnecting...');
                socket.connect(); // Try to reconnect after 5 seconds
            }, 5000);
        });

        socket.on('classEnded', () => {
            // Ensure all timers are stopped when class ends
            ensureTimersStopped();

            // Set poll to finished since class has ended
            if (isGameReady())
                if ($gameSwitches._data.length > 0) {
                    $gameSwitches.setValue(POLL_RUNNING, false);
                    $gameSwitches.setValue(POLL_FINISHED, true);
                }

            socket.emit('leave', classId);
            classId = '';
            socket.emit('getUserClass', { api: API_KEY });
        });

        // Log any socket event received
        socket.onAny((event, ...args) => {
            console.log(`[Socket Event] ${event}:`, ...args);
        });

        // When you receive a virtual bar update, update the variables and switches
        socket.on('classUpdate', (data) => {
            // Queue the data if the game isn't ready yet
            if (!$gameSwitches) return;
            if (!$gameSwitches._data) return;

            if ($gameSwitches._data.length > 0) { //if the game has loaded
                if (!$gameSwitches.value(POLL_FINISHED)) { //if the poll hasn't finished yet
                    //Reset game variables
                    $gameVariables.setValue(POLL_RESPONDERS, data.poll.totalResponders);       //Possible responses
                    $gameVariables.setValue(POLL_RESPONSES, data.poll.totalResponses);    //Have responded
                    $gameVariables.setValue(POLL_MAJORITY, 0);                      //Majority Answer

                    // Track poll text responses from the latest poll data
                    if (data.poll && pollResponses.length > 0) {
                        pollTextResponses = pollResponses.map(response => response.answer);
                    }

                    activeStudents = [];
                    //for each property in the data.students property
                    for (const studentData of Object.entries(data.students)) {
                        const [key, studentDataObj] = studentData;
                        // Check for missing data and skip if invalid
                        if (!studentDataObj || !studentDataObj.displayName || key === "undefined" || key === "null") continue;
                        // Only include active students who are not on break and have classPermissions of 2 (student)
                        if (studentDataObj.break || studentDataObj.classPermissions != 2) continue;
                        // Check if the student is tagged as Offline in a string (old way)
                        if (typeof studentDataObj.tags === "string" && studentDataObj.tags.split(",").map(tag => tag.trim()).includes("Offline")) continue;
                        // Check if the student is tagged as Offline in an array (new way)
                        if (Array.isArray(studentDataObj.tags) && studentDataObj.tags.map(tag => tag.trim()).includes("Offline")) continue;

                        const defaultActor = {
                            lastUpdated: new Date(),
                            actorClass: 1,
                            equipment: {
                                head: null,
                                body: {
                                    id: 102,
                                    name: "York Tech Uniform"
                                },
                                accessory: null,
                                weapon: {
                                    id: 50,
                                    name: "York Tech Sword"
                                },
                                shield: null
                            },
                            images: {
                                character: "You_character.png",
                                face: "You_face.png",
                                battler: "You_battler.png"
                            }
                        }

                        student = {
                            name: key,
                            nick: studentDataObj.displayName,
                            actorClass: 1,
                            response: studentDataObj.pollRes || "",
                        }

                        activeStudents.push(student);
                    }

                    var highestResponse = 0; //Track the response with the highest number of responders selected
                    //Then find the highest response and set the majority
                    for (let i = 0; i < Object.values(data.poll.responses).length; i++) {
                        $gameVariables.setValue(POLL_RES_START + i, Object.values(data.poll.responses)[i].responses);
                        if (Object.values(data.poll.responses)[i].responses > highestResponse) {
                            highestResponse = Object.values(data.poll.responses)[i].responses;
                            $gameVariables.setValue(POLL_MAJORITY, i + 1);
                        }
                    }

                    // Get threshold from game variable (0-100 range, convert to 0.0-1.0)
                    const AUTO_FINISH_THRESHOLD = ($gameVariables.value(AUTO_END_PERCENT) || 80) / 100;

                    //console.log(data.poll.totalResponses, data.poll.totalResponders, (data.poll.totalResponses / data.poll.totalResponders), AUTO_FINISH_THRESHOLD);

                    // Check if more than the threshold percentage of responders have submitted responses
                    if (data.poll.totalResponders > 0 && (data.poll.totalResponses / data.poll.totalResponders) >= AUTO_FINISH_THRESHOLD) {
                        console.log(`Auto-finishing poll: ${data.poll.totalResponses} of ${data.poll.totalResponders} responded (${((data.poll.totalResponses / data.poll.totalResponders) * 100).toFixed(1)}%)`);

                        // Start timer to auto-finish the poll (using AUTO_END_TIMER from game variable)
                        if (!window.pollAutoFinishTimer) {
                            const autoEndTimerSeconds = $gameVariables.value(AUTO_END_TIMER) || 5;
                            // Start custom timer for display
                            startCustomTimer(autoEndTimerSeconds + 1);

                            window.pollAutoFinishTimer = setTimeout(() => {
                                // Set poll to finished and not running
                                $gameSwitches.setValue(POLL_FINISHED, true);
                                $gameSwitches.setValue(POLL_RUNNING, false);

                                // Calculate poll percent based on highest response
                                $gameVariables.setValue(POLL_PERCENT, Math.round((highestResponse / data.poll.totalResponses) * 100));

                                // Consolidate poll text responses when poll ends
                                if (activeStudents.some(s => s && s.response && typeof s.response.textRes === 'string' && s.response.textRes.trim().length > 0)) {
                                    const consolidatedResponses = consolidatePollResponses(activeStudents);
                                    console.log("=== POLL RESPONSE CONSOLIDATION ===");
                                    const totalTextRes = activeStudents.filter(s => s && s.response && typeof s.response.textRes === 'string' && s.response.textRes.trim().length > 0).length;
                                    console.log("Total responses:", totalTextRes);
                                    console.log("Consolidated into", consolidatedResponses.length, "groups");
                                    console.log("Top 4 most common responses:");
                                    consolidatedResponses.slice(0, 4).forEach((group, index) => {
                                        console.log(`${index + 1}. "${group.original}" (${group.count} votes, normalized: "${group.normalized}")`);
                                    });
                                    console.log("================================");
                                }

                                // Send endPoll socket
                                socket.emit('updatePoll', { status: false });

                                // Clear the timer and stop custom timer
                                window.pollAutoFinishTimer = null;
                                stopCustomTimer();
                            }, autoEndTimerSeconds * 1000);
                        }
                    }

                    let savePollData = {}
                    if (pollResponses.length) {
                        savePollData = {
                            "prompt": pollPrompt,
                            "correctAnswer": 0,
                            "response1": $gameVariables.value(POLL_CORRECT) ? pollResponses[$gameVariables.value(POLL_CORRECT) - 1].answer : pollResponses[0].answer
                        }
                    }

                    $gameVariables.setValue(POLL_DATA_VAR, savePollData);

                    //If all responders have responded, set the poll to finished
                    $gameSwitches.setValue(POLL_FINISHED, (data.poll.totalResponders == data.poll.totalResponses) && data.poll.totalResponders != 0);
                    $gameSwitches.setValue(POLL_RUNNING, !$gameSwitches.value(POLL_FINISHED));
                    //Run cleanup when the poll is finished
                    if ($gameSwitches.value(POLL_FINISHED)) {
                        console.log("Poll finished: " + data.poll.totalResponders + " responders, " + data.poll.totalResponses + " responses.");
                        // Ensure all timers are stopped when poll ends
                        ensureTimersStopped();
                        if ($gameVariables.value(POLL_CORRECT) == 0) {
                            $gameVariables.setValue(POLL_PERCENT, (Math.round((highestResponse / data.poll.totalResponders) * 100)));
                        } else {
                            $gameVariables.setValue(POLL_PERCENT, (Math.round((Object.values(data.poll.responses)[$gameVariables.value(POLL_CORRECT) - 1].responses / data.poll.totalResponders) * 100)));
                        }

                        // Consolidate poll text responses when poll ends
                        if (activeStudents.some(s => s && s.response && typeof s.response.textRes === 'string' && s.response.textRes.trim().length > 0)) {
                            const consolidatedResponses = consolidatePollResponses(activeStudents);
                            console.log("=== POLL RESPONSE CONSOLIDATION ===");
                            const totalTextRes = activeStudents.filter(s => s && s.response && typeof s.response.textRes === 'string' && s.response.textRes.trim().length > 0).length;
                            console.log("Total responses:", totalTextRes);
                            console.log("Consolidated into", consolidatedResponses.length, "groups");
                            console.log("Top 4 most common responses:");
                            consolidatedResponses.slice(0, 4).forEach((group, index) => {
                                console.log(`${index + 1}. "${group.original}" (${group.count} votes, normalized: "${group.normalized}")`);
                            });
                            console.log("================================");
                        }

                        socket.emit('updatePoll', { status: false });
                    }

                }
                // if (data.poll.status == false) {
                //     $gameSwitches.setValue(POLL_RUNNING, false);
                //     $gameSwitches.setValue(POLL_FINISHED, false);
                // }
            }

        });

        // ============================================================================
        // PLUGIN COMMAND REGISTRATIONS
        // ============================================================================

        PluginManager.registerCommand(pluginName, "thumbsUp", () => {
            socket.emit("pollResp", "Up")
        });
        PluginManager.registerCommand(pluginName, "thumbsDown", () => {
            socket.emit('pollResp', "Down");
        });
        PluginManager.registerCommand(pluginName, "Wiggle", () => {
            socket.emit('pollResp', 'Wiggle');
        });
        PluginManager.registerCommand(pluginName, "remove", () => {
            socket.emit('pollResp', 'remove');
        });

        // Register the plugin command for starting a poll
        // This command will be called from the RPG Maker MV editor
        // and will start a poll with the given parameters
        // The parameters are passed as an object with the following properties:
        // prompt: The question to ask the users
        // answer: The correct answer (0 if none)
        // response1: The first response option (green)
        // response2: The second response option (blue)
        // response3: The third response option (yellow)
        // response4: The fourth response option (red)
        // The command will emit a socket event to start the poll
        PluginManager.registerCommand(pluginName, "Start", args => {
            startPoll(args);
        });

        // ============================================================================
        // POLL MANAGEMENT FUNCTIONS
        // ============================================================================

        function startPoll(args) {
            // Ensure all timers are stopped before starting new poll
            ensureTimersStopped();

            $gameVariables.setValue(POLL_CORRECT, Number(args.answer)); //Correct Answer
            const prompt = args.prompt; //The question to ask the users
            //The responses to the question
            let poll_res = [
                {
                    "answer": args.response1,
                    "weight": 1,
                    "color": "#00ff00"
                },
                {
                    "answer": args.response2,
                    "weight": 1,
                    "color": "#00ffff"
                },
                {
                    "answer": args.response3,
                    "weight": 1,
                    "color": "#ffff00"
                },
                {
                    "answer": args.response4,
                    "weight": 1,
                    "color": "#ff0000"
                }
            ];
            //Remove any null or undefined responses
            poll_res = poll_res.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

            // If there is a correct answer (not 0), set its weight to 3
            const correctAnswer = Number(args.answer);
            if (correctAnswer > 0 && correctAnswer <= poll_res.length) {
                poll_res[correctAnswer - 1].weight = 3;
            }

            //Start the poll
            socket.emit('startPoll',
                {
                    prompt: prompt,
                    allowTextResponses: args.textBox || false,
                    answers: poll_res,
                    excludedRespondents: []
                }
            );

            pollPrompt = prompt;
            pollResponses = poll_res;
            pollTextResponses = []; // Reset poll text responses for new poll
            //Set the poll to running/not finished
            $gameSwitches.setValue(POLL_RUNNING, true);
            $gameSwitches.setValue(POLL_FINISHED, false);
        }

        // Register the plugin command for clearing the poll
        PluginManager.registerCommand(pluginName, "Clear", () => {
            // Ensure all timers are stopped when clearing poll
            ensureTimersStopped();

            //Set the poll to not running/finished
            $gameSwitches.setValue(POLL_RUNNING, false);
            $gameSwitches.setValue(POLL_FINISHED, true);
            socket.emit('updatePoll', {});
        });

        // Register the plugin command for clearing the poll
        PluginManager.registerCommand(pluginName, "End", () => {
            // Ensure all timers are stopped when ending poll
            ensureTimersStopped();

            //Set the poll to not running/finished
            $gameSwitches.setValue(POLL_RUNNING, false);
            $gameSwitches.setValue(POLL_FINISHED, true);
            socket.emit('updatePoll', { status: false });
        });

        // ============================================================================
        // QUIZ TIMER FUNCTIONS
        // ============================================================================

        // Helper function to start quiz timer with custom duration
        function startQuizTimer(timerSeconds = 15) {
            // Don't start timer if timerSeconds is 0 or negative
            if (timerSeconds <= 0) return;

            // Start custom timer instead of game timer to avoid combat conflicts
            startCustomTimer(timerSeconds);

            window.pollAutoFinishTimer = setTimeout(() => {
                // Set poll to finished and not running
                $gameSwitches.setValue(POLL_FINISHED, true);
                $gameSwitches.setValue(POLL_RUNNING, false);

                // Calculate poll percent based on highest response
                let highestResponse = 0;
                for (let i = 0; i < pollResponses.length; i++) {
                    const responseCount = $gameVariables.value(POLL_RES_START + i) || 0;
                    if (responseCount > highestResponse) {
                        highestResponse = responseCount;
                    }
                }

                const totalResponses = $gameVariables.value(POLL_RESPONSES) || 0;
                if (totalResponses > 0) {
                    $gameVariables.setValue(POLL_PERCENT, Math.round((highestResponse / totalResponses) * 100));
                } else {
                    $gameVariables.setValue(POLL_PERCENT, 0);
                }

                // Send endPoll socket
                socket.emit('updatePoll', { status: false });

                // Clear the timer and stop custom timer
                window.pollAutoFinishTimer = null;
                stopCustomTimer();
            }, timerSeconds * 1000);
        }

        // Helper function to start quiz timer silently (without showing the timer display)
        function startQuizTimerSilent(timerSeconds = 15) {
            // Don't start timer if timerSeconds is 0 or negative
            if (timerSeconds <= 0) return;

            // Store the start time and total duration for accurate remaining time calculation
            window.pollTimerStartTime = Date.now();
            window.pollTimerDuration = timerSeconds;

            window.pollAutoFinishTimer = setTimeout(() => {
                // Set poll to finished and not running
                $gameSwitches.setValue(POLL_FINISHED, true);
                $gameSwitches.setValue(POLL_RUNNING, false);

                // Calculate poll percent based on highest response
                let highestResponse = 0;
                for (let i = 0; i < pollResponses.length; i++) {
                    const responseCount = $gameVariables.value(POLL_RES_START + i) || 0;
                    if (responseCount > highestResponse) {
                        highestResponse = responseCount;
                    }
                }

                const totalResponses = $gameVariables.value(POLL_RESPONSES) || 0;
                if (totalResponses > 0) {
                    $gameVariables.setValue(POLL_PERCENT, Math.round((highestResponse / totalResponses) * 100));
                } else {
                    $gameVariables.setValue(POLL_PERCENT, 0);
                }

                // Send endPoll socket
                socket.emit('updatePoll', { status: false });

                // Clear the timer and stop custom timer
                window.pollAutoFinishTimer = null;
                stopCustomTimer();
            }, timerSeconds * 1000);
        }

        PluginManager.registerCommand(pluginName, "Quiz", args => {
            if (!socket) return; // Don't proceed if socket isn't connected

            // Get timer seconds from args, default to 15 if not specified
            const timerSeconds = Number(args.timerSeconds) || 15;

            // Get random player from args, default to false if not specified
            var randomPlayer = args.randomPlayer === 'true' || args.randomPlayer === true;

            // If random player is true, select a random number between 0 and 2
            if (randomPlayer) {
                randomPlayer = activeStudents[Math.floor(Math.random() * activeStudents.length)];
                $gameVariables.setValue(RANDOM_PLAYER_VAR, randomPlayer);

                console.log(`Random player selected: ${randomPlayer.name}`);

                // Create list of all student names EXCEPT the random player
                excludedStudents = activeStudents.filter(s => s !== randomPlayer).map(s => s.name);

                console.log(`Excluded students (all except ${randomPlayer.name}): ${excludedStudents.join(", ")}`);

            } else {
                console.log(`No random player selected, using all students: ${activeStudents.map(s => s.name).join(", ")}`);
                // Reset excluded students
                excludedStudents = [];
            }

            // Ensure all timers are stopped before starting new quiz
            ensureTimersStopped();

            // Set the poll variables
            pollPrompt = "";
            pollResponses = "";
            pollTextResponses = []; // Reset poll text responses for new poll
            if (QUIZ_SOURCE == "local" || (QUIZ_SOURCE == "openai" && $gameVariables.value(BOSS_FIGHT))) {
                var question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
                $gameVariables.setValue(POLL_CORRECT, question.correctAnswer); //Correct Answer
                //Remove any null or undefined responses
                question.answers = question.answers.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

                //Start the poll
                socket.emit('startPoll',
                    {
                        prompt: question.prompt,
                        answers: question.answers,
                        excludedRespondents: randomPlayer ? excludedStudents : [],
                        blind: 1
                    }
                );

                // Set the poll variables
                pollPrompt = question.prompt;
                pollResponses = question.answers;
                pollTextResponses = []; // Reset poll text responses for new poll

                //Set the poll to running/not finished
                $gameSwitches.setValue(POLL_RUNNING, true);
                $gameSwitches.setValue(POLL_FINISHED, false);

                // Start timer for quiz (but don't show it yet)
                startQuizTimerSilent(timerSeconds);
            } else if (QUIZ_SOURCE == "opentbd.com") {
                fetch('https://opentdb.com/api.php?amount=1&category=9&difficulty=medium&type=multiple')
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        const q = data.results[0];

                        // Function to decode HTML entities
                        const decodeHTML = (str) => {
                            const txt = document.createElement("textarea");
                            txt.innerHTML = str;
                            return txt.value;
                        };

                        // Decode the question and answers
                        const decodedQuestion = decodeHTML(q.question);
                        const decodedCorrectAnswer = decodeHTML(q.correct_answer);
                        const decodedIncorrectAnswers = q.incorrect_answers.map(a => decodeHTML(a));

                        // Combine and shuffle answers
                        const allAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
                        for (let i = allAnswers.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
                        }

                        // Find the new index of the correct answer
                        const correctIndex = allAnswers.indexOf(decodedCorrectAnswer);

                        const question = {
                            prompt: decodedQuestion,
                            correctAnswer: correctIndex + 1, // +1 because poll answers are 1-based
                            answers: allAnswers.map((answer, index) => ({
                                answer: answer,
                                weight: 1,
                                color: ["#00ff00", "#00ffff", "#ffff00", "#ff0000"][index]
                            }))
                        };

                        $gameVariables.setValue(POLL_CORRECT, question.correctAnswer);
                        //Remove any null or undefined responses
                        question.answers = question.answers.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

                        // Ensure all timers are stopped before starting new quiz
                        ensureTimersStopped();

                        //Start the poll
                        socket.emit('startPoll',
                            {
                                prompt: question.prompt,
                                answers: question.answers,
                                excludedRespondents: randomPlayer ? excludedStudents : [],
                                blind: 1
                            }
                        );

                        // Set the poll variables
                        pollPrompt = question.prompt;
                        pollResponses = question.answers;
                        pollTextResponses = []; // Reset poll text responses for new poll

                        //Set the poll to running/not finished
                        $gameSwitches.setValue(POLL_RUNNING, true);
                        $gameSwitches.setValue(POLL_FINISHED, false);

                        // Start timer for quiz (but don't show it yet)
                        startQuizTimerSilent(timerSeconds);
                    });
            } else if (QUIZ_SOURCE == "quizbank") {
                fetch(QUIZBANK_URL)
                    .then(response => response.json())
                    .then(data => {
                        const question = data[0];

                        $gameVariables.setValue(POLL_CORRECT, question.correctIndex + 1); //Correct Answer

                        //Convert answers to objects with weight and color
                        question.answers = question.answers.map((answer, index) => ({
                            answer: answer,
                            weight: 1,
                            color: ["#00ff00", "#00ffff", "#ffff00", "#ff0000"][index]
                        }));

                        //Remove any null or undefined responses
                        question.answers = question.answers.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

                        // Ensure all timers are stopped before starting new quiz
                        ensureTimersStopped();

                        //Start the poll
                        socket.emit('startPoll', {
                            prompt: question.prompt,
                            answers: question.answers,
                            // excludedRespondents: [],
                            excludedRespondents: randomPlayer ? excludedStudents : [],
                            blind: 1
                        });

                        // Set the poll variables
                        pollPrompt = question.prompt;
                        pollResponses = question.answers;
                        pollTextResponses = []; // Reset poll text responses for new poll

                        //Set the poll to running/not finished
                        $gameSwitches.setValue(POLL_RUNNING, true);
                        $gameSwitches.setValue(POLL_FINISHED, false);

                        // Start timer for quiz (but don't show it yet)
                        startQuizTimerSilent(timerSeconds);
                    })
            } else if (QUIZ_SOURCE == "openai") {
                if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === "") {
                    console.error("OpenAI API Key is not configured");
                    return;
                }

                // Build context of recent questions to avoid repetition
                let recentQuestionsContext = "";
                if (recentQuestions.length > 0) {
                    recentQuestionsContext = `\n\nIMPORTANT: Do NOT generate questions similar to these recently asked questions:\n${recentQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nGenerate a completely different and unique question.`;
                }

                const systemPrompt = `You are a quiz question generator. Generate a multiple-choice question about ${QUIZ_GENERATOR_SUBJECT}. Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, just the raw JSON):

{
    "prompt": "Your question text here",
    "correctAnswer": 1,
    "answers": [
        { "answer": "Answer option 1", "weight": 1, "color": "#00ff00" },
        { "answer": "Answer option 2", "weight": 1, "color": "#00ffff" },
        { "answer": "Answer option 3", "weight": 1, "color": "#ffff00" },
        { "answer": "Answer option 4", "weight": 1, "color": "#ff0000" }
    ]
}

Requirements:
- The question must be about ${QUIZ_GENERATOR_SUBJECT}
- Do not specify the subject in the question
- correctAnswer must be a number between 1 and 4 (1-based index)
- You must provide exactly 4 answers
- Each answer must have "answer" (string), "weight" (number, always 1), and "color" (string, must be one of: "#00ff00", "#00ffff", "#ffff00", "#ff0000")
- The colors must be in the order: green, cyan, yellow, red
- Return ONLY the JSON object, nothing else
- The question must be in English
- There must be only one correct answer
- No answers should be too close to being correct if they are not the correct answer
- The question must be one sentence
- The answers must be a few words or less
- The question must be different from the recent questions: ${recentQuestionsContext}`;

                fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: `Generate a ${QUIZ_GENERATOR_SUBJECT} quiz question.` }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const content = data.choices[0].message.content.trim();

                        // Try to extract JSON from the response (in case it's wrapped in markdown)
                        let jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) {
                            throw new Error("No JSON found in OpenAI response");
                        }

                        const question = JSON.parse(jsonMatch[0]);

                        // Validate the question structure
                        if (!question.prompt || !question.answers || !Array.isArray(question.answers) || question.answers.length !== 4) {
                            throw new Error("Invalid question format from OpenAI");
                        }

                        // Add this question to recent questions list (keep only last 20)
                        recentQuestions.push(question.prompt);
                        if (recentQuestions.length > 20) {
                            recentQuestions.shift(); // Remove oldest question
                        }

                        // Ensure correctAnswer is valid
                        if (question.correctAnswer < 1 || question.correctAnswer > 4) {
                            question.correctAnswer = 1;
                        }

                        // Ensure all answers have the required structure
                        const colors = ["#00ff00", "#00ffff", "#ffff00", "#ff0000"];
                        question.answers = question.answers.map((answer, index) => ({
                            answer: answer.answer || answer,
                            weight: answer.weight || 1,
                            color: answer.color || colors[index]
                        }));

                        $gameVariables.setValue(POLL_CORRECT, question.correctAnswer);

                        //Remove any null or undefined responses
                        question.answers = question.answers.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

                        // Ensure all timers are stopped before starting new quiz
                        ensureTimersStopped();

                        //Start the poll
                        socket.emit('startPoll',
                            {
                                prompt: question.prompt,
                                answers: question.answers,
                                excludedRespondents: randomPlayer ? excludedStudents : [],
                                blind: 1
                            }
                        );

                        // Set the poll variables
                        pollPrompt = question.prompt;
                        pollResponses = question.answers;
                        pollTextResponses = []; // Reset poll text responses for new poll

                        //Set the poll to running/not finished
                        $gameSwitches.setValue(POLL_RUNNING, true);
                        $gameSwitches.setValue(POLL_FINISHED, false);

                        // Start timer for quiz (but don't show it yet)
                        startQuizTimerSilent(timerSeconds);
                    })
                    .catch(error => {
                        console.error("Error generating question from OpenAI:", error);
                        console.log("Falling back to local questions...");

                        // Fallback to local questions if OpenAI fails
                        if (typeof QUESTIONS !== "undefined" && QUESTIONS.length > 0) {
                            var question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
                            $gameVariables.setValue(POLL_CORRECT, question.correctAnswer); //Correct Answer

                            //Remove any null or undefined responses
                            question.answers = question.answers.filter(res => res.answer != null && res.answer !== undefined && res.answer != "");

                            // Ensure all timers are stopped before starting new quiz
                            ensureTimersStopped();

                            //Start the poll
                            socket.emit('startPoll',
                                {
                                    prompt: question.prompt,
                                    answers: question.answers,
                                    excludedRespondents: randomPlayer ? excludedStudents : [],
                                    blind: 1
                                }
                            );

                            // Set the poll variables
                            pollPrompt = question.prompt;
                            pollResponses = question.answers;
                            pollTextResponses = []; // Reset poll text responses for new poll

                            //Set the poll to running/not finished
                            $gameSwitches.setValue(POLL_RUNNING, true);
                            $gameSwitches.setValue(POLL_FINISHED, false);

                            // Start timer for quiz (but don't show it yet)
                            startQuizTimerSilent(timerSeconds);
                        } else {
                            console.error("QUESTIONS array not available for fallback. Quiz cannot be started.");
                        }
                    });
            }
        });


        PluginManager.registerCommand(pluginName, "Encounter", args => {
            const ENCOUNTER = args.encounterIndex; // Where to store the result
            const MODIFIER = args.modifierVar; // What variable to add to the chance
            const CHANCE = args.chanceVar; // What variable to store the chance
            let weights = $gameVariables.value(args.encounterWeights);
            if (MODIFIER) {
                // Subtract the value of the variable with this id from the first weight
                const modifierValue = $gameVariables.value(MODIFIER);
                if (weights.length > 0) {
                    // If the first weight is greater than the modifier, subtract the modifier from the weight
                    if (weights[0] > modifierValue) {
                        weights[0] -= modifierValue;
                    } else {
                        // If the modifier is greater than or equal to the first weight, set the first weight to 0
                        let remainder = modifierValue - weights[0];
                        weights[0] = 0;
                        // Distribute the remainder to the next weight, up to half of its original value
                        weights[1] -= Math.min(remainder, Math.floor(weights[1] / 2));
                    }
                }
            }

            // Calculate the total weight
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

            // Generate a random number between 0 and the total weight
            let random = Math.ceil(Math.random() * Math.min(totalWeight, 100));

            // Find the index corresponding to the random number
            let cumulativeWeight = 0;
            for (let i = 0; i < weights.length; i++) {
                console.log(`${cumulativeWeight} - ${cumulativeWeight + weights[i]} : ${random}`);
                cumulativeWeight += weights[i];
                if (random <= cumulativeWeight) {
                    $gameVariables.setValue(ENCOUNTER, i);
                    $gameVariables.setValue(CHANCE, random);
                    console.log(`Encounter selected: ${i} with chance ${random}`);
                    return;
                }
            }

            // This should never be reached if the weights are valid
            throw new Error("Failed to select an index. Check the weights array.");
        });

        PluginManager.registerCommand(pluginName, "Select Actor", args => {
            const ACTORVAR = args.actorVar;
            $gameVariables.setValue(ACTORVAR, getParty());
            startPoll(pollArgs);
        });

        PluginManager.registerCommand(pluginName, "Get Actors", args => {
            const ACTORVAR = args.actorVar;
            $gameVariables.setValue(ACTORVAR, getParty());
        });

        // ============================================================================
        // UTILITY FUNCTIONS
        // ============================================================================

        function getParty() {
            var party = $gameParty.members()
            let pollArgs = {};
            pollArgs.prompt = "Which Party Member?";
            pollArgs.answer = 0;
            for (var i = 0; i < party.length; i++) {
                pollArgs["response" + (i + 1)] = party[i].name();
                party[i].pollID = i + 1;
            }
            return party;
        }

        // Function to search for save files with matching classId
        function searchSaveFilesForClassId(targetClassId) {
            return new Promise((resolve) => {
                const maxSavefiles = DataManager.maxSavefiles();
                let currentIndex = 1; // Start from 1, skip slot 0 (autosave)

                const checkNextSave = () => {
                    if (currentIndex > maxSavefiles) {
                        resolve(0); // No matching save found
                        return;
                    }

                    if (DataManager.savefileExists(currentIndex)) {
                        loadSaveFileForCheck(currentIndex)
                            .then(contents => {
                                if (isMatchingSave(contents, targetClassId)) {
                                    resolve(currentIndex);
                                } else {
                                    currentIndex++;
                                    checkNextSave();
                                }
                            })
                            .catch(() => {
                                currentIndex++;
                                checkNextSave();
                            });
                    } else {
                        currentIndex++;
                        checkNextSave();
                    }
                };

                checkNextSave();
            });
        }

        function loadSaveFileForCheck(savefileId) {
            const saveName = DataManager.makeSavename(savefileId);
            return StorageManager.loadObject(saveName);
        }

        function isMatchingSave(contents, targetClassId) {
            try {
                // Check if the save file has the required data structure
                if (!contents || !contents.variables) {
                    return false;
                }

                // Try different ways to access game variable for class ID
                let gameVariable64 = 0;
                if (contents.variables._data && contents.variables._data[CLASS_ID_VARIABLE] !== undefined) {
                    gameVariable64 = contents.variables._data[CLASS_ID_VARIABLE];
                } else if (contents.variables.value && typeof contents.variables.value === 'function') {
                    gameVariable64 = contents.variables.value(CLASS_ID_VARIABLE);
                } else if (contents.variables[CLASS_ID_VARIABLE] !== undefined) {
                    gameVariable64 = contents.variables[CLASS_ID_VARIABLE];
                }

                return gameVariable64 === targetClassId;
            } catch (error) {
                console.error('Error checking save file:', error);
                return false;
            }
        }

        // Store the found save file ID globally
        window.matchingSaveFileId = 0;

        // Function to find the next available save slot
        function findNextAvailableSaveSlot() {
            const maxSavefiles = DataManager.maxSavefiles();

            // Start from slot 1 (skip slot 0 which is autosave)
            for (let i = 1; i <= maxSavefiles; i++) {
                if (!DataManager.savefileExists(i)) {
                    return i; // Found an empty slot
                }
            }

            // If no empty slots found, return 0 to indicate failure
            return 0;
        }

        PluginManager.registerCommand(pluginName, "Custom Poll", args => {
            const POLL_DATA = $gameVariables.value(Number(args.pollDataVar));
            startPoll(POLL_DATA);
        });

        PluginManager.registerCommand(pluginName, "Save Game With Class ID", () => {
            $gameVariables.setValue(CLASS_ID_VARIABLE, classId);
            $gameSystem.onBeforeSave();

            // First, search for an existing save file with this classId
            searchSaveFilesForClassId(classId).then(existingSaveId => {
                let saveSlot;

                if (existingSaveId > 0) {
                    // Found existing save file with this classId, save over it
                    saveSlot = existingSaveId;
                    console.log(`Found existing save file with classId ${classId}, saving to slot ${saveSlot}`);
                } else {
                    // No existing save found, find next available slot
                    saveSlot = findNextAvailableSaveSlot();
                    if (saveSlot > 0) {
                        console.log(`No existing save found, saving to next available slot ${saveSlot}`);
                    } else {
                        console.error("No available save slots found");
                        return;
                    }
                }

                // Save the game to the determined slot
                DataManager.saveGame(saveSlot).then(function () {
                    console.log(`Game saved successfully to slot ${saveSlot} with classId: ${classId}`);
                    // Update the matching save file ID for the continue button
                    window.matchingSaveFileId = saveSlot;
                }).catch(function () {
                    console.error("Save failed.");
                });
            });
        });

        PluginManager.registerCommand(pluginName, "Award digipogs", args => {
            const amount = Number(args.amount) || 1;

            console.log(`Awarding ${amount} digipog${amount !== 1 ? 's' : ''} to ${activeStudents.length} active students:`);

            activeStudents.forEach((student, index) => {
                socket.emit('awardDigipogs',
                    { from: 1, to: student.name, amount: amount }
                )
            });
        });

        PluginManager.registerCommand(pluginName, "Class Update", args => {
            // Send the class update signal
            socket.emit('classUpdate');
        });

        // Helper function to wrap text to fit within a given width
        function wrapText(window, text, maxWidth) {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const testWidth = window.textWidth(testLine);

                if (testWidth > maxWidth && currentLine) {
                    // Current line is full, start a new line
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }

            // Add the last line
            if (currentLine) {
                lines.push(currentLine);
            }

            return lines;
        }

        PluginManager.registerCommand(pluginName, "ShowPollWindows", () => {
            // Initialize _customHud if it doesn't exist
            if (!window._customHud) {
                window._customHud = [];
            }

            // Create windows for poll display
            const promptWindow = new Window_Base(new Rectangle(0, 0, Graphics.boxWidth, 80));
            promptWindow.opacity = 160;
            promptWindow.contents.fontSize = 18;

            // Process prompt text for \n and \t
            let processedPrompt = pollPrompt.replace(/\\t/g, '    ').replace(/\\n/g, '\n');
            const promptLines = processedPrompt.split('\n');
            const lineHeight = 24; // Approximate line height
            let currentY = 0;
            for (let i = 0; i < promptLines.length; i++) {
                // Wrap each line if it's too wide
                const wrappedLines = wrapText(promptWindow, promptLines[i], Graphics.boxWidth - 40);
                for (let j = 0; j < wrappedLines.length; j++) {
                    promptWindow.drawText(wrappedLines[j], 0, currentY, Graphics.boxWidth, "center");
                    currentY += lineHeight;
                }
            }

            // Create response windows in a 2x2 grid
            const responseWindows = [];
            const windowWidth = (Graphics.boxWidth / 2) - 10;
            const windowHeight = 70;
            const startY = 90;

            // Create 4 response windows
            for (let i = 0; i < pollResponses.length; i++) {
                const x = (i % 2) * (windowWidth + 20);
                const y = startY + Math.floor(i / 2) * (windowHeight + 10);

                const win = new Window_Base(new Rectangle(x, y, windowWidth, windowHeight));
                win.opacity = 160;
                win.contents.fontSize = 18;

                // Draw response text
                // Set text color based on response color
                win.changeTextColor(pollResponses[i].color);

                // Process response text for \n and \t
                let processedAnswer = pollResponses[i].answer.replace(/\\t/g, '    ').replace(/\\n/g, '\n');
                const answerLines = processedAnswer.split('\n');
                let currentAnswerY = 0;
                for (let j = 0; j < answerLines.length; j++) {
                    // Wrap each line if it's too wide
                    const wrappedLines = wrapText(win, answerLines[j], windowWidth - 40);
                    for (let k = 0; k < wrappedLines.length; k++) {
                        win.drawText(wrappedLines[k], 0, currentAnswerY, windowWidth, "center");
                        currentAnswerY += lineHeight;
                    }
                }

                win.changeTextColor("#ffffff");

                responseWindows.push(win);
            }

            // Add all windows to the scene and _customHud
            SceneManager._scene.addChild(promptWindow);
            window._customHud.push(promptWindow);

            responseWindows.forEach(win => {
                SceneManager._scene.addChild(win);
                window._customHud.push(win);
            });

            // Show the timer if it's running (start from the correct remaining time)
            if (window.pollAutoFinishTimer && window.pollTimerStartTime && window.pollTimerDuration) {
                // Calculate remaining time based on when the timer was started
                const elapsed = (Date.now() - window.pollTimerStartTime) / 1000;
                const remaining = Math.max(0, window.pollTimerDuration - elapsed);

                if (remaining > 0) {
                    // Create and show the timer display
                    createCustomTimerDisplay();
                    customPollTimerSeconds = Math.ceil(remaining);
                    updateCustomTimerDisplay();

                    // Start the countdown from the remaining time
                    if (customPollTimer) {
                        clearInterval(customPollTimer);
                    }
                    customPollTimer = setInterval(() => {
                        customPollTimerSeconds--;
                        updateCustomTimerDisplay();

                        if (customPollTimerSeconds <= 0) {
                            stopCustomTimer();
                        }
                    }, 1000);
                }
            }
        });

        PluginManager.registerCommand(pluginName, "ShowPollResults", () => {
            // Clear any old HUDs
            if (!window._customHud) window._customHud = [];
            window._customHud.forEach(w => {
                if (SceneManager._scene && SceneManager._scene.removeChild) {
                    SceneManager._scene.removeChild(w);
                }
            });
            window._customHud = [];

            // Get the most chosen response (majority)
            const majorityIndex = $gameVariables.value(POLL_MAJORITY) - 1;
            const majorityResponse = pollResponses[majorityIndex];

            // Get the correct answer if there is one
            const correctIndex = $gameVariables.value(POLL_CORRECT) - 1;
            const correctResponse = correctIndex >= 0 ? pollResponses[correctIndex] : null;

            // Get poll percentage
            const pollPercentage = $gameVariables.value(POLL_PERCENT);

            let displayResponse = null;
            let displayText = "";

            if (correctResponse) {
                // If there's a correct answer, show only the correct response with percentage
                displayResponse = correctResponse;
                displayText = correctResponse.answer + " (" + pollPercentage + "%)";
            } else if (majorityResponse) {
                // If no correct answer, show only the majority response with percentage
                displayResponse = majorityResponse;
                displayText = majorityResponse.answer + " (" + pollPercentage + "%)";
            }

            // Use a fixed width that's comfortable for most results
            const padding = 60;
            const windowWidth = Graphics.boxWidth * 0.6;
            const lineHeight = 24;

            // Create temporary window to calculate wrapped lines
            const tempWindow = new Window_Base(new Rectangle(0, 0, windowWidth, 100));
            tempWindow.contents.fontSize = 20;

            // Calculate how many lines we'll need after wrapping
            let wrappedLines = [];
            if (displayResponse) {
                wrappedLines = wrapText(tempWindow, displayText, windowWidth - padding);
            }

            // Calculate window height based on number of lines
            const windowHeight = Math.max(90, (wrappedLines.length * lineHeight) + 50);
            const x = (Graphics.boxWidth - windowWidth) / 2;
            const y = (Graphics.boxHeight - windowHeight) / 2 + 50;

            // Clean up temporary window
            tempWindow.destroy();

            const resultsWindow = new Window_Base(new Rectangle(x, y, windowWidth, windowHeight));
            resultsWindow.opacity = 200;
            resultsWindow.contents.fontSize = 20;

            // Draw the wrapped response lines
            if (displayResponse && wrappedLines.length > 0) {
                resultsWindow.changeTextColor(displayResponse.color);
                let currentY = 15;
                for (let i = 0; i < wrappedLines.length; i++) {
                    resultsWindow.drawText(wrappedLines[i], 0, currentY, windowWidth, "center");
                    currentY += lineHeight;
                }
                resultsWindow.changeTextColor("#ffffff");
            }

            // Add window to scene and HUD
            SceneManager._scene.addChild(resultsWindow);
            window._customHud.push(resultsWindow);

            // Auto-remove the HUD after 5 seconds
            setTimeout(() => {
                if (resultsWindow.parent) {
                    resultsWindow.parent.removeChild(resultsWindow);
                }
                const hudIndex = window._customHud.indexOf(resultsWindow);
                if (hudIndex > -1) {
                    window._customHud.splice(hudIndex, 1);
                }
            }, 3000);
        });

    }

    // ============================================================================
    // INPUT EVENT HANDLERS
    // ============================================================================

    // Add keyboard event listeners for number keys 1-4
    document.addEventListener('keydown', (event) => {

        // Only process if socket exists and poll is running
        if (!socket || !$gameSwitches.value(POLL_RUNNING)) return;

        switch (event.key) {
            case '1':
                $gameVariables.setValue(POLL_MAJORITY, 1);                      //Majority Answer
                break;
            case '2':
                $gameVariables.setValue(POLL_MAJORITY, 2);                      //Majority Answer
                break;
            case '3':
                $gameVariables.setValue(POLL_MAJORITY, 3);                      //Majority Answer
                break;
            case '4':
                $gameVariables.setValue(POLL_MAJORITY, 4);                      //Majority Answer
                break;
            case '5':
                $gameVariables.setValue(POLL_MAJORITY, $gameVariables.value(POLL_CORRECT));
                break;
            default:
                return;
        }

        if ($gameVariables.value(POLL_MAJORITY) === $gameVariables.value(POLL_CORRECT)) {
            $gameVariables.setValue(POLL_PERCENT, 100); //For testing single player (always 70%)
        }

        $gameVariables.setValue(POLL_RESPONDERS, 1);       //Possible responses
        $gameVariables.setValue(POLL_RESPONSES, 1);    //Have responded

        // Ensure all timers are stopped before ending the poll
        ensureTimersStopped();

        $gameSwitches.setValue(POLL_RUNNING, false);
        $gameSwitches.setValue(POLL_FINISHED, true);

        if ($gameVariables.value(POLL_MAJORITY) === $gameVariables.value(POLL_CORRECT)) {
            $gameVariables.setValue(POLL_PERCENT, 100);
        }
        socket.emit('updatePoll', { status: false });
    });

    // Add a joystick event listener for xbox ABXY like the keyvoard above
    // Add gamepad event listener for ABXY buttons
    window.addEventListener("gamepadconnected", (e) => {
        const checkGamepad = () => {
            const gamepad = navigator.getGamepads()[e.gamepad.index];
            if (!gamepad) return;

            // Only process if socket exists and poll is running
            if (!socket || !$gameSwitches.value(POLL_RUNNING)) return;

            // Check ABXY buttons (indices 0,1,2,3 on standard gamepad mapping)
            if (gamepad.buttons[0].pressed) { // A button
                $gameVariables.setValue(POLL_MAJORITY, 1);
            } else if (gamepad.buttons[1].pressed) { // B button
                $gameVariables.setValue(POLL_MAJORITY, 2);
            } else if (gamepad.buttons[2].pressed) { // X button
                $gameVariables.setValue(POLL_MAJORITY, 3);
            } else if (gamepad.buttons[3].pressed) { // Y button
                $gameVariables.setValue(POLL_MAJORITY, 4);
            } else if (gamepad.buttons[8].pressed) { // Select button
                $gameVariables.setValue(POLL_MAJORITY, $gameVariables.value(POLL_CORRECT));
            }
            else {
                return;
            }

            if ($gameVariables.value(POLL_MAJORITY) === $gameVariables.value(POLL_CORRECT)) {
                $gameVariables.setValue(POLL_PERCENT, 100);
            }

            $gameVariables.setValue(POLL_RESPONDERS, 1);
            $gameVariables.setValue(POLL_RESPONSES, 1);

            // Ensure all timers are stopped before ending the poll
            ensureTimersStopped();

            $gameSwitches.setValue(POLL_RUNNING, false);
            $gameSwitches.setValue(POLL_FINISHED, true);

            if ($gameVariables.value(POLL_MAJORITY) === $gameVariables.value(POLL_CORRECT)) {
                $gameVariables.setValue(POLL_PERCENT, 100);
            }
            socket.emit('updatePoll', { status: false });
        };

        // Check gamepad input every frame
        const pollGamepad = () => {
            checkGamepad();
            requestAnimationFrame(pollGamepad);
        };
        pollGamepad();
    });

    // ============================================================================
    // GAME SYSTEM OVERRIDES
    // ============================================================================

    // Multiply all damage done by users by the percentage of responders that selected the correct answer
    const _Game_Action_executeDamage = Game_Action.prototype.executeDamage;

    Game_Action.prototype.executeDamage = function (target, value) {
        // if (this.isSkill() && this.subject().isActor()) {
        if (this.subject().isActor()) {
            const multiplier = ($gameVariables.value(POLL_PERCENT) || 1) / 100;

            if (multiplier !== 1) {
                // Modify the damage value before applying it to the target
                value = Math.floor(value * multiplier);
            }
        }
        // Call the original executeDamage method with the modified value
        _Game_Action_executeDamage.call(this, target, value);
    };

    Game_Actor.prototype.makeActionList = function () {
        const list = [];

        // Add all usable skills to the action list
        this.usableSkills().forEach((skill) => {
            const action = new Game_Action(this);
            action.setSkill(skill.id);
            list.push(action);
        });

        // Add all usable items to the action list
        $gameParty.items().forEach((item) => {
            const action = new Game_Action(this);
            action.setItem(item.id);

            // Check if the item can be used
            const canUse = $gameParty.canUse(item);

            if (canUse) {
                list.push(action);
            }
        });

        // Add the basic attack as a fallback
        const basicAttack = new Game_Action(this);
        basicAttack.setAttack();
        list.push(basicAttack);

        return list;
    };

    Game_Actor.prototype.makeAutoBattleActions = function () {
        // If the actor is dead, don't select any actions
        if (this.isDead()) {
            return;
        }

        this.clearActions();
        const actionList = this.makeActionList();
        let bestAction = null;
        let bestValue = -Infinity;

        // Check if any other actor is already planning to revive someone
        let isSomeoneReviving = false;
        $gameParty.members().forEach(member => {
            if (member._action && member._action.isItem()) {
                const target = member._action.targets()[0];
                if (target && target.isDead()) {
                    isSomeoneReviving = true;
                }
            }
        });

        // First, check if there are any dead party members
        const hasDeadMembers = $gameParty.members().some(member => member.isDead());

        // First pass: check for revival items
        if (hasDeadMembers && !isSomeoneReviving) {
            actionList.forEach((action) => {
                if (action.isItem()) {
                    const item = action.item();
                    if (!item) return;
                    // Check if item can target dead allies
                    if (item.scope === 9) { // One Ally (Dead)
                        // Find a dead party member
                        const deadMember = $gameParty.members().find(member => member.isDead());
                        if (deadMember) {
                            action.setTarget(deadMember.index());
                            bestAction = action;
                            bestValue = 2000;
                            return;
                        }
                    }
                }
            });
        }

        // If no revival action was selected, check for other items
        if (!bestAction) {
            actionList.forEach((action) => {
                let value = 0;

                if (action.isItem()) {
                    const item = action.item();
                    if (!item) return;

                    // Check for MP recovery when below 25% MP
                    if (this.mpRate() < 0.25) {
                        // Check if item can restore MP
                        let hasMpRecovery = false;
                        item.effects.forEach(effect => {
                            if (effect.code === 12) { // MP recovery
                                hasMpRecovery = true;
                            }
                        });

                        if (hasMpRecovery && (item.scope === 7 || item.scope === 11)) { // One Ally or One User
                            action.setTarget(this.index());
                            value = 1500; // Higher priority than HP healing
                        }
                    }
                    // Check for HP recovery when below 50% HP
                    else if (this.hpRate() < 0.5) {
                        let hasHpRecovery = false;
                        item.effects.forEach(effect => {
                            if (effect.code === 11) { // HP recovery
                                hasHpRecovery = true;
                            }
                        });

                        if (hasHpRecovery && (item.scope === 7 || item.scope === 11)) { // One Ally or One User
                            action.setTarget(this.index());
                            value = 1000;
                        }
                    }
                } else if (action.isSkill()) {
                    // For skills, use the default evaluation
                    value = action.evaluate();

                    // Force preference for Magic Feather Charge (skill ID 241)
                    if (action.item().id === 241) {
                        value += 500;
                    }

                    // If we're low on MP, reduce its value
                    if (this.mpRate() < 0.25) {
                        value = Math.floor(value * 0.5);
                    }
                } else if (action.isAttack()) {
                    // For basic attacks, give it a base value
                    value = Math.max(action.evaluate(), 300);
                }

                if (value > bestValue) {
                    bestAction = action;
                    bestValue = value;
                }
            });
        }

        if (bestAction) {
            this.setAction(0, bestAction);
        }
        console.log(`Auto-battle action for ${this.name()}: ${bestAction ? (bestAction.isAttack() ? "Attack" : bestAction.item() ? bestAction.item().name : bestAction.skill() ? bestAction.skill().name : "Unknown") : "None"}`);

    };

    // Override startPause to never pause during victory sequences
    const _Window_Message_startPause = Window_Message.prototype.startPause;
    Window_Message.prototype.startPause = function () {
        // Check if we're in a victory sequence
        if ($gameMessage._texts && $gameMessage._texts.length > 0) {
            const currentText = $gameMessage._texts[0];
            if (currentText && currentText.includes(TextManager.victory.format($gameParty.name()))) {
                // Don't pause during victory message - just skip the pause
                // The message system will continue to the next message automatically
                return;
            }
        }
        _Window_Message_startPause.call(this);
    };

    // ============================================================================
    // TITLE SCREEN MODIFICATIONS
    // ============================================================================

    // Override the continue command to load the found save file
    const _Scene_Title_commandContinue = Scene_Title.prototype.commandContinue;
    Scene_Title.prototype.commandContinue = function () {
        if (window.matchingSaveFileId > 0) {
            console.log(`Loading save file: ${window.matchingSaveFileId}`);
            this.fadeOutAll();
            DataManager.loadGame(window.matchingSaveFileId).then(() => {
                $gameSystem.onAfterLoad();
                SoundManager.playLoad();
                $gameSwitches.setValue(CONTINUE_SWITCH, true);
                this.fadeOutAll();
                this.reloadMapIfUpdated();
                SceneManager.goto(Scene_Map);
            }).catch(() => {
                SoundManager.playBuzzer();
                console.error('Failed to load save file');
            });
        } else {
            console.log('No matching save file to load');
            SoundManager.playBuzzer();
        }
    };

    // Override the continue button availability check
    const _Scene_Title_isContinueEnabled = Scene_Title.prototype.isContinueEnabled;
    Scene_Title.prototype.isContinueEnabled = function () {
        // Check if we have a matching save file for the current classId
        return window.matchingSaveFileId > 0;
    };

    // Add reloadMapIfUpdated method if it doesn't exist
    if (!Scene_Title.prototype.reloadMapIfUpdated) {
        Scene_Title.prototype.reloadMapIfUpdated = function () {
            if ($gameSystem.versionId() !== $dataSystem.versionId) {
                const mapId = $gameMap.mapId();
                const x = $gamePlayer.x;
                const y = $gamePlayer.y;
                const d = $gamePlayer.direction();
                $gamePlayer.reserveTransfer(mapId, x, y, d, 0);
                $gamePlayer.requestMapReload();
            }
        };
    }

    // ============================================================================
    // CLEANUP AND EVENT LISTENERS
    // ============================================================================

    // Clean up timer when page is unloaded
    window.addEventListener('beforeunload', () => {
        // Ensure all timers are stopped when page is unloaded
        ensureTimersStopped();
    });
})();