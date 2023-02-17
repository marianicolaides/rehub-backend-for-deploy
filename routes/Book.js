var express = require("express");
const { Space } = require("../models/AddSpace");
var moment = require("moment");
const { Booking } = require("../models/Book");
const { Therapist } = require("../models/therapist");
const { TherapistHub } = require("../models/therapisthub");
const { User } = require("../models/user");
const { CheckDataIs } = require("../utils/CheckData");
var cron = require("node-cron");
var router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { booking, user } = req.body;
    let userData = await User.findOne({ _id: user });
    const databooking = await Booking.create(booking);

    // await databooking.save();

    // console.log("databooking databooking", databooking);

    // let spaceData = await Space.findOne({ _id: space });
    // console.log("spaceData", spaceData);

    // console.log("user", user);

    // let  data = new Booking({
    //   booking:spaceData
    // })

    // switch (userData.accountType) {
    //   case "Therapist":
    //     person = await Therapist.findOne({ user: user });
    //     data = new Booking({
    //       spaceId: spaceData._id,
    //       spaceName: spaceData.name,
    //       spacePrice: spaceData.price,
    //       spaceAddress: spaceData.address,
    //       spaceImage: spaceData.spaceImage,
    //       spacePickDate: spaceData.pickDate,
    //       userImage: userData?.image,
    //     });
    //     await data.save();

    //     break;
    //   case "TherapistHub":
    //     person = await TherapistHub.findOne({ user: user });
    //     data = new Booking({
    //       spaceId: spaceData._id,
    //       spaceName: spaceData.name,
    //       spacePrice: spaceData.price,
    //       spaceAddress: spaceData.address,
    //       spaceImage: spaceData.spaceImage,
    //       spacePickDate: spaceData.pickDate,
    //       userImage: userData?.image,
    //     });
    //     await data.save();

    //     break;

    //   default:
    //     break;
    // }

    res.status(200).json({
      status: true,
      message: "Add Sucessfully",
      result: databooking,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

// export async function driverVehicle(req, res) {
//   let { id } = req.params;

//   console.log("req.body===", id);
//   let vehicle = null;
//   let driver = null;
//   const newDriver = null;
//   // if (id) {
//   vehicle = await Vehicle.find({ driverId: id });

//   // }

//   console.log("driver....", driver, newDriver);
//   res.json({ success: true, vehicle });
// }
// router.get("/getAll", async (req, res) => {
//   try {
//     // console.log("");

//     let { id } = req.params;

//     console.log("req.body===", id);
//     // let vehicle = null;
//     // let driver = null;
//     // const newDriver=null;
//     // if (id) {
//     let bookings = await Booking.find({ spaceUserID: id });

//     // }

//     res.json({ success: true, bookings });
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({
//       Error_Message: error,
//     });
//   }
// });

router.get("/getAll", async (req, res) => {
  try {
    // console.log("");

    let dataget = await Booking.find();
    // console.log("dataget", dataget);

    // let datatest = await dataget.map((item) => {
    //   console.log("item item === ", item);
    //   return {
    //     ...item,
    //     status: CheckDataIs(moment(item?.bookingDate).format("YYYY-DD-MM")),
    //   };
    // });
    // console.log("datatest datatest =====", datatest);

    // let datafrommap = dataget.map((item) => {
    //   console.log("item data", item);
    //   let datagetSpaces = findOne({ _id: item.space });
    //   console.log("datagetSpaces", datagetSpaces);
    // });
    res.status(200).json({
      status: true,
      message: "data is here",
      data: dataget,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});
router.get("/getAllB/:id", async (req, res) => {
  try {
    // console.log("");

    let dataget = await Booking.find({
      userId: req.params.id,
      paymentStatus: "Paid",
    }).populate({
      path: "spaceId",
      populate: {
        path: "therapisthub",
      },
    });

    res.status(200).json({
      status: true,
      message: "data is here",
      data: dataget,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

router.post("/delete/booking", async (req, res) => {
  try {
    // const { data } = req.body;
    console.log("data data====", req.body);

    const datacheckasd = await Booking.find({
      bookingDate: req.body.bookingDate,
      bookingTime: req.body.bookingTime,
      spaceId: req.body.spaceId,
    });
    const datagetfromspace = await Space.find({ name: req.body.spaceName });
    console.log("datagetfromspace", datagetfromspace);
    let datatest = datagetfromspace[0].pickDate;
    // console.log("datatest datatest", datatest);

    // const test1 = datatest.map((item) => {
    //   if (item?.dateofAvailibilty === req.body.bookingDate) {
    //     return item.timeslots.map((item) => {
    //       if (
    //         item.timevalue === req.body.bookingTime &&
    //         item.dateofbooking !== null
    //       ) {
    //         return {
    //           ...item,
    //           isBooked: false,
    //           userName: null,
    //           dateofbooking: null,
    //         };
    //       } else {
    //         return item;
    //       }
    //     });
    //   } else {
    //     return item;
    //   }
    // });
    // console.log(
    //   "test1 test1test1",
    //   test1.filter((item) => item.dateofAvailibilty === req.body.bookingDate)
    // );

    const datagetfromspacess = datatest.filter(
      (item) => item?.dateofAvailibilty === req.body.bookingDate
    );
    console.log("datagetfromspacess before ", datagetfromspacess[0].timeslots);
    const datfiltertime = datagetfromspacess[0].timeslots.map((item) => {
      if (
        item.timevalue === req.body.bookingTime &&
        item.dateofbooking !== null
      ) {
        return {
          ...item,
          isBooked: false,
          userName: null,
          dateofbooking: null,
        };
      } else {
        return item;
      }
    });
    console.log("datagetfromspacess datagetfromspacess", datagetfromspacess);
    console.log("datfiltertime datfiltertime", datfiltertime);

    const dataspacegetobj = {
      dateofAvailibilty: datagetfromspacess[0].dateofAvailibilty,
      timeslots: datfiltertime,
    };
    console.log(
      "dataspacegetobj dataspacegetobj",
      dataspacegetobj,
      "datatest",
      datatest
    );
    let datattestes = datatest?.map((item) => {
      if (item?.dateofAvailibilty === req.body.bookingDate) {
        return {
          ...item,
          timeslots: datfiltertime,
        };
      } else {
        return item;
      }
    });
    console.log("datattestes datattestes", datattestes);
    console.log("datagetfromspace._id datagetfromspace._id", datagetfromspace);

    const findbyiddata = await Space.findByIdAndUpdate(
      { _id: datagetfromspace[0]._id },
      {
        pickDate: datattestes,
      }
    );
    await findbyiddata.save();
    res.status(200).json({
      status: true,
      message: "data is here",
      data: datacheckasd,
    });

    // console.log("datacheckasddatacheckasd", datacheckasd);
    // const datacheckasd = await Booking.find({bookingDate:data.bookingDate })
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});
router.delete("/deletebooking/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(" req.params", req.params);
    const deleteuser = await Booking.findByIdAndDelete({ _id: id });
    res.status(200).json({
      status: true,
      message: "delete sucessfully",
    });

    // console.log("datacheckasddatacheckasd", datacheckasd);
    // const datacheckasd = await Booking.find({bookingDate:data.bookingDate })
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

router.post("/getbooking/byname", async (req, res) => {
  try {
    console.log("req.body ", req.body);

    const isbookingExist = await Booking.find({
      spaceName: req.body.spaceName,
    });
    if (isbookingExist) {
      res.status(200).json({
        status: true,
        message: "data get space sucessfully",
        data: isbookingExist,
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});

router.post("/checkbooking/exist", async (req, res) => {
  try {
    console.log("req.body ", req.body);

    const isbookingExist = await Booking.find({
      bookingDate: req.body.bookingDate,
      bookingTime: req.body.bookingTime,
      userName: req.body.userName,
    });

    if (isbookingExist.length !== 0) {
      res.status(200).json({
        status: true,
        message: "data is here",
        data: isbookingExist[0],
      });
      console.log("isbookingExist if statement isbookingExist", isbookingExist);
      const datacheckasd = await Booking.find({
        bookingDate: req.body.bookingDate,
        bookingTime: req.body.bookingTime,
        spaceId: req.body.spaceId,
      });
      const datagetfromspace = await Space.find({ name: req.body.spaceName });
      console.log("datagetfromspace", datagetfromspace);
      let datatest = datagetfromspace[0].pickDate;
      const datagetfromspacess = datatest.filter(
        (item) => item?.dateofAvailibilty === req.body.bookingDate
      );
      console.log(
        "datagetfromspacess before ",
        datagetfromspacess[0].timeslots
      );
      const datfiltertime = datagetfromspacess[0].timeslots.map((item) => {
        if (
          item.timevalue === req.body.bookingTime &&
          item.dateofbooking !== null
        ) {
          return {
            ...item,
            isBooked: false,
            userName: null,
            dateofbooking: null,
          };
        } else {
          return item;
        }
      });
      console.log("datagetfromspacess datagetfromspacess", datagetfromspacess);
      console.log("datfiltertime datfiltertime", datfiltertime);

      const dataspacegetobj = {
        dateofAvailibilty: datagetfromspacess[0].dateofAvailibilty,
        timeslots: datfiltertime,
      };
      console.log(
        "dataspacegetobj dataspacegetobj",
        dataspacegetobj,
        "datatest",
        datatest
      );
      let datattestes = datatest?.map((item) => {
        if (item?.dateofAvailibilty === req.body.bookingDate) {
          return {
            ...item,
            timeslots: datfiltertime,
          };
        } else {
          return item;
        }
      });
      console.log("datattestes datattestes", datattestes);
      console.log(
        "datagetfromspace._id datagetfromspace._id",
        datagetfromspace
      );

      const findbyiddata = await Space.findByIdAndUpdate(
        { _id: datagetfromspace[0]._id },
        {
          pickDate: datattestes,
        }
      );
      await findbyiddata.save();
    } else {
      res.status(400).json({
        status: false,
        message: "data not found",
        // data: datacheckasd,
      });
      console.log(
        "isbookingExist if else statement isbookingExist",
        isbookingExist
      );
    }

    console.log("isbookingExist isbookingExist", isbookingExist);
  } catch {}
});

router.patch("/updatebooking", async (req, res) => {
  try {
    // console.log("req.body  ==== ", req.body);
    const { datatest } = req.body;
    let data = null;
    let remove = null;

    for (let i = 0; i < datatest.length; i++) {
      data = await Booking.findByIdAndUpdate(
        { _id: datatest[i]._id },
        {
          status: datatest[i].status,
        }
      );

      // console.log("data data == ", data);
    }

    await data.save();
    res.status(200).json({
      status: true,
      message: "Updated Sucessfully",
      // data: dataget,
    });

    // for (let j = 0; j < dupilicated?.length; j++) {
    //   remove = await Booking.findByIdAndDelete({ _id: dupilicated[j]._id });
    // }
    // console.log("remove ====", remove);

    // let booking = await Booking.find({
    //   bookingDate: {
    //     $lt: new Date(),
    //   },
    // });
    // console.log("booking ", booking);

    // const dataget = await Booking.mapReduce(())
    // const degetd;
    // let dategetupdate = [];

    // for (let i = 0; i < datatest?.length; i++) {
    //   console.log("datatest ====", datatest[i]);
    //   dategetupdate = await Booking.updateMany(
    //     {
    //       bookingDate: datatest[i].bookingDate,
    //       bookingTime: datatest[i].bookingTime,
    //       userName: datatest[i].userName,
    //       spaceName: datatest[i].spaceName,
    //       spacePrice: datatest[i].spacePrice,
    //       spaceImage: datatest[i].spaceImage,
    //       status: datatest[i].status,
    //     },
    //     { _id: datatest[i]._id }
    //   );
    // }
    // console.log("dategetupdate dategetupdate", dategetupdate);

    // let dataget = await Booking.find();
    // console.log("dataget", dataget);

    // console.log("datatest datatest =====", datatest);

    // let datafrommap = dataget.map((item) => {
    //   console.log("item data", item);
    //   let datagetSpaces = findOne({ _id: item.space });
    //   console.log("datagetSpaces", datagetSpaces);
    // });
    // res.status(200).json({
    //   status: true,
    //   message: "data is here",
    //   data: dataget,
    // });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      Error_Message: error,
    });
  }
});
router.patch("/update/:bookingInvoiceNumber", async (req, res) => {
  try {
    // console.log("req.body  ==== ", req.body);
    const { datatest } = req.body;
    let data = null;
    let remove = null;
    let book = await Booking.find({
      bookingInvoiceNumber: req.params.bookingInvoiceNumber,
    });
    for (let i = 0; i < book.length; i++) {
      data = await Booking.findByIdAndUpdate(
        { _id: book[i]._id },
        {
          paymentStatus: "Cancelled",
        }
      );

      // console.log("data data == ", data);
    }

    await data.save();
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
// const myFunction = (e) => {
//   var yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
//   var SpecialToDate = e;

//   console.log("SpecialToDate SpecialToDate", SpecialToDate);

//   var tommorrw = moment().add(1, "day").format("YYYY-MM-DD");
//   console.log(tommorrw, "tommorrw", SpecialToDate);
//   if (moment(SpecialToDate, "YYYY-MM-DD", true).isAfter(yesterday)) {
//     if (moment(SpecialToDate, "YYYY-MM-DD", true).isBefore(tommorrw)) {
//       console.log("date is today ");
//       return "Upcoming";
//     } else {
//       console.log("date is today or in future");

//       return "Upcoming";
//     }
//   } else {
//     console.log("date is in the past");
//     return "Previous";
//   }
// };

// cron.schedule("*/3 * * * * *", async () => {

cron.schedule("*/3 * * * * *", async () => {
  // console.log("noew review is true");
  let data = null;

  let currentdate = new Date();

  // sdfd;
  // console.log("currentdate currentdate", currentdate);
  let chnagefortmate = moment(currentdate).format("DD/MM/YYYY");
  // console.log("chnagefortmate chnagefortmate", chnagefortmate);
  let splitMonth = chnagefortmate.split("/")[1];
  // console.log("splitMonth splitMonth", splitMonth);
  let splitdate = chnagefortmate.split("/")[0];
  // console.log("splitdate splitdate", splitdate);

  // console.log("chnagefortmate chnagefortmate =====", chnagefortmate);

  let daatagetdf = await Booking.find();

  let dataget = daatagetdf;
  // console.log("dataget ===", dataget);

  for (let i = 0; i < dataget.length; i++) {
    // console.log("dataget ===", dataget[i]);
    let splitd = dataget[i]?.bookingDate.split("/")[0];

    splitd = splitd < 10 ? `0${splitd}` : splitd;

    let splitM = dataget[i]?.bookingDate.split("/")[1];
    // console.log("splitM ===", splitM, "splitMonth=====", splitMonth);

    // console.log("splitM ===", splitM, "splitMonth=====", splitMonth);

    if (splitd === splitdate && splitM === splitMonth) {
      // console.log(
      //   "if statement  truesdafsdfgsdfgdf ===",
      //   splitd === splitdate && splitM === splitMonth
      // );
      // return dataget[i].status = "Upcoming" ;
      dataget[i].status = "Upcoming";
    } else if (splitd > splitdate && splitM >= splitMonth) {
      // console.log(
      //   "if statement ssdsdsddscxs",
      //   splitd > splitdate && splitM >= splitMonth
      // );
      dataget[i].status = "Upcoming";
      // return;
    } else {
      dataget[i].status = "Previous";
    }
  }
  // console.log("dataget dataget aftere chnagesdfd =====", dataget);
  for (let i = 0; i < dataget.length; i++) {
    // console.log("dataget[i] dataget[i] ========", dataget[i]);

    data = await Booking.findByIdAndUpdate(
      { _id: dataget[i]._id },
      {
        status: dataget[i].status,
      }
    );

    // console.log("data data == ", data);
  }
  await data.save();
  // console.log("currentTime currentTime", currentTime);

  // console.log("data data ========", data);
});

module.exports = router;
