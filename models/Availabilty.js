const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  pickDate: [
    {
      dateofAvailibilty: {
        type: String,
      },

      dateArray: [
        {
          isTimeSelected: {
            type: Boolean,
            default: false,
          },
          timevalue: {
            type: String,
          },
        },
      ],

     
    },
  ],
  // unConsectiveSlots: [
  //   {
  //     dateofAvailibilty: {
  //       type: String,
        
  //     },

  //     dateArray: [
  //       {
  //         isTimeSelected: {
  //           type: Boolean,
  //           default: false,
  //         },
  //         timevalue: {
  //           type: String,
  //         },
  //       },
  //     ],

     
  //   },
  // ],
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "space",
  },
});

const Availability = mongoose.model("availability", availabilitySchema);

module.exports.Availability = Availability;
