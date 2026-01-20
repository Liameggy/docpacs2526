/*:
 * @target MZ
 * @plugindesc Controls FormPix LED/sound server via plugin commands (fill, gradients, pixels, text, sounds).
 * @help
 * Controls a FormPix LED/sound server.
 * 1) Set plugin params: FormPix URL and API Key.
 * 2) Use plugin commands:
 *    - Fill: color, start, length.
 *    - Gradient: startColor, endColor, start, length.
 *    - SetPixel: location, color.
 *    - SetPixels: pixels JSON/CSV payload handled by server.
 *    - Say: text, text color, background color.
 *    - GetSounds: type/category.
 *    - PlaySound: sfx, optional bgm.
 * Notes: Colors accept hex (e.g., #ff00ff). Indices are 0-based.
 * 
 * @param FormPix URL
 * @text FormPix URL
 * @desc Base URL for the FormPix server.
 * @type text
 * @default http://localhost:3000
 * 
 * @param API Key
 * @text API Key
 * @desc API key sent in the API header.
 * @type text
 * @default
 * 
 * @command Fill
 * @text Fill Range
 * @desc Fill a range of LEDs.
 * @arg color
 * @text Color
 * @desc Hex color value (e.g., #ff00ff).
 * @type text
 * @default #ffffff
 * @arg start
 * @text Start Index
 * @desc Starting pixel index (0-based).
 * @type number
 * @min 0
 * @default 0
 * @arg length
 * @text Length
 * @desc How many pixels to fill.
 * @type number
 * @min 1
 * @default 1
 * 
 * @command Gradient
 * @text Gradient Range
 * @desc Apply a gradient over a range of LEDs.
 * @arg startColor
 * @text Start Color
 * @desc Hex start color (e.g., #00ff00).
 * @type text
 * @default #00ff00
 * @arg endColor
 * @text End Color
 * @desc Hex end color (e.g., #0000ff).
 * @type text
 * @default #0000ff
 * @arg start
 * @text Start Index
 * @desc Starting pixel index (0-based).
 * @type number
 * @min 0
 * @default 0
 * @arg length
 * @text Length
 * @desc How many pixels to span.
 * @type number
 * @min 1
 * @default 1
 * 
 * @command SetPixel
 * @text Set Pixel
 * @desc Set a single pixel color.
 * @arg location
 * @text Location
 * @desc Pixel index (0-based).
 * @type number
 * @min 0
 * @default 0
 * @arg color
 * @text Color
 * @desc Hex color value.
 * @type text
 * @default #ffffff
 * 
 * @command SetPixels
 * @text Set Pixels
 * @desc Set multiple pixels at once.
 * @arg pixels
 * @text Pixels JSON
 * @desc JSON array or CSV of pixel assignments expected by FormPix (e.g., [[0,"#ff0"],[1,"#0f0"]]).
 * @type text
 * @default []
 * 
 * @command Say
 * @text Say Text
 * @desc Render text to the display.
 * @arg text
 * @text Text
 * @desc Text to display.
 * @type text
 * @default Hello
 * @arg color
 * @text Text Color
 * @desc Hex text color.
 * @type text
 * @default #ffffff
 * @arg bgcolor
 * @text Background Color
 * @desc Hex background color.
 * @type text
 * @default #000000
 * 
 * @command GetSounds
 * @text Get Sounds
 * @desc Fetch list of sounds.
 * @arg type
 * @text Type
 * @desc Sound type/category.
 * @type text
 * @default
 * 
 * @command PlaySound
 * @text Play Sound
 * @desc Play a sound effect and optional background music.
 * @arg sfx
 * @text SFX
 * @desc Sound effect name.
 * @type text
 * @default
 * @arg bgm
 * @text BGM
 * @desc Background music name (optional).
 * @type text
 * @default
 */

