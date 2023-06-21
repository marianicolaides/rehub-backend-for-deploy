const express = require("express");

const { Therapist } = require("../models/therapist");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const { TherapistHub } = require("../models/therapisthub");
const { authorizedUser } = require("../middleware/Authorized");
const { Review } = require("../models/review");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const mustache = require("mustache");

const { Booking } = require("../models/Book");
const { sendMail } = require("../utils/notification.util");
const SESPasswordReset = require("../emailTemplates/SES_passwordreset.json");
const VerifySignUpTemplate = require("../emailTemplates/VerifySignUpTemplate");
const SESConfTemp = require("../emailTemplates/SES_conftemp.json");
const EmailConstants = require("../emailTemplates/EmailConstants");
const SESBookingApproveToHost = require("../emailTemplates/SES_bookingapprove_tohost.json");
const SESBookingApproveToProf = require("../emailTemplates/SES_bookingapprove_toprof.json");
const SESBookingCancelHostToHost = require("../emailTemplates/SES_bookingcancel_byhosttohost.json");
const SESBookingCancelHostToProf = require("../emailTemplates/SES_bookingcancel_byhosttoprof.json");
const SESBookingCancelProfToHost = require("../emailTemplates/SES_bookingcancel_byproftohost.json");
const SESBookingCancelProfToProf = require("../emailTemplates/SES_bookingcancel_byproftoprof.json");
const env = require("../config");
const { generateToken, decodeToken } = require("../utils/token.util");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleUserDuplication = async (userData) => {
  const duplicateUsername = await User.findOne({
    username: userData.username,
    signInType: "App",
  });
  if (duplicateUsername) return "User is already registered with this username";

  if (userData.email) {
    const duplicateEmail = await User.findOne({
      email: userData.email,
      signInType: "App",
    });
    if (duplicateEmail) return "User is already registered with this email";
  }

  return null;
};

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      $or: [
        { username: { "$regex": `^${username.toLowerCase()}$`, "$options": "i" } },
        { email: { "$regex": `^${username.toLowerCase()}$`, "$options": "i" } }
      ]
    });

    if (!user)
      return res.status(400).json({ errorMessage: "User does not exist" });

    const isPasswordEqual = await user.comparePassword(password, user.password);
    if (!isPasswordEqual)
      return res.status(400).json({ errorMessage: "Password is incorrect" });

    switch (user.accountType) {
      case "Professional":
        person = await Therapist.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt signInType",
          })
          .lean();

        break;
      case "Host":
        person = await TherapistHub.findOne({ user: user._id })
          .populate({
            path: "user",
            select: "accountType email image createdAt signInType",
          })
          .lean();

        break;

      default:
        break;
    }

    const token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);

    res.status(200).send(token);
  } catch (error) {
    res.status(400).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ errorMessage: "User does not exist" });

    const token = generateToken({ id: user._id, email });
    await User.findByIdAndUpdate(user._id, { token });
    const url = `${env.FE_URL}reset-password/${token}`;

    let therapist = user;
    if (user.accountType === "Host") {
      therapist = await TherapistHub.findOne({ user: user._id });
    } else {
      therapist = await Therapist.findOne({ user: user._id });
    }
    const mailBody = mustache.render(SESPasswordReset.Template.HtmlPart, { user: `${therapist.firstName} ${therapist.lastName}`, RESET_PASSWORD_LINK: url })
    await sendMail(email, mailBody, SESPasswordReset.Template.SubjectPart);

    res.status(200).send(token);
  } catch (error) {
    res.status(500).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password, token } = req.body;

    const { id } = await decodeToken(token);

    const user = await User.findById(id);
    if (!user)
      return res.status(400).json({ errorMessage: "User does not exist" });

    await User.findOneAndUpdate({ email: user.email }, { password });

    res.status(200).send({ message: "Password is reset successfully" });
  } catch (error) {
    res.status(500).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.post("/confirm-reset-password", async (req, res) => {
  try {
    const { token } = req.body;
    const { id } = await decodeToken(token);

    const user = await User.findById(id);

    if (!user)
      return res.status(400).json({ errorMessage: "User does not exist" });

    if (user.token !== token)
      return res.status(400).json({ errorMessage: "Token is not valid" });

    res.status(200).send({ email: user.email });
  } catch (error) {
    res.status(500).json({ error, errorMessage: "Internal Server Error" });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    const { id } = await decodeToken(token);

    const user = await User.findById(id);

    if (!user)
      return res.status(400).json({ message: "User does not exist" });

    if (user.isValid)
      return res.status(400).json({ message: "Verification is already done" });

    if (user.token !== token)
      return res.status(400).json({ message: "Token is not valid" });

    await User.findByIdAndUpdate(user._id, { isValid: true, token: "" });
    let therapist = user;
    if (user.accountType === "Host") {
      therapist = await TherapistHub.findOne({ user: user._id });
    } else {
      therapist = await Therapist.findOne({ user: user._id });
    }

    const mailBody = mustache.render(SESConfTemp.Template.HtmlPart, { user: `${therapist.firstName} ${therapist.lastName}` });
    await sendMail(user.email, mailBody, SESConfTemp.Template.SubjectPart);

    res.status(200).send({ message: "Verification is successfully done" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    let { name, username, password, accountType, email, usertype } = req.body;
    name = name.split(" ");

    const isDuplication = await handleUserDuplication(req.body);

    if (isDuplication)
      return res.status(400).send({ errorMessage: isDuplication });

    const user = new User({ username: name.join(" "), accountType, email, usertype: "simple", isValid: false });
    user.password = await user.encryptPassword(password);
    const userSaved = await user.save();
    const token = generateToken({ id: userSaved._id, email: userSaved.email });
    await User.findByIdAndUpdate(userSaved._id, { token });
    const url = `${env.FE_URL}verify-email/${token}`;
    const mail = VerifySignUpTemplate
      .replace(EmailConstants.user, "Dear")
      .replace(EmailConstants.url, url);
    await sendMail(email, mail, "Sign Up");

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
  const authorizedUser = req.user;
  let person;
  switch (authorizedUser?.user?.accountType) {
    case "Professional":
      person = await Therapist.findOne({ user: authorizedUser.user._id })
        .populate({ path: "user", select: "accountType signInType email image createdAt" })
        .lean();

      break;
    case "Host":
      person = await TherapistHub.findOne({ user: authorizedUser.user._id })
        .populate({ path: "user", select: "accountType signInType email image createdAt" })
        .lean();

      break;

    default:
      break;
  }
  res.status(200).send(person);
});

router.post("/google/signup", async (req, res) => {
  try {
    const { tokenId, accountType } = req.body;

    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    if (!payload.email_verified)
      return res
        .status(400)
        .json({ errorMessage: "Email could not be verified" });

    const user = await User.findOne({
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
      const name = payload.name.split(" ");
      const userSaved = await User.create({
        email: payload.email,
        image: payload.picture,
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
    const { tokenId, accountType } = req.body;

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

    let person;

    if (user) {
      switch (user.accountType) {
        case "Professional":
          person = await Therapist.findOne({ user: user._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt signInType",
            })
            .lean();

          break;
        case "Host":
          person = await TherapistHub.findOne({ user: user._id })
            .populate({
              path: "user",
              select: "accountType email image createdAt signInType",
            })
            .lean();

          break;

        default:
          break;
      }
    } else {
      user = await User.create({
        email: payload.email,
        username: payload.name,
        image: payload.picture,
        isValid: true,
        signInType: "Google",
        accountType
      });

      const name = payload.name.split(" ");
      switch (user.accountType) {
        case "Professional":
          await Therapist.create({
            firstName: name[0],
            lastName: name[1],
            user: user._id,
          });
          person = await Therapist.findOne({ user: user._id })
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
            user: user._id,
          });
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
    }

    const token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);

    res
      .status(200)
      .json({ token, message: "You are successfully logged in", error: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/google/account", async (req, res) => {
  try {
    const { tokenId } = req.body;

    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    if (!payload.email_verified) {
      return res
        .status(400)
        .json({ errorMessage: "Email could not be verified" });
    }

    const user = await User.findOne({
      email: payload.email,
      signInType: "Google",
    });

    res.status(200).json({ existing: Boolean(user) });
  } catch (err) {
    res.status(500).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/submit/review", async (req, res) => {
  try {
    const { userId, review, space, rating, bookingId } = req.body;

    const user = await User.findOne({
      _id: userId,
    });
    if (!user)
      return res
        .status(200)
        .json({ message: "User is not present aeadcsdf", error: true });

    const person = await Review.create({
      review: review,
      user: userId,
      space: space,
      rating: rating,
      booking: bookingId,
      flag: false,
    });

    await person.save();

    res
      .status(200)
      .json({ message: "Sucessfully submit your review ", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.get("/all/review", async (req, res) => {
  try {
    const person = await Review.find()
      .populate([
        { path: "user", select: "email image username" },
        { path: "booking", select: "bookingDate bookingTime userName" },
        { path: "space", select: "name spaceImage price" },
      ])
      .lean();

    res.status(200).json({ person, message: "all reviews", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.patch(
  "/update/review",
  authorizedUser,
  async (req, res) => {
  try {
    const { id, approvedata } = req.body;
    const datafind = await Review.findOneAndUpdate(
      { _id: id },
      {
        approve: approvedata,
      }
    )
      .populate({
        path: "user",
        select: "accountType firstName lastName username email image createdAt signInType",
      })
      .populate({
        path: "booking",
        select: "_id bookingTime bookingDate",
      })
      .populate({
        path: "booking.userId",
        select: "_id bookingTime bookingDate",
      })
      .lean();
    const user = datafind.user;

    if (user) {
      if (approvedata) {
        let mailBody;

        const authUser = req.user;
        let therapist;
        if (user.accountType === "Host") {
          therapist = await TherapistHub.findOne({ user: user._id });
          mailBody = mustache.render(SESBookingApproveToProf.Template.HtmlPart, {
            user: `${authUser.firstName} ${authUser.lastName}`,
            "HOST NAME": `${therapist.firstName} ${therapist.lastName}`,
            "BOOKING DATE": therapist.bookingDate,
            "BOOKING TIME": therapist.bookingTime,
            booking_receipt_link: `${env.FE_URL}booking?spaceid=${datafind.space}`
          });
        } else {
          therapist = await Therapist.findOne({ user: user._id });
          mailBody = mustache.render(SESBookingApproveToHost.Template.HtmlPart, {
            user: `${authUser.firstName} ${authUser.lastName}`,
            PROFESSIONAL_NAME: `${therapist.firstName} ${therapist.lastName}`,
            BOOKING_DATE: therapist.bookingDate,
            BOOKING_TIME: therapist.bookingTime,
            booking_receipt_link: `${env.FE_URL}booking?spaceid=${datafind.space}`
          });
        }
        if (mailBody) {
          await sendMail(authUser.user.email, mailBody, SESPasswordReset.Template.SubjectPart);
        }
      } else {
        let mailBody;

        const authUser = req.user;
        const isAuthUserHost = authUser.user?.accountType === "Host";

        let therapist;
        if (user.accountType === "Host") {
          therapist = await TherapistHub.findOne({ user: user._id });
          mailBody = mustache.render((isAuthUserHost ? SESBookingCancelHostToProf : SESBookingCancelProfToProf).Template.HtmlPart, {
            user: `${authUser.firstName} ${authUser.lastName}`,
            HOST_NAME: `${therapist.firstName} ${therapist.lastName}`,
            BOOKING_DATE: therapist.bookingDate,
            BOOKING_TIME: therapist.bookingTime
          });
        } else {
          therapist = await Therapist.findOne({ user: user._id });
          mailBody = mustache.render((isAuthUserHost ? SESBookingCancelHostToHost : SESBookingCancelProfToHost).Template.HtmlPart, {
            user: `${authUser.firstName} ${authUser.lastName}`,
            PROFESSIONAL_NAME: `${therapist.firstName} ${therapist.lastName}`,
            BOOKING_DATE: therapist.bookingDate,
            BOOKING_TIME: therapist.bookingTime
          });
        }
        if (mailBody) {
          await sendMail(authUser.user.email, mailBody, SESPasswordReset.Template.SubjectPart);
        }
      }
    }

    if (!datafind) {
      res.status(400).json({ error: err, errorMessage: "review not found" });
    }
    res.status(200).json({ message: "Approve Successfully", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/singlespace/review", async (req, res) => {
  try {
    const { spaceName } = req.body;

    const datareview = await Review.find()
      .populate([
        { path: "user", select: "email image username" },
        { path: "space", select: "spaceImage name" },
      ])
      .lean();

    res.status(200).json({ datareview, message: "all reviews", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});

router.post("/get/review", async (req, res) => {
  try {
    // let { id } = req.params;
    const { spaceid } = req.body;
    const person = await Review.find({ space: spaceid });
    res.status(200).json({ person, message: "all reviews", error: false });
  } catch (err) {
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
});
router.post("/update/singlereview", async (req, res) => {
  try {
    const { id, data } = req.body;
    const dataget = await Booking.findOneAndUpdate(
      {
        _id: id,
      },
      {
        reviewSubmit: true,
      }
    );

    await dataget.save();
    res.status(200).json({
      status: true,
      message: "Updated Sucessfully",
      // data: dataget,
    });
  } catch (error) {
    res.status(500).json({
      Error_Message: error,
    });
  }
});

//facebook login
const facebookLogin1 = async (req, res) => {
  const { email, username, id, signInType, accountType, image } = req.body;
  let fullname = [];
  fullname = username?.split(" ");

  try {
    const user = await User.findOne({
      email,
      signInType,
    });
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
      token = jwt.sign(person, process.env.JWT_PRIVATE_KEY);
    } else {
      const userSaved = await User.create({
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
    res.status(400).json({ error: err, errorMessage: "Internal Server Error" });
  }
};
const facebookLogin = async (req, res) => {
  const { email, username, id, signInType, accountType } = req.body;
  let fullname = [];
  fullname = username?.split(" ");

  try {
    const user = await User.findOne({ uniqueId: id });

    if (!user) {
      const newUser = new User({
        email: "Taimor@gamil.com",
        signInType,
        accountType,
        uniqueId: id,
        username: fullname[0] + fullname[1],
      });

      const savedUser = await newUser.save();
      let person;

      switch (accountType) {
        case "Professional":
          person = await Therapist.create({
            firstName: username[0],
            lastName: username[1],
            user: savedUser._id,
          });
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
