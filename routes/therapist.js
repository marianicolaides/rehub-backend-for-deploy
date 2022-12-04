const express = require("express");
const { authorizedUser } = require("../middleware/Authorized");
const { Therapist } = require("../models/therapist");
const { User } = require("../models/user");
const router = express.Router();

router.patch("/update/profile", authorizedUser, async (req, res) => {
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
    } = req.body;

    await Therapist.findByIdAndUpdate(
      { _id: authorizedUser._id },
      {
        firstName,
        lastName,
        phoneNumber,
        location,
        information,
      }
    );
    let user = await User.findByIdAndUpdate(
      { _id: authorizedUser.user._id },
      { email }
    );
    if (password !== "") {
      user.password = await user.encryptPassword(password);
      await user.save();
    }

    res.status(200).send("Changes saved successfully");
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.patch("/booking", authorizedUser, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

module.exports = router;
