
var express = require("express");
var router = express.Router();
var cookie = require('js-cookie')
const request = require('request')

router.post('/receipt/:id', (req, res) => {
    const options = {
      url: 'https://rehubcy.com/api/receipt/' + req.params.id,
      method: 'POST',
      body: req.body,
      json: true
    }
  
    request(options, (error, response, body) => {
      if (error) {
        console.error(error)
        res.status(500).send('Internal server error')
      } else {
        res.send('Payment complete')
      }
    })
  })

module.exports = router;
