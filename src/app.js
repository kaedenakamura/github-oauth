"use strict";

const { Hono } = require("hono");
const { logger } = require("hono/logger");
const { html } = require("hono/html");
const { HTTPException } = require("hono/http-exception");
const { secureHeaders } = require("hono/secure-headers");
const { env } = require("hono/adapter");
const { serve } = require("@hono/node-server");
const { serveStatic } = require("@hono/node-server/serve-static");
const { trimTrailingSlash } = require("hono/trailing-slash");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const photosRouter = require("./routes/photos");

const app = new Hono();

app.use(logger());
app.use(serveStatic({ root: "./public" }));
app.use(secureHeaders());
app.use(trimTrailingSlash());

app.route("/", indexRouter);
app.route("/users", usersRouter);
app.route("/photos", photosRouter);

app.notFound((c) => {
  return c.html(
    html`
      <!doctype html>
      <html>
        <head>
          <title>Not Found</title>
        </head>
        <body>
          <h1>Not Found</h1>
          <p>${c.req.url} の内容が見つかりませんでした。</p>
        </body>
      </html>
    `,
    404,
  );
});

app.onError((error, c) => {
  const statusCode = error instanceof HTTPException ? error.status : 500;
  const { NODE_ENV } = env(c);
  return c.html(
    html`
      <!doctype html>
      <html>
        <head>
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <h2>${error.name} (${statusCode})</h2>
          <p>${error.message}</p>
          ${NODE_ENV === "development" ? html`<pre>${error.stack}</pre>` : ""}
        </body>
      </html>
    `,
    statusCode,
  );
});

const port = 3000;
console.log(`Server running at http://localhost:${port}/`);
serve({
  fetch: app.fetch,
  port,
});
