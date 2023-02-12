
var express = require("express");
var router = express.Router();
var cookie = require('js-cookie')
var path = require('path')
const request = require('request')


router.get('/receipt/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

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
        res.redirect(`https://www.rehubcy.com/receipt/${req.params.id}`)
      }
    })
  })

module.exports = router;
