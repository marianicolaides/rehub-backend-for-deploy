var express = require("express");
// import axios from './lib/axios.js';
const fetch = require("node-fetch");

const { Therapist } = require("../models/therapist");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const { TherapistHub } = require("../models/therapisthub");
const { authorizedUser } = require("../middleware/Authorized");
const { Review } = require("../models/review");
var router = express.Router();

const { OAuth2Client } = require("google-auth-library");
const { Booking } = require("../models/Book");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleUserDuplication = async (userData) => {
  let duplicateUsername = await User.findOne({
    username: userData.username,
    signInType: "App",
  });
  if (duplicateUsername) return "User is already registered with this username";

  if (userData.email) {
    let duplicateEmail = await User.findOne({
      email: userData.email,
      signInType: "App",
    });
    if (duplicateEmail) return "User is already registered with this email";
  }

  return null;
};

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await User.findOne({ username_lower: username.toLowerCase() });

    if (!user)
      return res.status(400).json({ errorMessage: "User does not exist" });

    let isPasswordEqual = await user.comparePassword(password, user.password);
    if (!isPasswordEqual)
      return res.status(400).json({ errorMessage: "Password is incorrect" });

    switch (user.accountType) {
      case "Professional":
        person = await Therapist.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt",
          })
          .lean();

        break;
      case "Host":
        person = await TherapistHub.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt",
          })
          .lean();

        break;

      default:
        break;
    }

    let token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);

    res.status(200).send(token);
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    let { name, username, password, accountType, email, usertype } = req.body;
    name = name.split(" ");

    console.log("reqSignup", req.body);
    let isDuplication = await handleUserDuplication(req.body);

    if (isDuplication)
      return res.status(400).send({ errorMessage: isDuplication });

    let user = new User({ username, accountType, email, usertype: "simple" });
    user.password = await user.encryptPassword(password);
    let userSaved = await user.save();

    console.log("userSaved==", userSaved);

    let person;

    switch (accountType) {
      case "Professional":
        person = await Therapist.create({
          firstName: name[0],
          lastName: name[1],
          usertype: "simple",
          userName: username,
          user: userSaved._id,
        });
        console.log("Therapist ===", Therapist);
        break;
      case "Host":
        person = await TherapistHub.create({
          firstName: name[0],
          lastName: name[1],
          usertype: "simple",
          userName: username,
          user: userSaved._id,
        });

        break;

      default:
        break;
    }

    res
      .status(200)
      .json({ user: person, message: `${accountType} successfully created` });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.get("/user", authorizedUser, async (req, res) => {
  let authorizedUser = req.user;
  let person;
  console.log("authorizedUser", authorizedUser);
  switch (authorizedUser?.user?.accountType) {
    case "Professional":
      person = await Therapist.findOne({ user: authorizedUser.user._id })
        .populate({ path: "user", select: "accountType email image createdAt" })
        .lean();

      break;
    case "Host":
      person = await TherapistHub.findOne({ user: authorizedUser.user._id })
        .populate({ path: "user", select: "accountType email image createdAt" })
        .lean();

      break;

    default:
      break;
  }
  res.status(200).send(person);
});

