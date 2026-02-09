/*:
 * @target MZ
 * @plugindesc v1.0 Adds a blood moon event that revives defeated enemies. The event can be triggered via a plugin command, so it is very flexible. 
 * @author Stephen Resch
 *
 *
 * Plugin Dependencies: SelfSwitchDefaults by Ian Caisley and Caleb Gray
 *
 * ------------------------------------------
 * PARAMETERS
 * ------------------------------------------
 *
 * @param bloodMoon
 * @text Enable Blood Moon Event
 * @type boolean
 * @default false
 * @desc If true, enables the blood moon event command.
 * 
 *
 * 
 * ------------------------------------------
 * COMMANDS
 * ------------------------------------------
 *
 * 
 * @command bloodMoon
 * @text Trigger Blood Moon Event
 * @desc Triggers a blood moon event, reviving defeated enemies.
 */

(() => {
    const PLUGIN_NAME = "MyPluginTemplate";

    // ------------------------------------------
    // Read plugin parameters
    // ------------------------------------------

    const params = PluginManager.parameters(PLUGIN_NAME);

    const bloodMoon = params.bloodMoon === false ? false : true;

    debugLog("Plugin loaded");
    debugLog("Parameters:", {
        bloodMoon
    });



    //
    // Plugin Command: bloodMoon
    // When this command is called, it triggers a blood moon event in the game.
    // The blood moon event shows a cutscene with the text "The Blood Moon Rises!"
    // Once the cutscene is over, all previously defeated enemies are revived.
    // The enemy event will be reactivated via Self Switches
    // Once the command is ran, the bloodMoon state will revert to false, since it only happens once.
    //
    PluginManager.registerCommand(PLUGIN_NAME, "bloodMoon", () => {
        if (!bloodMoon) {
            debugLog("bloodMoon command called but blood moon event is disabled.");
            return;
        }

        debugLog("bloodMoon command called: Triggering blood moon event.");

        // Shows blood moon message to players (will become a cutscene later if I have spare time)
        $gameMessage.add("The Blood Moon Rises!");

        // Revives defeated enemies by calling a common event (ID 1), which sets the self switch for each enemy event to A and turns B off. This only affects map events that are named "Enemy"
        $gameMap.events().forEach(event => {
            if (event.event().name.startsWith("Enemy")) {
                // Check if the enemy is dead (self switch B is ON)
                const keyB = [$gameMap.mapId(), event.eventId(), 'B'];
                const isDead = $gameSelfSwitches.value(keyB);

                if (isDead) {
                    debugLog("Found dead enemy to revive: " + event.event().name);
                    // Revive the enemy
                    const keyA = [$gameMap.mapId(), event.eventId(), 'A'];
                    $gameSelfSwitches.setValue(keyA, true);
                    $gameSelfSwitches.setValue(keyB, false);
                    debugLog("Revived enemy ID: " + event.eventId());
                } else {
                    debugLog("Enemy already alive, skipping: " + event.event().name);
                }
            }
        });

        debugLog("All defeated enemies have been revived.");

        // Disables further blood moon events
        params.bloodMoon = false;
    });

})();