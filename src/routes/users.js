const { Hono } = require("hono");
const { html } = require("hono/html");
const layout = require("../layout");
const { ensureAuthenticated } = require('../middlewares');

const app = new Hono();

app.use(ensureAuthenticated());

app.get("/", (c) => {
  return c.html(
    layout("Users", html`
      <h1>Users</h1>
      <p>ここにユーザー情報を表示できます。</p>
    `)
  );
});

module.exports = app;
