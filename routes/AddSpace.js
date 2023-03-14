var express = require("express");
const { Space } = require("../models/AddSpace");
const { User } = require("../models/user");
const { Therapist } = require("../models/therapist");
const { TherapistHub } = require("../models/therapisthub");
const { Availability } = require("../models/Availabilty");
const { TimeSlot } = require("../models/TimeSlot");
var moment = require("moment");

var router = express.Router();
const multer = require("multer");
const path = require("path");
const { getCheckFilter } = require("../utils/CheckData");

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
router.post("/addspace", upload.single("spaceImage"), async (req, res) => {
  const bodyData = { ...req.body };
  try {
    let { userId } = req.body;
    let user = await User.findOne({ _id: userId });
    let data;
    let person;
    switch (user.accountType) {
      case "Professional":
        person = await Therapist.findOne({ user: userId });
        data = new Space({
          name: bodyData.name,
          price: bodyData.price,
          address: bodyData.address,
          description: bodyData.description,
          spaceImage: `uploads/${req.file.filename}`,
          userImage: user.image,
          therapist: person._id,
        });
        await data.save();
        break;

      case "Host":
        person = await TherapistHub.findOne({ user: userId });
        data = new Space({
          name: bodyData.name,
          price: bodyData.price,
          address: bodyData.address,
          longitude: bodyData.longitude,
          latitude: bodyData.latitude,
          unConsectiveSlots: bodyData.unConsectiveSlots,
          description: bodyData.description,
          spaceImage: `uploads/${req.file.filename}`,
          userImage: user.image,
          therapisthub: person._id,
        });
        await data.save();
        break;

      default:
        break;
    }

    res.status(200).json({
      status: true,
      message: "New Space Created successfully",
      result: data,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

//delete space

router.delete("/deletespace/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteuser = await Space.findByIdAndDelete({ _id: id });
    res.status(201).json({ message: "space delete successfully", deleteuser });
  } catch (error) {
    res.status(422).json({ err, message: "Server error at delete space!" });
  }
});

//edit space

router.patch(
  "/updateSpace/:id",
  upload.single("spaceImage"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const checkSpaceExist = await Space.find({ _id: id });
      if (req.file) {
        const updatespace = await Space.findByIdAndUpdate(
          { _id: id },
          {
            name: req.body.name,
            price: req.body.price,
            address: req.body.address,
            description: req.body.description,
            spaceImage: `uploads/${req.file.filename}`,
          },
          {
            new: true,
          }
        );

        await updatespace.save();
      } else {
        const updatespace = await Space.findByIdAndUpdate(
          { _id: id },
          {
            name: req.body.name,
            price: req.body.price,
            address: req.body.address,
            description: req.body.description,
          },
          {
            new: true,
          }
        );
        await updatespace.save();
      }
      res.status(201).json({ message: "update Sucessfully" });
    } catch (error) {
      res.status(422).json({ error, message: "Server error at update space" });
    }
  }
);
router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatespace = await Space.findByIdAndUpdate(
      { _id: id },
      {
        pickDate: req.body.temppickup,
      },
      {
        new: true,
      }
    );

    await updatespace.save();

    res.status(201).json({ message: "update Sucessfully" });
  } catch (error) {
    res.status(422).json({ error, message: "Server error at update space" });
  }
});
router.patch(
  "/addavailability/:id",

  async (req, res) => {
    try {
      const { id } = req.params;
      const { pickDate } = req.body;
      // console.log("unConsectiveSlots",req.body.currentDate)
      const updatespace = await Space.findByIdAndUpdate(
        { _id: id },
        {
          pickDate: req.body.pickDate,
          // unConsectiveSlots: req.body.unConsectiveSlots,
        }
      );

      // console.log("req.body.currentDate",moment(req.body.currentDate).format("dddd"))
      // console.log("req.body.currentDate",moment(updatespace.dateofAvailibilty).format("dddd"))

      // let dataDayIndex = updatespace.pickDate.findIndex((data) =>  moment(data.dateofAvailibilty).format("dddd") ==
      //  moment(req.body.currentDate).format("dddd"));

      await updatespace.save();
      // await newDataSave.save();
      res
        .status(201)
        .json({ message: "Avaibility added Sucessfully", updatespace });
    } catch (error) {
      res
        .status(422)
        .json({ error, message: "Server error at avaibility add on space!" });
    }
  }
);
//update multiple spaces

