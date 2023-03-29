const mongoose = require("mongoose");

const ScheduleTimeSlotSchema = new mongoose.Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "space",
  },
  scheduleSlots: [
    {
      currentDate: String,
      endTime: String,
      startTime: String,
      endType: Number,
      endDate: String,
      repeatEvery: Number,
      repeatType: Number,
      endCount: Number,
    },
  ],
  
});

const ScheduleTimeSlot = mongoose.model("scheduleTimeSlot", ScheduleTimeSlotSchema);

module.exports.ScheduleTimeSlot = ScheduleTimeSlot;
