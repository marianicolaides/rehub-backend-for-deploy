const express = require("express");
const { authorizedUser } = require("../middleware/Authorized");
const { TherapistHub } = require("../models/therapisthub");
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
      // password,
    } = req.body;

    await TherapistHub.findByIdAndUpdate(
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
      { firstName, lastName, phoneNumber, location, information, email }
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
