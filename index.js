const Express = require("express");
// const config = '../../config/config'
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const keys = require("./config/keys");
const config = require("./config/dev");
const Pusher = require("pusher");
const Record = require("./mongoDB/model/Record");
const Timer = require("./mongoDB/model/Timer");
const controller = require("./controller");
const moment = require("moment");
const mongoose = require("mongoose");
// const system = require("./services/system");

var https = require("https");
https.globalAgent.keepAlive = true;
https.globalAgent.maxSockets = 5000;

var http = require("http");
http.globalAgent.keepAlive = true;
http.globalAgent.maxSockets = 5000;

mongoose.Promise = require("bluebird");

//connect db
mongoose.connect(
  config.mongoURI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    poolSize: 500,
  },
  function (err) {
    if (err) {
      console.log(err, "Database disconnected");
      return;
    }
    console.log("Database connected successfully");
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));

const app = new Express();

app.use(bodyParser.json({ limit: "10mb", extended: true })); //限制请求大小
app.use(
  bodyParser.urlencoded({
    // 支持 URL-encoded bodies
    extended: true,
  })
);

//处理相关请求错误，不符合规范的请求格式，统一返回400错误
app.use(function (err, req, res, next) {
  if (err.message == "request entity too large") {
    res.status(413).send({
      code: 1,
      message: `Request data was too large . Expected size was ${err.length} but limit size was ${err.limit}`,
    });
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    res.status(400).send({ code: 1, message: "bad request" });
  } else next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cookieParser("express_react_cookie"));
app.use(
  session({
    secret: "express_react_cookie",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 1000 * 60 * 24 }, //expired time
  })
);
app.use("/beta", require("./routes"));
app.use("/", (req, res) => {
  res.status(200).json({
    code: 0,
    message: "Welcome to smartship beta api server. Server is running well.",
  });
});

const PORT = process.env.PORT || 5050;

// const channel = "orders";

//pusher for option
// const pusher = new Pusher({
//   appId: "1047947",
//   key: "a02e0dd4b8d8317e5b47",
//   secret: "ab2a8045f187605daccd",
//   cluster: "us3",
//   encrypted: true,
// });

//监听数据库变化

db.once("open", () => {
  app.listen(PORT, async () => {
    console.log(`Listening on port`, PORT);
    // system.IB_scan_save("01 1 * * * *");

    // 每分钟的第30秒触发： '30 * * * * *'

    // 每小时的1分30秒触发 ：'30 1 * * * *'

    // 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

    // 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

    // 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

    // 每周1的1点1分30秒触发 ：'30 1 1 * * 1'

    // let result = await Record.deleteMany({ type: "label" });
    // console.log(result)
    // scan();
  });

  // pusher.trigger('testChannel', 'testEvent', { message: 'hello,world' });
  // const taskCollection = db.collection('orders');
  // const changeStream = taskCollection.watch([], { maxAwaitTimeMS: 1000 });
});