router.patch("/multiple/space/update", async (req, res) => {
  var updatedData = "";
  const { id } = req.params;
  var headersAgain = false;
  for (let i = 0; i < req.body.length; i++) {
    Space.findByIdAndUpdate(
      req.body[i]._id,

      {
        pickDate: req.body.pickDate,
      }
    ).then((val) => {
      val.pickDate = pickDate;

      updatedData = val + updatedData;

      val.save((err, updatedObject) => {
        console.log("inside save.....", updatedData);
        if (err) {
          return res.status(500).send(err);
        } else {
          if (!headersAgain == true) {
            headersAgain = true;
            return res.status(201).send(updatedData);
          }
        }
      });
    });
  }
});
//get all spaces

router.get("/getspace", async (req, res) => {
  try {
    const spaceData = await Space.find().populate({
      path: "therapisthub",
      select: "firstName lastName",
    });
    res.status(201).json({ message: "All Spaces", spaceData });
  } catch (error) {
    res.status(404).json({ error, message: "Server error at get spaces" });
  }
});

router.post("/getspaceinbooking", async (req, res) => {
  try {
    console.log("req.boy", req.body);
    const spaceData = await Space.find().populate({
      path: "therapisthub",
      select: "firstName lastName",
    });
    let date = "";
    let temptime = "";
    let location = "City";
    let check = await getCheckFilter(spaceData, date, temptime, location);
    console.log("check check =====", check.length, check);
  } catch (error) {
    res.status(404).json({ error, message: "Server error at get spaces" });
  }
});

//indivual space
router.get("/getspace/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const spaceIndvidual = await Space.findById({ _id: id }).populate({
      path: "therapisthub",
      select: "firstName lastName",
    });

    res.status(201).json({
      status: true,
      message: "Data single Space",
      result: spaceIndvidual,
    });
  } catch (error) {
    res.status(404).json(error);
  }
});

//availability

router.post("/avaiabilty", async (req, res) => {
  let { userId } = req.body;

  let space = await Space.findOne({ _id: userId }).populate({
    path: "therapisthub",
    select: "firstName lastName",
  });
  let = { pickDate, space, unConsectiveSlots } = req.body;
  try {
    let data = new Availability({
      pickDate,
      space,
    });

    await data.save();
    res.status(200).json({
      status: true,
      message: "availabilty created",
      result: data,
    });
  } catch (error) {
    res.status(500).json({
      Error_Message: error,
    });
  }
});

//get data by user

router.get("/getspaceByUser/:id", async (req, res) => {
  console.log(req.params.id, "req.params.id");
  Space.find({ therapisthub: req.params.id })
    .populate({
      path: "therapisthub",
      select: "firstName lastName",
    })
    .then((data) => {
      var message = "";
      if (data === undefined || data.length == 0) message = "No Space found!";
      else message = "Space successfully retrieved";
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send("Some error occured");
    });
});

//createSlot
router.post("/timeSlot", async (req, res) => {
  let { TimeSlots } = req.body;

  try {
    let data = new TimeSlot({
      TimeSlots,
    });

    await data.save();
    res.status(200).json({
      status: true,
      message: "availabilty created",
      result: data,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});
// /getspaces/bywhopost

router.get("/getspaces/bywhopost/:id", async (req, res) => {
  console.log(req.params.id, "req.params.id");
  console.log("dataziansdnsjdns", typeof req.params.id);
  console.log("dataziansdnsjdns", parseInt(req.params.id));

  // t;

  try {
    const dataUserFinddata = await Space.find({
      therapisthub: req.params.id,
    });
    res.status(200).json({
      data: dataUserFinddata,
    });
    console.log("dataUserFinddata ", dataUserFinddata);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

router.post("/getuser/sellerspacename", async (req, res) => {
  console.log(req.body, "req.body");
  // console.log("dataziansdnsjdns", typeof req.params.id);
  // console.log("dataziansdnsjdns", parseInt(req.params.id));

  // t;

  try {
    const dataUserFinddata = await Space.find({
      name: req.body.name,
    });
    console.log(
      "dataUserFinddatadataUserFinddata dataUserFinddata",
      dataUserFinddata[0]
    );
    let iddata = dataUserFinddata[0].therapisthub;
    const findUserdata = TherapistHub.findById({
      _id: iddata,
    });
    if (findUserdata) {
      res.status(200).json({
        data: findUserdata,
      });
      console.log("dataUserFinddata ", dataUserFinddata);
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

module.exports = router;
