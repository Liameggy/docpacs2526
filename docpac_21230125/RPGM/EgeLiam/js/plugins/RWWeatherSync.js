/*:
* @target MZ
* @plugindesc v1.2 Syncs real world time + weather.gov forecast to in-game
* @author Liam Ege
*
* @help
* This Plugin is used for syncing real world time and weather.gov forecast with in-game time and weather.
*
* No plugin dependencies.
* ------------------------------------------
* PARAMETERS
* ------------------------------------------
*
* @param RWTimeSync
* @text Real World Time Sync Enabled
* @type boolean
* @default true
*
* @param RWWeatherSync
* @text Real World Weather Sync Enabled
* @type boolean
* @default true
*
* @param weatherUrl
* @text Weather.gov Forecast URL
* @type string
* @default https://api.weather.gov/gridpoints/CTP/112,24/forecast
*
* @param showWeatherMessage
* @text Show Weather Message
* @type boolean
* @default true
*
* @param applyScreenWeather
* @text Apply Screen Weather Effect
* @type boolean
* @default true
*
* @param weatherPower
* @text Weather Power (1-9)
* @type number
* @min 1
* @max 9
* @default 4
*
* @param weatherDuration
* @text Weather Transition Duration (frames)
* @type number
* @min 1
* @default 60
*
*
* ------------------------------------------
* COMMANDS
* ------------------------------------------
*
* @command RWTimeSync
* @text Real World Time Sync
* @desc Displays the current real world time and tints screen day/night.
*
* @arg enabled
* @text Enabled
* @type boolean
* @default true
*
* @command RWWeatherSync
* @text Real World Weather Sync
* @desc Fetches weather.gov forecast and syncs it to variable/message/optional screen weather.
*
* @arg enabled
* @text Enabled
* @type boolean
* @default true
*/

(() => {
  const PLUGIN_NAME = (document.currentScript?.src || "")
    .split("/")
    .pop()
    .replace(/\.js$/i, "") || "RW_TimeWeatherSync";

  const params = PluginManager.parameters(PLUGIN_NAME);

  const weatherUrl = String(params.weatherUrl || "https://api.weather.gov/gridpoints/CTP/112,24/forecast");

  const showWeatherMessage = params.showWeatherMessage === "true";
  const applyScreenWeather = true;
  const weatherPower = Number(params.weatherPower || 4);
  const weatherDuration = Number(params.weatherDuration || 60);

  function safeSetSpeaker(name) {
    if ($gameMessage && typeof $gameMessage.setSpeakerName === "function") {
      $gameMessage.setSpeakerName(name);
    }
  }

  function safeAddMessage(text) {
    if ($gameMessage && typeof $gameMessage.add === "function") {
      $gameMessage.add(text);
    }
  }

  function classifyForecast(shortText) {
    const t = (shortText || "").toLowerCase();

    if (t.includes("snow") || t.includes("sleet") || t.includes("flurr") || t.includes("blizzard")) {
      return {screenType: "snow" };
    }
    if (t.includes("thunder") || t.includes("t-storm") || t.includes("storm")) {
      return { screenType: "storm" };
    }
    if (t.includes("rain") || t.includes("shower") || t.includes("drizzle")) {
      return {screenType: "rain" };
    }
    if (t.includes("sunny") || t.includes("clear") || t.includes("fair")) {
      return {screenType: "none" };
    }
    // clouds/fog = neutral (no screen weather)
    if (t.includes("cloud") || t.includes("overcast") || t.includes("fog") || t.includes("haze")) {
      return {screenType: "none" };
    }
    return {screenType: "none" };
  }

  function fetchWeatherGov(url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open("GET", url);

      req.onload = () => {
        if (req.status < 200 || req.status >= 300) {
          reject(new Error(`HTTP ${req.status}`));
          return;
        }
        try {
          resolve(JSON.parse(req.responseText));
        } catch (e) {
          reject(e);
        }
      };

      req.onerror = () => reject(new Error("Network error"));
      req.send();
    });
  }

  // -----------------------------
  // COMMAND: RWTimeSync
  // -----------------------------
  PluginManager.registerCommand(PLUGIN_NAME, "RWTimeSync", args => {
    const enabled = String(args.enabled ?? "true") === "true";

    const now = new Date();
    const timeString = now.toLocaleTimeString();

    safeAddMessage(`Current Real World Time: ${timeString}`);

    const hour = now.getHours();
    if (hour >= 6 && hour < 18) {
      $gameScreen.startTint([20, 20, 20, 64], 60);
    } else {
      $gameScreen.startTint([0, 0, 64, 128], 60);
    }
  });

  // -----------------------------
  // COMMAND: RWWeatherSync
  // -----------------------------
  PluginManager.registerCommand(PLUGIN_NAME, "RWWeatherSync", async args => {
    const enabled = String(args.enabled ?? "true") === "true";


    const data = await fetchWeatherGov(weatherUrl);
    const p0 = data?.properties?.periods?.[0];
    if (!p0) throw new Error("Bad response: missing properties.periods[0]");

    const shortForecast = p0.shortForecast || "";
    const detailedForecast = p0.detailedForecast || "";
    const splitForecastFirst = detailedForecast.split(".")[1] || "";
    const splitForecastSecond = splitForecastFirst.split("in the")[0] || "";

    const { screenType } = classifyForecast(shortForecast);

    if (applyScreenWeather) {
      // "none" | "rain" | "storm" | "snow"
      $gameScreen.changeWeather(screenType, weatherPower, weatherDuration);
    }

    if (showWeatherMessage) {
      safeSetSpeaker("Weather Stone");
      safeAddMessage(
        `\\c[1]Right now in real life:\\c[3] ${shortForecast}\\c[0]\n${splitForecastSecond}`
      );
    }


  });
})();