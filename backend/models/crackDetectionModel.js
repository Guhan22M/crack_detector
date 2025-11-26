const mongoose = require('mongoose');
const crackDetectionSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  crackDetails: {
    length: {
      type: Number,
      required: false,
    },
    width: {
      type: Number,
      required: false,
    },
    severity: {
      type: String,
    },
  },
  solution: {
    type: String,
  },
  prediction:{
    type: String,
  },
  confidence:{
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true,
  },
});


module.exports = mongoose.model("CrackDetection", crackDetectionSchema);