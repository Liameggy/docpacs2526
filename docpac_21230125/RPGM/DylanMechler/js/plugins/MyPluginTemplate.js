/*:
 * @target MZ
 * @plugindesc v1.0 Creates a Time System, Day/Night System, and Weather System (MZ)
 * @author DylanMechler
 *
 * @help
 * Setup:
 *  - Create a switch with the name timePassing
 *  - Create a switch with the name outside
 *  - Create a switch with the name ongoingWeather
 *  - Create a variable with the name days
 *  - Create a variable with the name hours
 *  - Create a variable with the name minutes
 *  - Create a variable with the name timeIncrement
 *  - Create a common event called timeSystem with a parallel trigger and uses the timePassing switch
 *  - In the timeSystem common event add a command to wait for a specified amount of frames (360 frames suggested)
 *  - In the timeSystem common event call the plugin command Time System from this plugin
 *  - If you wish for the time of day to change call the plugin command Day/Night System from this plugin
 *  - If you wish for the weather to change call the plugin command Weather System from this plugin
 *  - BOTH Day/Night System AND Weather System REQUIRE the Time System
 *  - For each map that you would like time to pass on create a parallel event that sets the timePassing switch to ON
 *  - For each Outside Map create a parallel event that sets the outside switch to ON (Can be included in the timePassing parallel event)
 *  - For each Inside Map create a parallel event that sets the inside switch to OFF (Can be included in the timePassing parallel event)
 *  - To display time create a Show Text command, the text should be Day \V[days Variable ID], \V[hours Variable ID]:\V[minutes Variable ID]
 *  - WARNING! How often lightning occurs during a storm is currently tied to how often the timeIncrement variable increases
 *
 * No plugin dependencies.
 *
 * ------------------------------------------
 * PARAMETERS
 * ------------------------------------------
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
 * @command timeSystem
 * @text Time System
 * @desc Start the Time System.
 * 
 * @arg timePassingSwitchID
 * @text Time Passing Switch ID
 * @type number
 * @default 1
 * @min 1
 * @desc ID of the Time Passing Switch
 * 
 * @arg daysVariableID
 * @text Days Variable ID
 * @type number
 * @default 1
 * @min 1
 * @desc ID of the Days Variable
 * 
 * @arg hoursVariableID
 * @text Hours Variable ID
 * @type number
 * @default 2
 * @min 1
 * @desc ID of the Hours Variable
 * 
 * @arg minutesVariableID
 * @text Minutes Variable ID
 * @type number
 * @default 3
 * @min 1
 * @desc ID of the Minutes Variable
 * 
 * @arg timeIncrementVariableID
 * @text Time Increment Variable ID
 * @type number
 * @default 4
 * @min 1
 * @desc ID of the Time Increment Variable
 * 
 * ------------------------------------------
 * 
 * @command dayNightSystem
 * @text Day/Night System
 * @desc Start the Day/Night System.
 * 
 * @arg outsideSwitchID
 * @text Outside Switch ID
 * @type number
 * @default 2
 * @min 1
 * @desc ID of the Outside Switch
 * 
 * @arg timeIncrementVariableID
 * @text Time Increment Variable ID
 * @type number
 * @default 4
 * @min 1
 * @desc ID of the Time Increment Variable
 * 
 * ------------------------------------------
 * 
 * @command weatherSystem
 * @text Weather System
 * @desc Start the Weather System.
 * 
 * @arg outsideSwitchID
 * @text Outside Switch ID
 * @type number
 * @default 2
 * @min 1
 * @desc ID of the Outside Switch
 * 
 * @arg ongoingWeatherSwitchID
 * @text Ongoing Weather Switch ID
 * @type number
 * @default 3
 * @min 1
 * @desc ID of the Ongoing Weather Switch
 * 
 * @arg timeIncrementVariableID
 * @text Time Increment Variable ID
 * @type number
 * @default 4
 * @min 1
 * @desc ID of the Time Increment Variable
 */

