/*:
 * @target MZ
 * @plugindesc v1.0 Moral Alignment (MZ)
 * @author Dylan Anderson
 *
 * @help
 * This plugin integrates moral alignment systems.
 *
 * No plugin dependencies.
 *
 *
 * @param MoralAlignment
 * @text Moral Alignment
 * @type boolean
 * @default true
 * @desc If true, enables moral alignment features.
 *
 * @param enableDebug
 * @text Enable Debug Logs
 * @type boolean
 * @default true
 * @desc If true, logs info to the console.
 *
 *
 * @command MoralAlignmentCheck
 * @text Moral Alignment Check
 * @desc Checks and displays the party's moral alignment.
 *
 * @command SetAlignment
 * @text Set Moral Alignment
 * @desc Sets the party's moral alignment.
 *
 * @arg goodEvil
 * @text Good/Evil
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @desc Value from -100 (Evil) to 100 (Good). 0 is Neutral.
 *
 * @arg lawfulChaotic
 * @text Lawful/Chaotic
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @desc Value from -100 (Chaotic) to 100 (Lawful). 0 is Neutral.
 *
 * @command ShiftAlignment
 * @text Shift Moral Alignment
 * @desc Shifts the party's alignment by a certain amount.
 *
 * @arg goodEvil
 * @text Good/Evil Shift
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @desc Amount to shift Good/Evil by (negative = Evil, positive = Good).
 *
 * @arg lawfulChaotic
 * @text Lawful/Chaotic Shift
 * @type number
 * @min -100
 * @max 100
 * @default 0
 * @desc Amount to shift Lawful/Chaotic by (negative = Chaotic, positive = Lawful).
 *
 */

(() => {
    const PLUGIN_NAME = "MoralAlignment";

    // ------------------------------------------
    // Read plugin parameters
    // ------------------------------------------

    const params = PluginManager.parameters(PLUGIN_NAME);

    const moralAlignment = Boolean(params.MoralAlignment === "true");
    const enableDebug = Boolean(params.enableDebug === "true");
    function debugLog(...args) {
        if (enableDebug) {
            console.log(`[${PLUGIN_NAME}]`, ...args);
        }
    }

    debugLog("Plugin loaded");
    debugLog("Parameters:", {
        moralAlignment,
        enableDebug
    });

    // ------------------------------------------
    // Initialize Alignment System
    // ------------------------------------------

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        if (!$gameSystem._partyAlignment) {
            $gameSystem._partyAlignment = {
                goodEvil: 0,
                lawfulChaotic: 0
            };
        }
    };

    // ------------------------------------------
    // Helper Functions
    // ------------------------------------------

    function getAlignmentName(goodEvil, lawfulChaotic) {
        let moral = "Neutral";
        let ethical = "Neutral";

        // Determine Good/Neutral/Evil
        if (goodEvil >= 30) {
            moral = "Good";
        } else if (goodEvil <= -30) {
            moral = "Evil";
        }

        // Determine Lawful/Neutral/Chaotic
        if (lawfulChaotic >= 30) {
            ethical = "Lawful";
        } else if (lawfulChaotic <= -30) {
            ethical = "Chaotic";
        }

        // Return combined alignment (e.g., "Lawful Good", "Chaotic Evil", "Neutral")
        if (moral === "Neutral" && ethical === "Neutral") {
            return "True Neutral";
        }
        return ethical + " " + moral;
    }

    function getPartyAlignment() {
        if (!$gameSystem._partyAlignment) {
            $gameSystem._partyAlignment = {
                goodEvil: 0,
                lawfulChaotic: 0
            };
        }
        return $gameSystem._partyAlignment;
    }

    // ------------------------------------------
    // Plugin Command: MoralAlignmentCheck
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "MoralAlignmentCheck", () => {
        if (moralAlignment) {
            const alignment = getPartyAlignment();
            const alignmentName = getAlignmentName(alignment.goodEvil, alignment.lawfulChaotic);
            
            debugLog(`Party Alignment - Good/Evil: ${alignment.goodEvil}, Lawful/Chaotic: ${alignment.lawfulChaotic}`);
            debugLog(`Alignment Name: ${alignmentName}`);
            
            // Display message in-game
            $gameMessage.add(`Your party's moral alignment is: \\C[6]${alignmentName}\\C[0]`);
            $gameMessage.add(`Good/Evil: ${alignment.goodEvil} | Lawful/Chaotic: ${alignment.lawfulChaotic}`);
        } else {
            debugLog("Moral alignment feature is disabled.");
        }
    });

    // ------------------------------------------
    // Plugin Command: SetAlignment
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "SetAlignment", (args) => {
        if (moralAlignment) {
            const goodEvil = Number(args.goodEvil) || 0;
            const lawfulChaotic = Number(args.lawfulChaotic) || 0;
            
            const alignment = getPartyAlignment();
            alignment.goodEvil = Math.max(-100, Math.min(100, goodEvil));
            alignment.lawfulChaotic = Math.max(-100, Math.min(100, lawfulChaotic));
            
            const alignmentName = getAlignmentName(alignment.goodEvil, alignment.lawfulChaotic);
            debugLog(`Set party alignment to: ${alignmentName} (Good/Evil: ${alignment.goodEvil}, Lawful/Chaotic: ${alignment.lawfulChaotic})`);
        } else {
            debugLog("Moral alignment feature is disabled.");
        }
    });

    // ------------------------------------------
    // Plugin Command: ShiftAlignment
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "ShiftAlignment", (args) => {
        if (moralAlignment) {
            const goodEvilShift = Number(args.goodEvil) || 0;
            const lawfulChaoticShift = Number(args.lawfulChaotic) || 0;
            
            const alignment = getPartyAlignment();
            alignment.goodEvil = Math.max(-100, Math.min(100, alignment.goodEvil + goodEvilShift));
            alignment.lawfulChaotic = Math.max(-100, Math.min(100, alignment.lawfulChaotic + lawfulChaoticShift));
            
            const alignmentName = getAlignmentName(alignment.goodEvil, alignment.lawfulChaotic);
            debugLog(`Shifted alignment to: ${alignmentName} (Good/Evil: ${alignment.goodEvil}, Lawful/Chaotic: ${alignment.lawfulChaotic})`);
        } else {
            debugLog("Moral alignment feature is disabled.");
        }
    });

})();
