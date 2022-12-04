var moment = require("moment");
const { Booking } = require("../models/Book");

const CheckDataIs = (e) => {
  var yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
  var SpecialToDate = e;

  var tommorrw = moment().add(1, "day").format("YYYY-MM-DD");
  console.log(tommorrw, "tommorrw", SpecialToDate);
  if (moment(SpecialToDate, "YYYY-MM-DD", true).isAfter(yesterday)) {
    if (moment(SpecialToDate, "YYYY-MM-DD", true).isBefore(tommorrw)) {
      console.log("date is today ");
      return "Today";
    } else {
      console.log("date is today or in future");

      return "Upcoming";
    }
  } else {
    console.log("date is in the past");
    return "Previous";
  }
};

const getDataUpdate = async (dataget) => {
  let datatest = await dataget.map(async (item) => {
    console.log("item item === ", item);
    const findid = await Booking.findByIdAndUpdate({ _id: item._id }, { item });
    // return {
    //   ...item,
    //   status: CheckDataIs(moment(item?.bookingDate).format("YYYY-DD-MM")),
    // };
  });
  console.log("datatest datatest", datatest);
};

const getCheckFilter = async (allSpacedata, date, temptime, location) => {
  console.log(
    "allSpacedata allSpacedata ==== sad",
    allSpacedata?.length,
    allSpacedata
  );
  if (
    date !== "" ||
    temptime !== "" ||
    (location !== "" && location !== "City")
  ) {
    console.log("check data in id or not ");
    let datachangedata = allSpacedata
      .filter((item) => {
        if (location !== "") {
          return item.name.includes(location) && item;
        } else {
          return item;
        }
      })
      .map((item2) => {
        return {
          ...item2,
          pickDate: item2.pickDate
            .filter((item3) => {
              if (date !== "") {
                return (
                  item3.dateofAvailibilty === moment(date).format("DD/MM/YYYY")
                );
              } else {
                return item3;
              }
            })
            .map((item4) => {
              return {
                ...item4,
                timeslots: item4.timeslots.filter((item5) => {
                  if (temptime !== "") {
                    return (
                      item5.timevalue.split(" ").join("") ===
                      temptime.split(" ").join("")
                    );
                  } else {
                    return item5;
                  }
                }),
              };
            }),
        };
      });
    console.log(
      "datachangedata datachangedata",
      "datachangedatalength",
      datachangedata?.length,
      datachangedata,
      "sapce length",
      allSpacedata?.length
    );
  } else {
    return allSpacedata;
  }
  // datachangedata = datachangedata
  // ?.filter((item) => {
  //   if (location !== "") {
  //     return item?.name.includes(location) && item;
  //   } else {
  //     return item;
  //   }
  // })
  // ?.map((item2) => {
  //   return {
  //     ...item2,
  //     pickDate: item2?.pickDate
  //       ?.filter((item3) => {
  //         if (date !== "") {
  //           return (
  //             item3?.dateofAvailibilty ===
  //             moment(date)?.format("DD/MM/YYYY")
  //           );
  //         } else {
  //           return item3;
  //         }
  //       })
  //       ?.map((item4) => {
  //         return {
  //           ...item4,
  //           timeslots: item4?.timeslots?.filter((item5) => {
  //             if (temptime !== "") {
  //               return (
  //                 item5?.timevalue?.split(" ")?.join("") ===
  //                 temptime?.split(" ")?.join("")
  //               );
  //             } else {
  //               return item5;
  //             }
  //           }),
  //         };
  //       }),
  //   };
  // });

  // let datacost = datachangedata
  // ?.filter((item) => item?.pickDate?.length !== 0)
  // ?.map((item2) => {
  //   return {
  //     ...item2,
  //     pickDate: item2?.pickDate?.filter(
  //       (item3) => item3?.timeslots?.length !== 0
  //     ),
  //   };
  // })
  // ?.filter((item4) => item4?.pickDate?.length !== 0);
  try {
  } catch (error) {
    console.log("error error", error);
  }
};

module.exports.CheckDataIs = CheckDataIs;
module.exports.getCheckFilter = getCheckFilter;

module.exports.CheckDataIs = CheckDataIs;
