const express = require("express");
const app = express();
const router = express.Router();
const scrap = require("./../scrap");
const path = require("path");




const indexRouter = router
    .get("/", (req, res) => {
        res.render('search', {
            layout: false
        });

    })
    .post("/", (req, res, next) => {

        scrap.download(req.body.code, req.body.date, req.body.company).then(() => {

            res.download(req.app.get('fileName'));
            console.log("> " + "File Sent to User");

        }).catch(({ error }) => {
            error += ". Make sure you have entered valid details. Check logs or contact developer for further details";

            let err = new Error(error);
            err.statusCode = 500;
            next(err);
        });


    });


module.exports = {
    indexRouter
}