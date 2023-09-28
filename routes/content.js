// const content = require("../models/content");
const { content } = require("../models/Content");
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./upload");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = "public/uploads";
    fs.mkdirsSync(path);
    cb(null, path);
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

var uploadMultiple = upload.fields([
  { name: "picture1" },
  { name: "picture2" },
  { name: "picture3" },
]);

//create content

router.post("/create", uploadMultiple, async function (req, res) {
  console.log("dd test", req.body);
  try {
    console.log("in try");
    console.log("req.file testz", req.files);
    const urlOne = `uploads/${req.files.picture1[0].filename}`;
    const urlSecond = `uploads/${req.files.picture2[0].filename}`;
    const urlthird = `uploads/${req.files.picture3[0].filename}`;

    console.log("urlOne", urlOne);
    console.log("urlSecond", urlOne);
    console.log("urlthird", urlthird);

    let data = new content({
      paragraph1: req.body.paragraph1,
      paragraph2: req.body.paragraph2,
      paragraph3: req.body.paragraph3,
      primaryColor: req.body.primaryColor,
      secondaryColor: req.body.secondaryColor,
      picture1: urlOne,

      picture2: urlSecond,
      picture3: urlthird,
      platFormFee: req.body.platFormFee,
      link1: req.body.link1,
      link2: req.body.link2,
      link3: req.body.link3,
    });
    console.log("sssss", data);

    await data.save();
    console.log("datadata", data);
    res.status(200).json({
      status: true,
      message: "Content Added Successfully",
      result: data,
    });
  } catch (error) {
    res.status(500).json({
      Error_Message: error,
    });
  }
});

///edit Content

router.post("/updateContent/:id", uploadMultiple, async (req, res) => {
  try {
    const {
      paragraph1,
      paragraph2,
      paragraph3,
      primaryColor,
      secondaryColor,
      picture1,
      picture2,
      picture3,
      platFormFee,

      link1,
      link2,
      link3,
    } = req.body;

    console.log("req.filesreq.filesreq.files", req.files);

    console.log("req.paramsreq.params", req.params);
    console.log("req.bodyreq.bodyreq.bodyreq.body", req.body);

    const { id } = req.params;

    // if (req.files) {
    const checkSpaceExist = await content.findOne({ _id: id });
    console.log("checkSpaceExist checkSpaceExist", checkSpaceExist);

    const urlOne = req.files.picture1
      ? `uploads/${req.files.picture1[0].filename}`
      : checkSpaceExist?.picture1;
    const urlSecond = req.files.picture2
      ? `uploads/${req.files.picture2[0].filename}`
      : checkSpaceExist?.picture2;
    const urlthird = req.files.picture3
      ? `uploads/${req.files.picture3[0].filename}`
      : checkSpaceExist?.picture3;
    console.log("urlOne", urlOne);
    console.log("urlSecond", urlOne);
    console.log("urlthird", urlthird);

    console.log("sssss", urlSecond, urlOne, urlthird);

    const updatespace = await content.findByIdAndUpdate(
      { _id: id },
      {
        paragraph1: paragraph1 ? paragraph1 : checkSpaceExist.paragraph1,
        paragraph2: paragraph2 ? paragraph2 : checkSpaceExist.paragraph2,
        paragraph3: paragraph3 ? paragraph3 : checkSpaceExist.paragraph3,
        primaryColor: primaryColor
          ? primaryColor
          : checkSpaceExist.primaryColor,
        secondaryColor: secondaryColor
          ? secondaryColor
          : checkSpaceExist.secondaryColor,
        picture1: urlOne,

        picture2: urlSecond,
        picture3: urlthird,
        platFormFee: platFormFee ? platFormFee : checkSpaceExist.platFormFee,
        link1: link1 ? link1 : checkSpaceExist.link1,
        link2: link2 ? link2 : checkSpaceExist.link2,

        link3: link3 ? link3 : checkSpaceExist.link3,
      },
      {
        new: true,
      }
    );

    await updatespace.save();
    console.log("updatespace updatespaceupdatespace", updatespace);
    // } else {

    //     console.log("dd else")

    //   const updatespace = await content.findByIdAndUpdate(
    //     { _id: id },
    //     {
    //         paragraph1: req.body.paragraph1,
    //         paragraph2: req.body.paragraph2,
    //         paragraph3: req.body.paragraph3,
    //         primaryColor: req.body.primaryColor,
    //         secondaryColor: req.body.secondaryColor,
    //         picture1: urlOne,

    //         picture2: urlSecond,
    //         picture3: urlthird,
    //     },
    //     {
    //       new: true,
    //     }
    //   );
    //   await updatespace.save();
    // }
    res.status(201).json({ message: "update Sucessfully" });
  } catch (error) {
    res.status(422).json({ error, message: "Server error at update space" });
  }
});

router.get("/find", async function (req, res) {
  try {
    let data = await content.find();

    res.status(200).json({
      status: true,
      message: "Get Content Data Successfully",
      data,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});
module.exports = router;
