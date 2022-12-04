var express = require("express");

const { Payment } = require("../models/PaymentGateway");

var router = express.Router();



router.post("/payment", async (req, res) => {
  try {
  
console.log("req.body",req.body)
  
    let data = new Payment({
        Name:req.body.Name,
        Email:req.body.Email,
        Address:req.body.Address,
        Version:req.body.Version,
        MerID:req.body.MerID,
        AcqID:req.body.AcqID,
        PurchaseAmt:req.body.PurchaseAmt,
        PurchaseCurrency:req.body.PurchaseCurrency,
        PurchaseCurrencyExponent:req.body.PurchaseCurrencyExponent,
        OrderID:req.body.OrderID,
        CaptureFlag:req.body.CaptureFlag,
        Signature:req.body.Signature,
        SignatureMethod:req.body.SignatureMethod,
      
    
        
      });
      await data.save();

console.log("data",data)
    res
      .status(200)
      .json({ data, message: `Payment Done Successfully` });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

module.exports = router;
