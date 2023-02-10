require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const content = require("./routes/content");
const receiptContent = require("./routes/receiptContent")

const authRouter = require("./routes/auth");
const therapistRouter = require("./routes/therapist");
const therapistHubRouter = require("./routes/therapisthub");
const addSpaceRouter = require("./routes/AddSpace");
const PaymentGatewayRouter=require("./routes/PaymentGateway")
var host = process.env.HOST || '0.0.0.0';
const Booking = require("./routes/Book");
var cron = require("node-cron");
const app = express();
// cron.schedule("* * * * *", (reviewPop) => {
//   reviewPop: true;
//   console.log("noew review is true");
// });
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

var upload = multer({ dest: "uploads/" });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use(express.static("upload"));

// app.use(cors());
// app.use(
//   cors({
//     origin: "*",
//     optionsSuccessStatus: 200,
//     credentials: true,
//   })
// );
// app.options(
//   "*",
//   cors({
//     origin: "*",
//     optionsSuccessStatus: 200,
//     credentials: true,
//   })
// );

app.use("/api/auth", authRouter);
app.use("/api/therapist", therapistRouter);
app.use("/api/therapisthub", therapistHubRouter);
app.use("/api/space", addSpaceRouter);
app.use("/api", PaymentGatewayRouter);
app.use("/", receiptContent);
app.use("/api/content", content);
app.use("/api/booking", Booking);

app.use(function (req, res, next) {
  next(createError(404));
});



app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose
  .connect(process.env.MONGO_URL)
  .then((response) => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
    console.log("Database is not connected");
  });

  const PORT = process.env.PORT  || 5000;

app.listen(process.env.PORT || 5000, () => {
  console.log(`listening on port ${PORT}`);
});



module.exports = app;
