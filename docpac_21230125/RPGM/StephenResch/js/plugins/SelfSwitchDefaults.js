//=============================================================================
/*:
 * @target MZ
 * @plugindesc Self Switch Defaults v0.2.0 - Allows you to set self switches "ON" by default.
 * @author Ian Caisley and Caleb Gray
 * @url https://iancaisley.itch.io/self-switch-defaults-plugin-for-rpg-maker-mz
 * @help
 * ====================
 * Self Switch Defaults
 * ====================
 *
 * Allows you to set self switches on your events to "ON" by default using note 
 * tags. Normally all self switches default to off. This is especially useful 
 * for creating single page self-destructing events.
 * 
 * The state of self switches persist through saving and loading between maps.
 * 
 * ---
 * 
 * NEW in v0.2.0: Plugin Command - Set Event Self Switch
 * This new plugin command sets self switches on any event on any map.
 * 
 * BETA: This feature is in beta. Please post any bugs found as comments
 * on the Itch page for the plugin:
 * https://iancaisley.itch.io/self-switch-defaults-plugin-for-rpg-maker-mz
 * 
 * ---
 * 
 * =-=-=-=- SETUP -=-=-=-=
 * Set the single parameter to a number higher than the highest variable 
 * number you are likely to use (default is 900). Create variables in your
 * project up to that number, and beyond it by the number of maps you have.
 * If you don't know how many you will have, give yourself a nice cushion.
 * For example, if you leave the default 900 and have 30 maps, create
 * variables in your project up to at least 930.
 * 
 * It's recommend to start your range on an even hundred, like 100, 200, 
 * 300, etc. This will make the variable numbers match with your map IDs.
 * For example, if you started at 100, map 1 would be stored in variable
 * 101. This makes it simpler to track in debugging.
 * 
 * =-=-=-=- USAGE -=-=-=-=
 * Add any combination of the self switch letters — a,b,c,d — inside square 
 * brackets as a note tag. For example, the note tag [a] will turn self
 * switch A on by default, [ad] will turn self switches A and D on, etc.
 * The note tag letters are case-insensitive.
 * 
 * =-=-=-=- IMPORTANT -=-=-=-=
 * This plugin stores the state of self switches in variables in your project, 
 * one per map, defaulting to 900+mapID. These variables must exist in your 
 * project and be unused by anything else. You must have one variable per map
 * in your project. For example, if you have 30 maps in your project and the
 * variables start at 900, you must have variables 900-930 created in your 
 * project and unused by anything else. To avoid issues down the line, set 
 * the start range to a really high number that you won't need in the rest
 * of your project and make enough variables past that to account for 
 * additional maps being added.
 * 
 * =-=-=-=- LIMITATIONS -=-=-=-=
 * Because the plugin stores the state of self switches in variables based on
 * map IDs, deleting maps from your project will break any old save files.
 * Starting a new game will be unaffected, but old saves will be broken.
 * If you need to remove a map in a live game, it is recommended that you leave
 * the map in your project and simply remove access to it. This will prevent
 * bugged save files.
 * 
 * You will also bug old save files if you change the variable start range
 * after starting to use this plugin. When in doubt, set your start range
 * to something really high that you won't possibly get to.
 * 
 * The variables used by this plugin will not have names displayed in the
 * in-game debugger, unless you give them some manually. The name isn't
 * necessary for the plugin to work, so this is purely aesthetic.
 * 
 * =-=-=-=- USAGE EXAMPLES -=-=-=-=
 * 
 * HOW TO: SELF DESTRUCTING EVENT
 * 1. Create your event.
 * 2. Set its note tag to [a].
 * 3. Set a page condition of self-switch A.
 * 4. At the end of its actions, turn self-switch A off.
 * 5. The event disappears and disables itself without a second page!
 * 
 * HOW TO: IDENTICAL EVENTS WITH DIFFERENT INITIAL STATES
 * 1. Create your event.
 * 2. Set up two pages with different visuals/actions.
 * 3. Set the self switch condition to A on page 1, and B on page 2.
 * 4. Set the note tag for your event to [a].
 * 4. Close the event and copy and paste it so you have two of them.
 * 5. Open the duplicate, and set the note tag to [b].
 * 6. These events (which are exactly the same), start differently!
 * 
 * =-=-=-=- PLUGIN COMMAND REFERENCE (NEW in v0.2.0) -=-=-=-=
 * The included plugin command "Set Event Self Switch" is in beta release.
 * If you run into any bugs with it, please leave a comment on the this
 * plugin's Itch page: 
 * https://iancaisley.itch.io/self-switch-defaults-plugin-for-rpg-maker-mz
 * 
 * This command sets self switch values on any event on any map. To use:
 * 1. Event ID: The event number you want to change self switches on.
 * 2. Map ID: The map number the event is on.
 * 3. Switch Letters: The switches you want to change. You can type
 *    any combination of "abcd". No spaces or quotes, case-insensitive.
 * 4. Switch Value: Set to 0 or 1. Turns the switches typed in "Switch 
 *    Letters" ON (1), or OFF (0).
 * 
 * =-=-=-=- DISCLAIMER/LICENSE -=-=-=-=
 * This plugin will not receive further development or support! It is provided 
 * as is. You are free to extend this plugin yourself and use it in your 
 * commercial and non-commercial projects. If you use it, please credit Ian 
 * Caisley and Caleb Gray along with the name of the plugin (Self Switch 
 * Defaults).
 * 
 * @param storedSwitchMin
 * @text Stored Switches Start Range
 * @desc Self switch states will be stored in variables starting with this number + the map idea the event is from.
 * @default 900
 * @type number
 * @min 1
 * 
 * @command setEventSelfSwitch
 * @text Set Event Self Switch
 * @desc Sets self switch on any event
 *
 * @arg eventId
 * @min 1
 * @default 1
 * @text Event ID
 * @desc The ID of the event to set the switch(s) on.
 * 
 * @arg mapId
 * @min 0
 * @default 0
 * @text Map ID
 * @desc The map ID where the event is located. 0 = current.
 *
 * @arg switchLetter
 * @default a
 * @text Self Switch
 * @desc The letter of the self switch to set. Can type multiple: "abcd".
 *
 * @arg switchValue
 * @min 0
 * @max 1
 * @default 1
 * @text Value
 * @desc Set switch(s) on ("1") or off ("0")
*/

