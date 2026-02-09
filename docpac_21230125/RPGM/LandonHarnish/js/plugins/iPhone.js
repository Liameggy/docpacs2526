/*:
 * @target MZ
 * @plugindesc v1.0 Adds a GTA-Style iPhone interface to the game.
 * @author ljharnish
 *
 * @help
 * Adds a GTA-Style iPhone interface to the game.
 *
 * @param iOSVersion
 * @text iOS Version
 * @type select
 * @option 18
 * @option 26
 * @default 26
 * @desc Select the iOS version style for the iPhone interface.
 *
 * @command iPhoneStatus
 * @text Enable iPhone
 * @desc Enables the GTA-Style iPhone interface.
 *
 * @arg enabled
 * @text Enable iPhone
 * @type boolean
 * @default true
 * @desc Enable or disable the GTA-Style iPhone interface.
 * 
 * @command iPhoneShown
 * @text Show or Hide iPhone
 * 
 * @arg shown
 * @text Show iPhone
 * @type boolean
 * @default true
 * @desc Show or Hide the GTA-Style iPhone interface.
 */

(() => {
    const PLUGIN_NAME = "iPhone";

    const params = PluginManager.parameters(PLUGIN_NAME);

    const iOSVersion = String(params["iOSVersion"] || "26");

    function debugLog(...args) {

        console.log(`[${PLUGIN_NAME}]`, ...args);
    }

    let iPhone_Enabled = true;
    let iPhone_Shown = false;

    PluginManager.registerCommand(PLUGIN_NAME, "iPhoneStatus", args => {
        const enabled = args.enabled === "true";
        iPhone_Enabled = enabled;

        debugLog("iPhoneStatus called:", enabled);

        const iPhone_Holder = document.getElementById("iPhone_Holder");
        if (iPhone_Holder) {
            iPhone_Holder.style.display = enabled ? "block" : "none";
            iPhone_Holder.style.pointerEvents = enabled ? "auto" : "none";
        }

        $gameMessage.add(`iPhone ${enabled ? "enabled" : "disabled"}.`);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "iPhoneShown", args => {
        const shown = args.shown === "true";
        iPhone_Shown = shown;

        debugLog("iPhoneShown called:", shown);

        const iPhone_Holder = document.getElementById("iPhone_Holder");
        if (iPhone_Holder) {
            iPhone_Holder.style.bottom = shown ? "10px" : `-${iPhone_Holder.offsetHeight + 20}px`;
        }

        $gameMessage.add(`iPhone ${shown ? "shown" : "hidden"}.`);
    });

    /* Set up iPhone interface here based on iOSVersion */
    const baseiPhoneDimensions = { width: 200, height: 400 };
    const baseScale = 0.33;

    const scaleFactor = 0.5;
    const aspectRatio = { width: 1, height: 2 };

    const setupiPhoneInterface = () => {
        debugLog(`Setting up iPhone interface for iOS version ${iOSVersion}`);
        
        // const url = `http://127.0.0.1:5500/RPG.html`
        const url = `http://ljharnish.github.io/projects/Mobile-OS-Replicas/iOS/iOS-${iOSVersion}/RPG.html`;

        const windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const iPhoneDimensions = {
            width: windowDimensions.width * scaleFactor / aspectRatio.height * aspectRatio.width,
            height: windowDimensions.width * scaleFactor
        };

        // Create iPhone Holder
        const iPhone_Holder = document.createElement("div");
        iPhone_Holder.id = "iPhone_Holder";
        iPhone_Holder.style.position = "fixed";
        iPhone_Holder.style.bottom = "-500px";
        iPhone_Holder.style.right = "10px";
        iPhone_Holder.style.zIndex = "1000";
        iPhone_Holder.style.boxSizing = "border-box";
        iPhone_Holder.style.transition = "bottom 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0s"
        iPhone_Holder.style.transform = "perspective(1000px) rotate3d(-0.5, 1, 0, -14deg)"
        iPhone_Holder.style.willChange = "transform";
        iPhone_Holder.style.isolation = "isolate";
        iPhone_Holder.style.transformStyle = "preserve-3d";
        iPhone_Holder.style.backfaceVisibility = "hidden";

        document.body.appendChild(iPhone_Holder);

        // Create iFrame
        const iPhone_iframe = document.createElement("iframe");
        iPhone_iframe.id = "iPhone_iframe";
        iPhone_iframe.src = url;
        iPhone_iframe.style.border = "none";
        iPhone_iframe.style.position = "absolute";
        iPhone_iframe.style.transformOrigin = "0 0";

        iPhone_Holder.appendChild(iPhone_iframe);

        // Create iPhone Border
        const iPhone_Border = document.createElement("img");
        iPhone_Border.id = "iPhone_Border";
        iPhone_Border.src = `https://ljharnish.github.io/projects/Mobile-OS-Replicas/iOS/iOS-26/sources/image/iphoneoverlay.png`;
        iPhone_Border.style.position = "absolute";
        iPhone_Border.style.top = "0";
        iPhone_Border.style.left = "0";
        iPhone_Border.style.width = "100%";
        iPhone_Border.style.pointerEvents = "none";

        iPhone_Holder.appendChild(iPhone_Border);
        
        setTimeout(() => { 
            set_iPhoneDimensions(iPhoneDimensions)
        }, 10);
    }

    const set_iPhoneDimensions = (iPhoneDimensions) => {
        const iPhone_Holder = document.getElementById("iPhone_Holder");
        if (iPhone_Holder) {
            iPhone_Holder.style.width = `${iPhoneDimensions.width}px`;
            iPhone_Holder.style.height = `${iPhoneDimensions.height}px`;
            iPhone_Holder.style.padding = `${iPhoneDimensions.width * 0.05}px`;

            // iFrame content size stays fixed at base dimensions (what worked at 816x624)
            const iframeContentWidth = baseiPhoneDimensions.width / baseScale - baseiPhoneDimensions.width * 0.35;
            const iframeContentHeight = baseiPhoneDimensions.height / baseScale - baseiPhoneDimensions.height * 0.125;
            
            // Scale adjusts based on current holder size relative to base size
            const currentScale = (iPhoneDimensions.width / baseiPhoneDimensions.width) * baseScale;

            const iPhone_iframe = document.getElementById("iPhone_iframe");
            iPhone_iframe.style.borderRadius = `${iPhoneDimensions.width * 0.1}px`;
            iPhone_iframe.style.top = `${iPhoneDimensions.width * 0.05}px`;
            iPhone_iframe.style.left = `${iPhoneDimensions.width * 0.06}px`;
            iPhone_iframe.style.width = `${iframeContentWidth}px`;
            iPhone_iframe.style.height = `${iframeContentHeight}px`;
            iPhone_iframe.style.transform = `scale(${currentScale})`;
        } else {
            debugLog("iPhone_Holder not found for resizing.");
        }
    }

    window.addEventListener("load", () => {
        debugLog("Window loaded, iPhone interface should be set up.");
        
        setupiPhoneInterface();

        window.addEventListener('resize', () => {

            const windowDimensions = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // Calculate dimensions based on width
            let phoneWidth = windowDimensions.width * scaleFactor / aspectRatio.height * aspectRatio.width;
            let phoneHeight = windowDimensions.width * scaleFactor;

            // Constrain to max 80% of window height
            const maxHeight = windowDimensions.height * 0.8;
            if (phoneHeight > maxHeight) {
                phoneHeight = maxHeight;
                phoneWidth = phoneHeight / aspectRatio.height * aspectRatio.width;
            }

            const iPhoneDimensions = {
                width: phoneWidth,
                height: phoneHeight
            };

            set_iPhoneDimensions(iPhoneDimensions);
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === "i" || event.key === "I") {
                iPhone_Shown = !iPhone_Shown;

                const iPhone_Holder = document.getElementById("iPhone_Holder");
                const iPhone_iframe = document.getElementById("iPhone_iframe") || null;

                if (iPhone_Holder) {
                    iPhone_Holder.style.bottom = iPhone_Shown ? "10px" : `-${iPhone_Holder.offsetHeight + 20}px`;
                }
                debugLog(`iPhone ${iPhone_Shown ? "shown" : "hidden"} via keyboard toggle.`);

                if (iPhone_iframe) {
                    iPhone_iframe.contentWindow.setLockPhone(!iPhone_Shown);
                }
                return;
            }
        });

        // Listen for postMessage from the phone iframe
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'SyncVariables') {
                const variables = e.data.variables || {};
                console.log('Received variables from iPhone iframe:', variables);
                windowVariables = { ...variables };
            } else if(
                e.data && e.data.type === 'CustomEvent'
            ) {
                const eventName = e.data.variables.event;
                console.log(`Received custom event from iPhone iframe:`);
                
                if(eventName == 'moveCharacter') {
                    const direction = e.data.variables.direction;
                    switch(direction) {
                        case 'up':
                            $gamePlayer.moveStraight(8);
                            break;
                        case 'down':
                            $gamePlayer.moveStraight(2);
                            break;
                        case 'left':
                            $gamePlayer.moveStraight(4);
                            break;
                        case 'right':
                            $gamePlayer.moveStraight(6);
                            break;
                    }
                }
            } else if(
                e.data && e.data.type === 'Alert'
            ) {
                const textToShow = e.data.message || '';
                $gameMessage.add(textToShow);
            }
        });

        const _DataManager_createGameObjects = DataManager.createGameObjects;
        DataManager.createGameObjects = function() {
            _DataManager_createGameObjects.call(this);
            this.initializeMyCustomStuff();
        };
        
        const _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _DataManager_extractSaveContents.call(this, contents);
            this.initializeMyCustomStuff();
        };
        
        DataManager.initializeMyCustomStuff = function() {
            // $gameActors is ready here
            const actor = $gameActors.actor(1);
            const iPhone_iframe = document.getElementById("iPhone_iframe");
            
            if (iPhone_iframe) {
                iPhone_iframe.addEventListener('load', () => {
                    iPhone_iframe.contentWindow.updatePlayerVariables($gameActors._data[1]);
                });
            }
        };

        let windowVariables = {};
    });
})();