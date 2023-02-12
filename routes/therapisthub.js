const express = require("express");
const { authorizedUser } = require("../middleware/Authorized");
const { TherapistHub } = require("../models/therapisthub");
const { User } = require("../models/user");
const router = express.Router();
const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});



router.patch("/update/profile", upload.single("image"),authorizedUser, async (req, res) => {
  try {
    let authorizedUser = req.user;
    let {
      firstName,
      lastName,
      phoneNumber,
      location,
      email,
      information,
      password,
      usertype

    } = req.body;

    await TherapistHub.findByIdAndUpdate(
      { _id: authorizedUser._id },
      {
        firstName,
        lastName,
        phoneNumber,
        location,
        information,
        email,
        password,
        usertype,
        image: `uploads/${req.file.filename}`,
      }
    );
    let user = await User.findByIdAndUpdate(
      { _id: authorizedUser.user._id },
      { firstName,
        lastName,
        phoneNumber,
        location,
        information,
        email,
        password,
        usertype,
        image: `uploads/${req.file.filename}` }
    );
    await user.save();
    // if (password !== "") {
    //   user.password = await user.encryptPassword(password);

    // }

    res.status(200).send("Changes saved successfully");
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});
module.exports = router;