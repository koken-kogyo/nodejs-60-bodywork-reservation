// Expressインスタンスを生成
const express = require("express");
const app = express();

const favicon = require("serve-favicon");
const path = require("path");
const fs = require("fs");

// User定義
const { PORT, log4jsConfig } = require("./config.js");
const mysqlHandler = require("./handlers/mysql.js");

// log4jsロガー設定
const log4js = require("log4js");
log4js.configure(log4jsConfig);

// テンプレートエンジンの設定
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/static", express.static("./public"));
app.use(favicon(`${__dirname}/public/images/favicon.ico`));
app.use(express.json()); // Body Parser

// Top Page
app.get( "/", (req, res) => res.render("index.ejs"));

// 従業員一覧検索 API
app.get("/users", async (req, res) => {
    try {
        const result = await mysqlHandler.getKM0010();
        if (result.length == 0) {
            res.status(299).end();
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        next(err);
    }
});

// 従業員検索 API
app.get("/users/:empno", async (req, res) => {
    try {
        const result = await mysqlHandler.getKM0010(req.params.empno);
        if (result.length == 0) {
            res.status(299).end();
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        next(err);
    }
});

// からだや予約ファイル取得 API
// param: 月度を指定
app.get("/orders/:yyyymm", async (req, res, next) => {
    try {
        const result = await mysqlHandler.getKD7000(req.params.yyyymm);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

// からだや予約ファイル登録または更新 API
// HTTPメソッド: POST
app.post('/orders', async (req, res) => {
    const { reservdt, timeslot, empno, treatment, note } = req.body;
    try {
        await mysqlHandler.insupdateKD7000(reservdt, timeslot, empno, treatment, note);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// からだや予約ファイル削除 API
// HTTPメソッド: DELETE
app.delete('/orders', async (req, res) => {
    const { reservdt, timeslot } = req.body;
    try {
        await mysqlHandler.deleteKD7000(reservdt, timeslot);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// 目視検査履歴ファイル更新（作業終了） API
app.get("/finish/:pdfcd/:empno/:hmcd/:wksec", async (req, res) => {
    const pdfcd = req.params.pdfcd;
    const empno = req.params.empno;
    const hmcd = req.params.hmcd;
    const wksec = req.params.wksec;
    try {
        // console.log(pdfcd + ":" + empno + ":" + hmcd);
        await mysqlHandler.updateKD8230(pdfcd, empno, hmcd, wksec);
        res.status(200).end();
    } catch (err) {
        res.status(299).end();
    }
});

// 包括的エラーハンドリング
app.use((err, req, res, next) => {
    console.log("包括的エラーハンドリング")
    console.error(err);
    res.status(500).send(`サーバーの動作が失敗しました．:${err.code} `);
});

// データベース接続 確証後にサーバーを起動
mysqlHandler.connect
.then(() => {
    console.log(`MySQL Database [${mysqlHandler.database}] Connected!`);
    app.listen(PORT, () => {console.log(`Koken Manuals Search listen on Port:${PORT}`)});
}).catch((err) => {
    console.log("MySQL Database Connection Error!");
    console.log(err);
});