router.post("/google/signup", async (req, res) => {
  try {
    const { tokenId, accountType, image } = req.body;

    console.log("tokenId: ", tokenId);

    console.log("Response:======= ", req.body);
    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    if (!payload.email_verified)
      return res
        .status(400)
        .json({ errorMessage: "Email could not be verified" });

    let user = await User.findOne({
      email: payload.email,
      signInType: "Google",
    });
    let token;
    let person;
    if (user) {
      switch (user.accountType) {
        case "Professional":
          person = await Therapist.findOne({ user: user._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt",
            })
            .lean();

          break;
        case "Host":
          person = await TherapistHub.findOne({ user: user._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt",
            })
            .lean();

          break;

        default:
          break;
      }
      token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);
    } else {
      let name = payload.name.split(" ");
      let userSaved = await User.create({
        email: payload.email,
        image: image,
        signInType: "Google",
        accountType,
      });

      switch (accountType) {
        case "Professional":
          await Therapist.create({
            firstName: name[0],
            lastName: name[1],
            user: userSaved._id,
          });
          person = await Therapist.findOne({ user: userSaved._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt",
            })
            .lean();

          break;
        case "Host":
          await TherapistHub.create({
            firstName: name[0],
            lastName: name[1],
            user: userSaved._id,
          });
          person = await TherapistHub.findOne({ user: userSaved._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt",
            })
            .lean();

          break;

        default:
          break;
      }
      token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);
    }

    res.status(200).json({ token, message: "You are successfully logged in" });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/google/login", async (req, res) => {
  try {
    const { tokenId } = req.body;
    console.log("sss", req.body);

    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("payload", payload);

    if (!payload.email_verified)
      return res
        .status(400)
        .json({ errorMessage: "Email could not be verified" });

    let user = await User.findOne({
      email: payload.email,
      signInType: "Google",
    });
    if (!user)
      return res
        .status(200)
        .json({ message: "User is not present", error: true });

    let person;

    switch (user.accountType) {
      case "Professional":
        person = await Therapist.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt",
          })
          .lean();

        break;
      case "Host":
        person = await TherapistHub.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt",
          })
          .lean();

        break;

      default:
        break;
    }
    let token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);

    res
      .status(200)
      .json({ token, message: "You are successfully logged in", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/submit/review", async (req, res) => {
  try {
    const { userId, review, space, rating, bookingId } = req.body;

    console.log("req.body req.body aeadcsdf", req.body);
    let user = await User.findOne({
      _id: userId,
    });
    console.log("user aeadcsdf ", user);
    if (!user)
      return res
        .status(200)
        .json({ message: "User is not present aeadcsdf", error: true });

    let person = await Review.create({
      review: review,
      user: userId,
      space: space,
      rating: rating,
      booking: bookingId,
      flag: false,
    });
    console.log("person========", person);

    await person.save();
    console.log("person", person);

    res
      .status(200)
      .json({ message: "Sucessfully submit your review ", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.get("/all/review", async (req, res) => {
  try {
    let person = await Review.find()
      .populate([
        { path: "user", select: "email image username" },
        { path: "booking", select: "bookingDate bookingTime userName" },
        { path: "space", select: "name spaceImage price" },
      ])
      .lean();

    console.log("person person", person);
    res.status(200).json({ person, message: "all reviews", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.patch("/update/review", async (req, res) => {
  console.log("req.bodLLLL", req.body);
  try {
    const { id, approvedata } = req.body;
    const datafind = await Review.findOneAndUpdate(
      { _id: id },
      {
        approve: approvedata,
      }
    );
    if (!datafind) {
      res.status(400).json({ error: err, errorMessage: "review not found" });
    }
    res.status(200).json({ message: "Approve Sucessfully", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/singlespace/review", async (req, res) => {
  try {
    let { spaceName } = req.body;

    console.log("spaceName", req.body);
    let datareview = await Review.find()
      .populate([
        { path: "user", select: "email image username" },
        { path: "space", select: "spaceImage name" },
      ])
      .lean();

    console.log("person person spaceName", datareview);
    res.status(200).json({ datareview, message: "all reviews", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/get/review", async (req, res) => {
  try {
    // let { id } = req.params;
    let { spaceid } = req.body;

    // console.log("id  idid", id);

    let person = await Review.find({ space: spaceid });
    console.log("person person===", person);
    res.status(200).json({ person, message: "all reviews", error: false });
  } catch (err) {
    console.log("err err===", err);
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});
router.post("/update/singlereview", async (req, res) => {
  try {
    let { id, data } = req.body;
    console.log("req.body req.body sdsdsdsd hhhhhhhhhhhhh", req.body);
    let dataget = await Booking.findOneAndUpdate(
      {
        _id: id,
      },
      {
        reviewSubmit: true,
      }
    );
    console.log("dataget dataget hhhhhhhhhhhhh", dataget);

    await dataget.save();
    res.status(200).json({
      status: true,
      message: "Updated Sucessfully",
      // data: dataget,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

//facebook login
const facebookLogin1 = async (req, res) => {
  let { email, username, id, signInType, accountType, image } = req.body;
  console.log(email, username, id, signInType, accountType);
  console.log("req.body======", req.body);
  let fullname = [];
  fullname = username?.split(" ");

  try {
    let user = await User.findOne({
      email,
      signInType,
    });
    console.log("user found", user);
    let token;
    let person = {};
    if (user) {
      switch (user.accountType) {
        case "Professional":
          person = await Therapist.findOne({ user: user._id })
            .populate({ path: "user", select: "accountType email" })
            .lean();

          break;
        case "Host":
          person = await TherapistHub.findOne({ user: user._id })
            .populate({ path: "user", select: "accountType email" })
            .lean();

          break;

        default:
          break;
      }
      console.log("person", person);
      token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);
    } else {
      let userSaved = await User.create({
        email: email,
        signInType: signInType,
        accountType,
        image: image,
      });

      switch (accountType) {
        case "Professional":
          await Therapist.create({
            firstName: fullname[0],
            lastName: fullname[1],
            user: userSaved._id,
          });
          person = await Therapist.findOne({ user: userSaved._id })
            .populate({ path: "user", select: "accountType email" })
            .lean();

          break;
        case "Host":
          await TherapistHub.create({
            firstName: fullname[0],
            lastName: fullname[1],
            user: userSaved._id,
          });
          person = await TherapistHub.findOne({ user: userSaved._id })
            .populate({ path: "user", select: "accountType email" })
            .lean();

          break;

        default:
          break;
      }
      token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);
    }

    res.status(200).json({ token, message: "You are successfully logged in" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
};
const facebookLogin = async (req, res) => {
  let { email, username, id, signInType, accountType } = req.body;
  console.log(email, username, id, signInType, accountType);
  let fullname = [];
  fullname = username?.split(" ");

  try {
    let user = await User.findOne({ uniqueId: id });

    if (!user) {
      console.log("user", user);
      const newUser = new User({
        email: "Taimor@gamil.com",
        signInType,
        accountType,
        uniqueId: id,
        username: fullname[0] + fullname[1],
      });

      let savedUser = await newUser.save();
      let person;

      switch (accountType) {
        case "Professional":
          person = await Therapist.create({
            firstName: username[0],
            lastName: username[1],
            user: savedUser._id,
          });
          console.log("Therapist ===", Therapist);
          break;
        case "Host":
          person = await TherapistHub.create({
            firstName: username[0],
            lastName: username[1],
            user: savedUser._id,
          });

          break;
      }

      const token = jwt.sign(savedUser.toObject(), process.env.JWT_PRIVATE_KEY);
      return res.status(200).json({
        message: "user Register Successfully",
        user: savedUser,
        token: token,
      });
    } else {
      const token = jwt.sign(user.toObject(), process.env.JWT_PRIVATE_KEY);
      res.status(200).json({
        message: "Login SuccessFully",
        user,
        token,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server  error",
      error,
    });
  }
};

router.post("/facebook/signup", facebookLogin1);

module.exports = router;
