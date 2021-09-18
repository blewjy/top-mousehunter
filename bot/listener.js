// Require the framework and instantiate it
const fastify = require("fastify")();
const run = require("./bot.js");
const log = require("./logger.js");

fastify.get("/version", async (request, reply) => {
  log.info("GET /version");
  return { version: "1.0" };
});

fastify.get("/hello", async (request, reply) => {
  log.info("GET /hello");
  return { ok: true };
});

fastify.post("/run", async (request, reply) => {
  log.info("Starting bot...");
  run().then(() => {
    log.info("Execution complete!");
  });
  return { success: true };
});

// Run the server!
const start = async () => {
  try {
    log.info("Setting up fastify server...");
    await fastify.listen(80, "0.0.0.0");
    log.info("Up and running on port 80!");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
