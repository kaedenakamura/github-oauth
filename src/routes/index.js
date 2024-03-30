const { Hono } = require("hono");
const { html } = require("hono/html");

const app = new Hono();

app.get("/", (c) => {
  return c.html(html`
    <!doctype html>
    <html>
      <body>
        <div>
          <h1>Hello Hono!</h1>
        </div>
      </body>
    </html>
  `);
});

module.exports = app;
