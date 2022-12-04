const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({
 

   
  TimeSlots: [
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
  
});

const TimeSlot = mongoose.model("timeSlot", TimeSlotSchema);

module.exports.TimeSlot = TimeSlot;
