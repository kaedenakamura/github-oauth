const {Hono} = require("hono");
const os =require("node:os");

const app =new Hono();

app.get("/",(c) => {
  return c.json({
    loadavg:os.loadavg(),
  });
});

module.exports=app;

