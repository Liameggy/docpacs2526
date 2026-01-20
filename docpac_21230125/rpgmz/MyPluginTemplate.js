/*:
 * @target MZ
 * @plugindesc v1.0 Example plugin template showing parameters and commands (MZ)
 * @author YourName
 *
 * @help
 * This plugin demonstrates:
 *  - Plugin parameters
 *  - Plugin commands
 *  - Reading parameters
 *  - Using command arguments
 *
 * No plugin dependencies.
 *
 * ------------------------------------------
 * PARAMETERS
 * ------------------------------------------
 *
 * @param greetingText
 * @text Greeting Text
 * @type string
 * @default Hello from the plugin!
 * @desc Default text used by the plugin.
 *
 * @param startingGold
 * @text Starting Gold Bonus
 * @type number
 * @default 100
 * @min 0
 * @desc Gold added when the command is used.
 *
 * @param enableDebug
 * @text Enable Debug Logs
 * @type boolean
 * @default true
 * @desc If true, logs info to the console.
 *
 * ------------------------------------------
 * COMMANDS
 * ------------------------------------------
 *
 * @command showGreeting
 * @text Show Greeting
 * @desc Displays the greeting text in a message window.
 *
 * @arg overrideText
 * @text Override Text
 * @type string
 * @default
 * @desc Optional text to override the greeting parameter.
 *
 * ------------------------------------------
 *
 * @command giveGold
 * @text Give Gold
 * @desc Gives the party gold based on parameters and arguments.
 *
 * @arg amount
 * @text Extra Gold
 * @type number
 * @default 0
 * @min 0
 * @desc Additional gold to give on top of the parameter.
 */

(() => {
    const PLUGIN_NAME = "MyPluginTemplate";

    // ------------------------------------------
    // Read plugin parameters
    // ------------------------------------------

    const params = PluginManager.parameters(PLUGIN_NAME);

    const greetingText = String(params.greetingText || "Hello!");
    const startingGold = Number(params.startingGold || 0);
    const enableDebug  = params.enableDebug === "true";

    function debugLog(...args) {
        if (enableDebug) {
            console.log(`[${PLUGIN_NAME}]`, ...args);
        }
    }

    debugLog("Plugin loaded");
    debugLog("Parameters:", {
        greetingText,
        startingGold,
        enableDebug
    });

    // ------------------------------------------
    // Plugin Command: showGreeting
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "showGreeting", args => {
        const overrideText = String(args.overrideText || "").trim();

        const textToShow = overrideText.length > 0
            ? overrideText
            : greetingText;

        debugLog("showGreeting called:", textToShow);

        // Show a message in-game
        $gameMessage.add(textToShow);
    });

    // ------------------------------------------
    // Plugin Command: giveGold
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "giveGold", args => {
        const extraGold = Number(args.amount || 0);
        const totalGold = startingGold + extraGold;

        debugLog("giveGold called:", {
            startingGold,
            extraGold,
            totalGold
        });

        if (totalGold > 0) {
            $gameParty.gainGold(totalGold);
            $gameMessage.add(`You received ${totalGold} gold!`);
        } else {
            $gameMessage.add("No gold was given.");
        }
    });

})();
