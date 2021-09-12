const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')
const run = require('./bot.js');

async function execute() {
  console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Starting bot.js....`);
  await run();
  console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Execution complete!`);
  console.log();
}

const scheduler = new ToadScheduler()
const task = new Task('Bot', execute);
const job = new SimpleIntervalJob({ minutes: 17, runImmediately: true }, task)
scheduler.addSimpleIntervalJob(job)