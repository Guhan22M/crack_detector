const CrackDetection = require('../models/crackDetectionModel');
const axios = require('axios');
const asyncHandler = require('express-async-handler')

const analyzeAndSaveCrack = asyncHandler(async (req, res) => {
  const { imageUrl, description } = req.body;

  // const ec2Response = await axios.post("http://<EC2-IP>/predict", {
  //   imageUrl,
  //   description,
  // });
  const ec2Response = { 
    data: {
      length: "3",
      width: "1",
      severity: "Medium",
      solution: "No problem in this crack"
    }
  };  

  const { length, width, severity, solution } = ec2Response.data;

  const crack = new CrackDetection({
    imageUrl,
    description,
    crackDetails: {
      length,
      width,
      severity,
    },
    solution,
    user: req.user._id,
  });

  const savedCrack = await crack.save();
  res.status(201).json(savedCrack);
});

const getCracksByUser = asyncHandler(async(req, res)=>{
  // const {userId} = req.params;

  const cracks = await CrackDetection.find({user:req.user._id}).sort({createdAt:-1});
  res.status(200).json(cracks);
})

const deleteCrack = asyncHandler(async (req, res) => {
  const crack = await CrackDetection.findById(req.params.id);
  if (!crack) {
    res.status(404);
    throw new Error("Crack not found");
  }
  if(crack.user.toString() !==req.user._id.toString()){
    res.status(401);
    throw new Error("Not authorized to delete this crack");
  }
  await crack.deleteOne();
  res.status(200).json({ message: "Crack deleted" });
});


module.exports = {
  analyzeAndSaveCrack, getCracksByUser, deleteCrack
};
