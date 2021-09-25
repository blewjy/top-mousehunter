const puppeteer = require("puppeteer");
const axios = require("axios");
const log = require("./logger.js");

const CAPTCHA_SOLVER_URL = "http://captcha";
const DATABASE_SERVICE_URL = "http://database";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function run() {
  log.info(`Doing a connection test to captcha solver...`);
  const response = (await axios.get(`${CAPTCHA_SOLVER_URL}/hello`)).data.ok;
  if (!response) {
    const e = new Error("Failed to connect to captcha solver!");
    e.name = "network";
    throw e;
  }
  log.info(`Successfully connected to captcha solver!`);

  const msToWait = getRandomInt(5000, 60000); // random time between 5 sec and 60 sec
  log.info(
    `Waiting for random amount of time first: ${msToWait / 1000} seconds`
  );
  await sleep(msToWait);

  log.info(`Starting hunt...`);
  const browser = await puppeteer.launch({
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ],
  });

  try {
    const page = await browser.newPage();
    log.info(`Going to website...`);
    await page.goto("https://www.mousehuntgame.com/login.php");

    const m = await page.$("div.maintenanceContainer");
    if (m != null) {
      log.info(`KNN MAINTENANCE...`);
      SUCCESS = false;
      const e = new Error("maintenance");
      e.name = "maintenance";
      throw e;
    }

    await sleep(2000);

    await (await page.$("div.signInText")).click();
    await page.$eval(
      "div.scrollingContainer.login input[name=username]",
      (el) => (el.value = "bryanlew_1659")
    );
    await page.$eval(
      "div.scrollingContainer.login input[name=password]",
      (el) => (el.value = "Brabra1659")
    );
    await page.$eval("div.scrollingContainer.login div.actionButton", (el) =>
      el.click()
    );

    log.info(`Logging in...`);
    await sleep(10000);
    log.info(`We're in!`);

    const dailyLoyaltyChest = await page.$("input.jsDialogClose.button");
    log.info(`Checking for Daily Loyalty Chest...`);
    if (dailyLoyaltyChest != null) {
      log.info(`Collected Daily Loyalty Chest!`);
      dailyLoyaltyChest.click();
    } else {
      log.info(`No chest found. Proceeding.`);
    }

    const cDiv = await page.$(
      "div.mousehuntPage-puzzle-form-captcha-image img"
    );
    log.info(`Checking for captcha...`);

    if (cDiv != null) {
      log.info(`FARK GOT CAPTCHA`);
      const url = await page.$eval(
        "div.mousehuntPage-puzzle-form-captcha-image img",
        (el) => el.src
      );
      log.info(`Catpcha url: ${url}`);

      let retries = 3;
      let gotError = true;

      while (gotError && retries > 0) {
        const text = (
          await axios.get(
            `${CAPTCHA_SOLVER_URL}?${new URLSearchParams({ url }).toString()}`
          )
        ).data;
        var c = text.replace(/\W/g, "");
        log.info(`Attempt ${4 - retries}: ${c}`);
        await page.$eval(
          "input.mousehuntPage-puzzle-form-code",
          (el, c) => (el.value = c),
          c
        );
        log.info(`Entering captcha...`);
        await sleep(2000);
        await page.screenshot({ path: "screenshot.png" });
        await page.$eval("input.mousehuntPage-puzzle-form-code-button", (el) =>
          el.click()
        );
        log.info(`Clicking button...`);
        await sleep(2000);
        const errorText = await page.$eval(
          "div.mousehuntPage-puzzle-form-code-error",
          (el) => el.innerHTML
        );
        gotError = errorText.includes("Incorrect claim code");
        log.info(`Got error? ${gotError}`);
        retries -= 1;
        log.info(`Retries left: ${retries}`);
      }

      if (gotError) {
        const e = new Error(`URL: ${url}`);
        e.name = "captcha";
        throw e;
      }
    }
    log.info(`Yay! No captcha!`);

    const isHornVisible = await page.$eval(
      "a.mousehuntHud-huntersHorn",
      (el) => el.getBoundingClientRect().height > 0
    );
    const huntTimerText = await page.$eval("#huntTimer", (el) => el.innerHTML);

    log.info(`Checking if horn is visible...`);

    if (isHornVisible || huntTimerText === "Ready!") {
      log.info(`Ready to hunt! Let's do it!`);
    } else {
      const e = new Error(`Not ready to hunt! Still got ${huntTimerText}...`);
      e.name = "notready";
      throw e;
    }

    log.info(`Hunting now!!`);
    await page.$eval("a.mousehuntHud-huntersHorn", (el) => el.click());

    await sleep(5000);

    const journalEntry = await page.$eval(
      "#journalEntries8180499 > div.active",
      (e) => {
        function getType(classList) {
          if (classList.includes("catchsuccessloot")) {
            if (classList.includes("luckycatchsuccess")) {
              return {
                success: true,
                attract: true,
                lucky: true,
                loot: true,
                stale: false,
                damage: false,
              };
            } else {
              return {
                success: true,
                attract: true,
                lucky: false,
                loot: true,
                stale: false,
                damage: false,
              };
            }
          } else if (classList.includes("catchsuccess")) {
            if (classList.includes("luckycatchsuccess")) {
              return {
                success: true,
                attract: true,
                lucky: true,
                loot: false,
                stale: false,
                damage: false,
              };
            } else {
              return {
                success: true,
                attract: true,
                lucky: false,
                loot: false,
                stale: false,
                damage: false,
              };
            }
          } else if (classList.includes("attractionfailure")) {
            return {
              success: false,
              attract: false,
              lucky: false,
              loot: false,
              stale: false,
              damage: false,
            };
          } else if (classList.includes("attractionfailurestale")) {
            return {
              success: false,
              attract: false,
              lucky: false,
              loot: false,
              stale: true,
              damage: false,
            };
          } else if (classList.includes("catchfailure")) {
            return {
              success: false,
              attract: true,
              lucky: false,
              loot: false,
              stale: false,
              damage: false,
            };
          } else if (classList.includes("catchfailuredamage")) {
            return {
              success: false,
              attract: true,
              lucky: false,
              loot: false,
              stale: false,
              damage: true,
            };
          } else {
            return "gg mofo";
          }
        }

        var t = getType(Array.from(e.classList));
        var [time, location] = e
          .querySelector("div.journaldate")
          .innerHTML.split(" - ");
        var mouse = "";
        var mouseloot = [];

        if (t.success) {
          var a_arr = Array.from(e.querySelectorAll("div.journaltext a")).map(
            (p) => p.innerHTML
          );
          mouse = a_arr[0];
          a_arr.shift();
          mouseloot = a_arr;
        } else {
          if (t.attract) {
            mouse = e.querySelector("div.journaltext a").innerHTML;
          }
        }

        var mousepoints = "";
        var mousegold = "";
        if (t.success) {
          var textarr = e.querySelector("div.journaltext").innerHTML.split(" ");
          mousepoints = textarr[textarr.indexOf("points") - 1];
          mousegold = textarr[textarr.indexOf("gold.") - 1];
        }

        function parseTime(time) {
          var period = time.split(" ")[1];
          var [hour, minute] = time
            .split(" ")[0]
            .split(":")
            .map((e) => parseInt(e));
          if (period === "pm" && hour != 12) {
            hour += 12;
          } else if (period == "am" && hour == 12) {
            hour = 0;
          }
          return [hour, minute];
        }

        var [hour, minute] = parseTime(time);
        var timestamp = new Date();
        timestamp.setHours(hour);
        timestamp.setMinutes(minute);

        var cheese = document.querySelector(
          "span.campPage-trap-baitName"
        ).innerHTML;
        var trap = document.getElementById(
          "campPage-trap-armedItem-floatingTooltip-weapon"
        ).innerHTML;
        var base = document.getElementById(
          "campPage-trap-armedItem-floatingTooltip-base"
        ).innerHTML;
        var charm = document.getElementById(
          "campPage-trap-armedItem-floatingTooltip-trinket"
        ).innerHTML;
        var power = document.querySelector(
          "div.campPage-trap-trapStat.power div.value span i"
        ).innerHTML;
        var type = document.querySelector(
          "div.campPage-trap-trapStat.power div.value span b"
        ).innerText;
        var luck = document.querySelector(
          "div.campPage-trap-trapStat.luck div.value span"
        ).innerHTML;
        var attraction = document.querySelector(
          "div.campPage-trap-trapStat.attraction_bonus div.value span"
        ).innerHTML;
        var cheese_effect = document.querySelector(
          "div.campPage-trap-trapStat.cheese_effect div.value span"
        ).innerHTML;

        return {
          timestamp: timestamp.getTime().toString(),
          location: location,
          success: t.success,
          attract: t.attract,
          lucky: t.lucky,
          loot: t.loot,
          stale: t.stale,
          damage: t.damage,
          cheese: cheese,
          trap: trap,
          base: base,
          charm: charm,
          power: power,
          type: type,
          luck: luck,
          attraction: attraction,
          cheese_effect: cheese_effect,
          mouse_name: mouse,
          mouse_points: mousepoints,
          mouse_gold: mousegold,
          mouse_loot: mouseloot.join(","),
        };
      }
    );

    log.info(`Hunt complete! Hunt details: ${JSON.stringify(journalEntry)}`);

    log.info("Sending hunt details to db service...");

    const response = (await axios.post(`${DATABASE_SERVICE_URL}/mice`, journalEntry))
      .data;
    log.info(`Done! Response from db service: ${JSON.stringify(response)}`);

  } catch (err) {
    log.info(`Oh no... We got an error`);
    log.error(`${err}`);
  } finally {
    log.info(`Closing browser and exiting...`);
    browser.close();
  }
}

module.exports = run;