//Plugin Commands
PluginManager.registerCommand("SelfSwitchDefaults", "setEventSelfSwitch", args => {
    setEventSelfSwitch(Object.values(args));  // Send an array of the setting values
});

setEventSelfSwitch = function(config) {
	// get variables
	let eventid = Number(config[0]);
	let mapid = Number(config[1]);
	mapid = mapid === 0 ? $gameMap.mapId() : mapid;
    let selfswitchvalue = Number(config[3]);
    selfswitchvalue = selfswitchvalue === 0 ? false : true;
    let selfswitches = config[2];
    selfswitchesresults = selfswitches.match(_setSelfSwitchRegex);
    if (selfswitchesresults?.length) {
        // If there are results, there are switches for us to process:
        let selfswitchesresult = selfswitchesresults[0];
        for (let selfswitchletter of selfswitchesresult.substring(0, selfswitchesresult.length)) {
            // We must delay a frame otherwise we break the game:
            setTimeout(() => {
                // Set the self-switch to value: 'A', 'B', 'C', 'D'
                $gameSelfSwitches.setValue([mapid, eventid, selfswitchletter.toUpperCase()], selfswitchvalue);
            }, 0);
        }
    }
}

const parameters = PluginManager.parameters('SelfSwitchDefaults');
const storedSwitchMin = Number(parameters['storedSwitchMin']);

// Reads the letters (case-insensitive) used to self-activate: [abcd]
const _selfSwitchRegex = /\[[a-dA-D]+\]/g;
const _setSelfSwitchRegex = /[a-dA-D]+/g;

// On map load, iterate through each event on the map:
const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    _Scene_Map_onMapLoaded.call(this);

    // Initialize once: (uses variables starting with the minimum set in plugin parameters)
    const mapId = $gameMap.mapId();
    if ($gameVariables.value(storedSwitchMin+mapId)) return;
    $gameVariables.setValue(storedSwitchMin+mapId, true);

    // Iterate event tiles:
    $gameMap.events().forEach(function(eventTile) {
        // Grab the inner event and its pages:
        const event = eventTile.event();

        // Check the event's note:
        if (event.note) {
            const selfSwitchResults = event.note.match(_selfSwitchRegex);
            if (selfSwitchResults?.length) {
                // If there are results, there are switches for us to process:
                const selfSwitchResult = selfSwitchResults[0];
                for (const selfSwitchLetter of selfSwitchResult.substring(1, selfSwitchResult.length - 1)) {
                    // We must delay a frame otherwise we break the game:
                    setTimeout(() => {
                        // Set the self-switch to true: 'A', 'B', 'C', 'D'
                        $gameSelfSwitches.setValue([mapId, eventTile._eventId, selfSwitchLetter.toUpperCase()], true);
                    }, 0);
                }
            }
        }
    });
}