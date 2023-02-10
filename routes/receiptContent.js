
var express = require("express");
var router = express.Router();
var cookie = require('js-cookie')

// router.post("/receipt/:id", async (req, res) => {
//     // const data = req.body;
//     // cookie.set("ResponseData",data)

//     // // res.status(200)
//     // const data = req.body;
//     // console.log("Received data:", data);
//     try {
//         return res.status(400).json("User does not exist");     
//     } catch (err) {
//         console.error(err)
//     }
   

// })

router.post('/receipt/:id', (req, res) => {
    // const data = req.body;
    // cookie.set("ResponseData",data)

	res.send(req.body);

});

module.exports = router;
