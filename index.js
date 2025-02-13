require("dotenv").config(); // 引入 dotenv 並載入環境變數
//資料庫連線
const mongo = require("mongodb"); //載入mongodb
const uri = process.env.DB_URI;
const client = new mongo.MongoClient(uri); //連線到資料庫
let db = null;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("message_system");
    console.log("✅ 連線成功");
  } catch (err) {
    console.error("❌ 連線失敗", err);
  }
}
connectDB();

//伺服器基本設定
const express = require("express"); //載入express模組
const session = require("express-session"); //載入express-session模組
const { time } = require("node:console");
const app = express();
app.use(
  session({
    secret: "anything",
    resave: false,
    saveUninitialized: true,
  })
); //使用session
app.set("view engine", "ejs"); //使用ejs
app.set("views", "./folder"); //folder:ejs模板資料夾名稱
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); //使用app.post
//首頁路由
app.get("/", async function (req, res) {
  const collection = db.collection("message");
  const messages = await collection.find().sort({ timestamp: -1 }).toArray(); //照時間排序
  res.render("index.ejs", { messages }); // 傳遞留言到 EJS
});

app.post("/", async function (req, res) {
  const name = req.body.name;
  const message = req.body.message;
  const timestamp = new Date();
  const collection = db.collection("message");
  result = await collection.insertOne({
    name: name,
    message: message,
    timestamp: timestamp,
  });
  res.redirect("/");
});
app.post("/clear", async function (req, res) {
  const collection = db.collection("message");
  await collection.deleteMany({}); // 刪除所有留言
  res.redirect("/"); // 刪除後重新導向首頁
});
app.listen(3000, function () {
  console.log("server on");
});
