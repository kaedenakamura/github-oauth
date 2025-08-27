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
const { githubAuth } = require("@hono/oauth-providers/github");
const { getIronSession } = require("iron-session");
const layout = require('./layout');

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const photosRouter = require("./routes/photos");
const serverStatusRouter = require("./routes/server-status");
const app = new Hono();

// ミドルウェア
app.use(logger());
app.use(serveStatic({ root: "./public" }));
app.use(secureHeaders());
app.use(trimTrailingSlash());

// ルーター
app.route("/", indexRouter);
app.route("/users", usersRouter);
app.route("/photos", photosRouter);
app.route("/server-status",serverStatusRouter);

// セッション管理
app.use(async (c, next) => {
  const { SESSION_PASSWORD } = env(c);
  const session = await getIronSession(c.req.raw, c.res, {
    password: SESSION_PASSWORD,
    cookieName: 'session',
  });
  c.set('session', session);
  await next();
});

// GitHub OAuth 認証ミドルウェア
app.use('/auth/github', async (c, next) => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env(c);
  const authHandler = githubAuth({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    scope: ['user:email'],
    oauthApp: true,
  });
  return await authHandler(c, next).catch(() => c.redirect('/login'));
});

// GitHub 認証後処理
app.get('/auth/github', async (c) => {
  const session = c.get('session');
  const userGithub = c.get('user-github'); // GitHubユーザー情報
  if (session && userGithub) {
    session.user = userGithub;
    await session.save();
  }
  return c.redirect('/');
});

// ログインページ
app.get("/login", (c) => {
  return c.html(
    layout(
      "Login",
      html`
        <h1>Login</h1>
        <a href="/auth/github">GitHubでログイン</a>
      `,
    ),
  );
});

// ログアウト
app.get("/logout", async (c) => {
  const session = c.get("session");
  if (session) await session.destroy(); // await を追加
  return c.redirect("/");
});

// 404 Not Found
app.notFound((c) => {
  return c.html(
    layout(
      "NotFound",
      html`
        <h1>NotFound</h1>
        <p>${c.req.url}の内容が見つかりませんでした。</p>
      `,
    ),
    404,
  );
});

// エラーハンドリング
app.onError((error, c) => {
  const statusCode = error instanceof HTTPException ? error.status : 500;
  const { NODE_ENV } = env(c);
  return c.html(
    layout(
      "Error",
      html`
        <h1>Error</h1>
        <h2>${error.name} (${statusCode})</h2>
        <p>${error.message}</p>
        ${NODE_ENV === "development" ? html`<pre>${error.stack}</pre>` : ""}
      `,
    ),
    statusCode,
  );
});

// サーバー起動
const port = 3000;
console.log(`Server running at http://localhost:${port}/`);
const server =serve({
  fetch: app.fetch,
  port,
});

const os = require("node:os");
const {Server} = require("socket.io");
const io = new Server(server);

function emitServerStatus(socket) {
  socket.emit("server-status",{loadavg:os.loadavg()});
}

io.on("connection",(socket)=> {
  setInterval(emitServerStatus,10,socket);
  console.log("接続がありました”");
});

