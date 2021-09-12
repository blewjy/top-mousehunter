const puppeteer = require("puppeteer");
const axios = require("axios");

const CAPTCHA_SOLVER_URL = "http://captcha"

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

async function run() {
    console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Doing a connection test to captcha solver...`);
    const response = (await axios.get(`${CAPTCHA_SOLVER_URL}/hello`)).data.ok;
    if (!response) {
        const e = new Error("Failed to connect to captcha solver!");
        e.name = "network";
        throw e;
    }
    console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Successfully connected to captcha solver!`);

    const msToWait = getRandomInt(5000, 60000); // random time between 5 sec and 60 sec
    console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Waiting for random amount of time first: ${msToWait / 1000} seconds`)
    await sleep(msToWait);

    console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Starting hunt...`);
    const browser = await puppeteer.launch({ 
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ] 
    });

    try {
        const page = await browser.newPage();
        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Going to website...`);
        await page.goto("https://www.mousehuntgame.com/login.php");

        const m = await page.$("div.maintenanceContainer");
        if (m != null) {
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] KNN MAINTENANCE...`);
            SUCCESS = false;
            const e = new Error("maintenance");
            e.name = "maintenance";
            throw e;
        }

        await sleep(2000);
        
        await (await page.$("div.signInText")).click();
        await page.$eval("div.scrollingContainer.login input[name=username]", (el) => (el.value = "bryanlew_1659"));
        await page.$eval("div.scrollingContainer.login input[name=password]", (el) => (el.value = "Brabra1659"));
        await page.$eval("div.scrollingContainer.login div.actionButton", (el) => el.click());

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Logging in...`);
        await sleep(10000);
        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] We're in!`);

        const dailyLoyaltyChest = await page.$("input.jsDialogClose.button");
        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Checking for Daily Loyalty Chest...`);
        if (dailyLoyaltyChest != null) {
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Collected Daily Loyalty Chest!`);
            dailyLoyaltyChest.click();
        } else {
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] No chest found. Proceeding.`);
        }

        const cDiv = await page.$("div.mousehuntPage-puzzle-form-captcha-image img");
        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Checking for captcha...`);

        if (cDiv != null) {
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] FARK GOT CAPTCHA`);
            const url = await page.$eval("div.mousehuntPage-puzzle-form-captcha-image img", (el) => el.src);
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Catpcha url: ${url}`);

            let retries = 3;
            let gotError = true;
            
            while (gotError && retries > 0) {
                const text = (await axios.get(`${CAPTCHA_SOLVER_URL}?${(new URLSearchParams({url})).toString()}`)).data;
                var c = text.replace(/\W/g, '');
                console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Attempt ${4-retries}: ${c}`);
                await page.$eval("input.mousehuntPage-puzzle-form-code", (el, c) => (el.value = c), c);
                console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Entering captcha...`);
                await sleep(2000);
                await page.screenshot({path: "screenshot.png"});
                await page.$eval("input.mousehuntPage-puzzle-form-code-button", (el) => el.click());
                console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Clicking button...`);
                await sleep(2000);
                const errorText = await page.$eval("div.mousehuntPage-puzzle-form-code-error", (el) => el.innerHTML);
                gotError = errorText.includes("Incorrect claim code"); 
                console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Got error? ${gotError}`);
                retries -= 1;
                console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Retries left: ${retries}`); 
            }
		    
            if (gotError) {
            const e = new Error(`URL: ${url}`);
            e.name = "captcha";
            throw e;
            }
        }
        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Yay! No captcha!`);

        const isHornVisible = await page.$eval("a.mousehuntHud-huntersHorn", (el) => el.getBoundingClientRect().height > 0);
        const huntTimerText = await page.$eval("#huntTimer", (el) => el.innerHTML);

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Checking if horn is visible...`);

        if (isHornVisible || huntTimerText === "Ready!") {
            console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Ready to hunt! Let's do it!`);
        } else {
            const e = new Error(`Not ready to hunt! Still got ${huntTimerText}...`);
            e.name = "notready";
            throw e;
        }

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Hunting now!!`);
        await page.$eval("a.mousehuntHud-huntersHorn", (el) => el.click());

        await sleep(5000);

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Hunt complete!`);

    } catch (err) {

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Oh no... We got an error`);
        console.error(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] ${err}`);
        if (err.name != "notready") {
            axios.post(`https://api.telegram.org/bot1740800853:AAH27qGmkzckFDLDe260qt9mx0cGVQ5-NU8/sendMessage?chat_id=422600598&text=${err}`);
        }

    } finally {

        console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Closing browser and exiting...`);
        browser.close();

    }
}

module.exports = run;