(() => {
    const pluginName = "FormPix";

    const parameters = PluginManager.parameters(pluginName);
    const FORM_PIX_URL_PARAM = parameters['FormPix URL'] || 'http://localhost:421';
    const API_KEY_PARAM = parameters['API Key'] || '';

    let formPixUrl = FORM_PIX_URL_PARAM;
    let apiKey = API_KEY_PARAM;

    let reqOptions =
    {
        method: 'POST',
        headers: {
            'API': apiKey,
            'Content-Type': 'application/json'
        }
    };

    function login(url, key) {
        formPixUrl = url || formPixUrl;
        apiKey = key || apiKey;
        reqOptions =
        {
            method: 'POST',
            headers: {
                'API': apiKey,
                'Content-Type': 'application/json'
            }
        };
    }

    // Initialize connection settings immediately on load using plugin parameters
    login(FORM_PIX_URL_PARAM, API_KEY_PARAM);
    console.log(`FormPix plugin initialized: URL=${formPixUrl}, API Key set=${apiKey ? 'yes' : 'no'}`);


    function sendCommand(command, params, reqOptions) {
        fetch(`${formPixUrl}/api/${command}?${params}`, reqOptions)
            .then((response) => {
                // Convert received data to JSON
                return response.json();
            })
            .then((data) => {
                // Log the data if the request is successful
                console.log(`FormPix ${command} response:`, data);
            })
            .catch((err) => {
                // If there's a problem, handle it...
                if (err) console.log('connection closed due to errors:', err);
            });
    }

    function fill(color, start, length) {

        let params = new URLSearchParams({
            color: color,
            start: start,
            length: length
        }).toString()

        sendCommand('fill', params, reqOptions);
    }

    function gradient(startColor, endColor, start, length) {

        let params = new URLSearchParams({
            startColor: startColor,
            endColor: endColor,
            start: start,
            length: length
        }).toString()

        sendCommand('gradient', params, reqOptions);
    }

    function setPixel(location, color) {
        let params = new URLSearchParams({
            location: location,
            color: color
        }).toString()

        sendCommand('setPixel', params, reqOptions);
    }

    function setPixels(pixels) {
        let params = new URLSearchParams({
            pixels: pixels
        }).toString()

        sendCommand('setPixels', params, reqOptions);
    }

    function say(text, color, bgcolor) {

        let params = new URLSearchParams({
            text: text,
            textColor: color,
            backgroundColor: bgcolor
        }).toString()

        sendCommand('say', params, reqOptions);
    }

    function getSounds(type) {
        let getOptions =
        {
            method: 'GET',
            headers: {
                'API': apiKey,
                'Content-Type': 'application/json'
            }
        };

        let params = new URLSearchParams({
            type: type
        }).toString()

        sendCommand('say', params, getOptions);

    }

    function playSound(sfx, bgm) {
        let params = new URLSearchParams({
            sfx: sfx,
            bgm: bgm
        }).toString()

        sendCommand('playSound', params, reqOptions);
    }

    // =========================================================================
    // PLUGIN COMMANDS
    // =========================================================================

    PluginManager.registerCommand(pluginName, 'Fill', args => {
        fill(args.color || '#ffffff', Number(args.start || 0), Number(args.length || 1));
    });

    PluginManager.registerCommand(pluginName, 'Gradient', args => {
        gradient(args.startColor || '#00ff00', args.endColor || '#0000ff', Number(args.start || 0), Number(args.length || 1));
    });

    PluginManager.registerCommand(pluginName, 'SetPixel', args => {
        setPixel(Number(args.location || 0), args.color || '#ffffff');
    });

    PluginManager.registerCommand(pluginName, 'SetPixels', args => {
        // Accept JSON or CSV string as-is; server handles parsing format
        setPixels(args.pixels || '[]');
    });

    PluginManager.registerCommand(pluginName, 'Say', args => {
        say(args.text || '', args.color || '#ffffff', args.bgcolor || '#000000');
    });

    PluginManager.registerCommand(pluginName, 'GetSounds', args => {
        getSounds(args.type || '');
    });

    PluginManager.registerCommand(pluginName, 'PlaySound', args => {
        playSound(args.sfx || '', args.bgm || '');
    });

})();
