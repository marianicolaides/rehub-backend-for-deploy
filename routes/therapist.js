const express = require("express");
const { authorizedUser } = require("../middleware/Authorized");
const { Therapist } = require("../models/therapist");
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

router.patch(
  "/update/profile",
  upload.single("image"),
  authorizedUser,
  async (req, res) => {
    console.log("req", req.body);
    console.log("req1", req.file);

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
        usertype,
      } = req.body;

      if (req.file) {
        await Therapist.findOneAndUpdate(
          { _id: authorizedUser._id },
          {
            firstName,
            lastName,
            phoneNumber,
            location,
            information,
            password,
            usertype,

            image: `uploads/${req.file.filename}`,
          },
          {
            new: true,
          }
        );
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
            image: `uploads/${req.file.filename}`,
          },
          {
            new: true,
          }
        );
      } else {
        await Therapist.findOneAndUpdate(
          { _id: authorizedUser._id },
          {
            firstName,
            lastName,
            phoneNumber,
            location,
            information,
            password,
            usertype,
          },
          {
            new: true,
          }
        );

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
          },
          {
            new: true,
          }
        );
      }

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

router.patch("/booking", authorizedUser, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

module.exports = router;
