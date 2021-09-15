// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const run = require('./bot.js');

fastify.get("/version", async (request, reply) => {
  return { version: "1.0" }
})

fastify.get("/hello", async (request, reply) => {
  return { ok: true }
})

fastify.post("/run", async (request, reply) => {
  console.log(request.body);
  console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Starting bot...`);
  run().then(() => {
    console.log(`[${(new Date()).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}] Execution complete!`);
  });
  return { success: true };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(80, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
