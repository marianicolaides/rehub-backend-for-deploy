const mongoose = require("mongoose");
const PaymentGateway = new mongoose.Schema({
    Name:String,
    Email:String,
    Address:String,
    Version: String,
    MerID: String,
    AcqID: String,
    PurchaseAmt: String,
    PurchaseCurrency:String,
    PurchaseCurrencyExponent:String,
    OrderID:String,
    CaptureFlag:String,
    Signature:String,
    SignatureMethod:String,
    CardNo:String,
    CardExpDate:String,
    CardCVV2:String,
    hashValue:String





});
const Payment = mongoose.model("Payment", PaymentGateway);

module.exports.Payment = Payment;
