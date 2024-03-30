const { Hono } = require("hono");

const app = new Hono();

app.get("/", (c) => {
  return c.text("respond with a resource");
});

module.exports = app;