(() => {
    const PLUGIN_NAME = "MyPluginTemplate";

    // ------------------------------------------
    // Read plugin parameters
    // ------------------------------------------

    const params = PluginManager.parameters(PLUGIN_NAME);

    const enableDebug = params.enableDebug === "true";
    var currentWeather = 0;
    var weatherStarted = false

    function debugLog(...args) {
        if (enableDebug) {
            console.log(`[${PLUGIN_NAME}]`, ...args);
        }
    }

    debugLog("Plugin loaded");
    debugLog("Parameters:", {
        enableDebug
    });

    // ------------------------------------------
    // Plugin Command: timeSystem
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "timeSystem", args => {
        const timePassing = $gameSwitches.value(Number(args.timePassingSwitchID))
        const days = Number(args.daysVariableID)
        const daysValue = $gameVariables.value(Number(args.daysVariableID))
        const hours = Number(args.hoursVariableID)
        const minutes = Number(args.minutesVariableID)
        const timeIncrement = Number(args.timeIncrementVariableID)
        const timeIncrementValue = $gameVariables.value(Number(args.timeIncrementVariableID))
        if (timePassing == true) {
            $gameVariables.setValue(timeIncrement, timeIncrementValue + 1)
            if (timeIncrementValue >= 240) {
                $gameVariables.setValue(days, daysValue + 1)
                $gameVariables.setValue(timeIncrement, 0)
            }
            $gameVariables.setValue(hours, timeIncrementValue / 10)
            $gameVariables.setValue(minutes, timeIncrementValue.mod(10))
        }
    });

    // ------------------------------------------
    // Plugin Command: dayNightSystem
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "dayNightSystem", args => {
        const outside = $gameSwitches.value(Number(args.outsideSwitchID))
        const timeIncrementValue = $gameVariables.value(Number(args.timeIncrementVariableID))
        if (outside == true) {
            if (timeIncrementValue < 60) {
                $gameScreen.startTint([50, 10, -34, 0], 60)
            } else if (timeIncrementValue < 120) {
                $gameScreen.startTint([0, 0, 0, 0], 60)
            } else if (timeIncrementValue < 180) {
                $gameScreen.startTint([68, -34, -34, 0], 60)
            } else if (timeIncrementValue <= 240) {
                $gameScreen.startTint([-68, -68, 0, 68], 60)
            }
        }
    });

    // ------------------------------------------
    // Plugin Command: weatherSystem
    // ------------------------------------------

    PluginManager.registerCommand(PLUGIN_NAME, "weatherSystem", args => {
        const outside = $gameSwitches.value(Number(args.outsideSwitchID))
        const ongoingWeather = Number(args.outsideSwitchID)
        const ongoingWeatherValue = $gameSwitches.value(Number(args.outsideSwitchID))
        const timeIncrementValue = $gameVariables.value(Number(args.timeIncrementVariableID))
        if (timeIncrementValue == 1 || timeIncrementValue == 60 || timeIncrementValue == 120 || timeIncrementValue == 180 || weatherStarted == false) {
            $gameSwitches.setValue(ongoingWeather, false)
            if (weatherStarted == false) {
                weatherStarted = true
            }
        } else {
            if (outside == true) {
                if (currentWeather == 0) {
                    $gameScreen.changeWeather('none', 5, 60)
                } else if (currentWeather == 1) {
                    $gameScreen.changeWeather('rain', 5, 60)
                } else if (currentWeather == 2) {
                    $gameScreen.startFlash([255, 255, 255, 170], 30)
                    $gameScreen.changeWeather('storm', 5, 60)
                } else if (currentWeather == 3) {
                    $gameScreen.changeWeather('snow', 5, 60)
                }
            }
        }
        if (ongoingWeatherValue == false) {
            let weather = Math.floor(Math.random() * 4)
            if (weather == 0) {
                if (outside == true) {
                    $gameScreen.changeWeather('none', 5, 60)
                }
                currentWeather = 0
                $gameSwitches.setValue(ongoingWeather, true)
            } else if (weather == 1) {
                if (outside == true) {
                    $gameScreen.changeWeather('rain', 5, 60)
                }
                currentWeather = 1
                $gameSwitches.setValue(ongoingWeather, true)
            } else if (weather == 2) {
                if (outside == true) {
                    $gameScreen.startFlash([255, 255, 255, 170], 30)
                    $gameScreen.changeWeather('storm', 5, 60)
                }
                currentWeather = 2
                $gameSwitches.setValue(ongoingWeather, true)
            } else if (weather == 3) {
                if (outside == true) {
                    $gameScreen.changeWeather('snow', 5, 60)
                }
                currentWeather = 3
                $gameSwitches.setValue(ongoingWeather, true)
            }
        }
    });

})();
