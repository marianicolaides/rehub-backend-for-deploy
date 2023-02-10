
var express = require("express");
var router = express.Router();
var cookie = require('js-cookie')

router.post("/receipt/:id", async (req, res) => {
    const data = req.body;
    cookie.set("ResponseData",data)
})