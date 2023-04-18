const express = require("express");
const { authorizedUser } = require("../middleware/Authorized");
const { Therapist } = require("../models/therapist");
const { User } = require("../models/user");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { TherapistHub } = require("../models/therapisthub");

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

router.patch(
  "/update/profile",
  upload.single("image"),
  authorizedUser,
  async (req, res) => {

    try {
      let authorizedUser = req.user;
      const {
        firstName,
        lastName,
        phoneNumber,
        location,
        email,
        information,
        password,
        usertype,
      } = req.body;

      const updateData = {
        firstName,
        lastName,
        phoneNumber,
        location,
        information,
        password,
        usertype,
        ...(req.file ? { image: `uploads/${req.file.filename}` } : {})
      };

      if (authorizedUser.user.accountType === "Host") {
        await TherapistHub.findOneAndUpdate(
          { _id: authorizedUser._id },
          updateData,
          {
            new: true,
          }
        );
      } else {
        await Therapist.findOneAndUpdate(
          { _id: authorizedUser._id },
          updateData,
          {
            new: true,
          }
        );
      }
      await User.findOneAndUpdate(
        { _id: authorizedUser.user._id },
        {
          firstName,
          lastName,
          phoneNumber,
          location,
          information,
          email,
          password,
          usertype,
          ...(req.file ? { image: `uploads/${req.file.filename}` } : {})
        },
        {
          new: true,
        }
      );
      // if (password !== "") {
      //   user.password = await user.encryptPassword(password);
      // }

      res.status(200).send("Changes saved successfully");
    } catch (error) {
      console.log(error);
      res.status(400).json({ error, errorMessage: "Internal Server Error" });
    }
  }
);

router.put(
  "/update/account-type",
  authorizedUser,
  async (req, res) => {
    try {
      let authorizedUser = req.user;
      const { accountType } = req.body;

      await User.findOneAndUpdate(
        { _id: authorizedUser.user._id },
        { accountType },
        { new: true }
      );

      res.status(200).send("Changes saved successfully");
    } catch (error) {
      console.log(error);
      res.status(400).json({ error, errorMessage: "Internal Server Error" });
    }
  }
);

router.patch("/booking", authorizedUser, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

module.exports = router;
