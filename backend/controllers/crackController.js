const CrackDetection = require('../models/crackDetectionModel');
const axios = require('axios');
const asyncHandler = require('express-async-handler')

// const analyzeAndSaveCrack = asyncHandler(async (req, res) => {
//   const { imageUrl, description } = req.body;

//   console.log("Received imageUrl:", imageUrl);

//   const ec2Response = await axios.post("https://crack-project-1.onrender.com/predict", {
//     imageUrl,
//   });
//   // const ec2Response = { 
//   //   data: {
//   //     length: "6",
//   //     width: "4",
//   //     severity: "Low",
//   //     solution: "no repair needed",
//   //     prediction: "Crack Detected",
//   //     confidence: "0.8973758554458618",
//   //   }
//   // };  

//   console.log("EC2 Response:", ec2Response.data);
  
//   const { length, width, severity, solution, prediction, confidence } = ec2Response.data;

//   const crack = new CrackDetection({
//     imageUrl,
//     description,
//     crackDetails: {
//       length,
//       width,
//       severity,
//     },
//     solution,
//     prediction,
//     confidence,
//     user: req.user._id,
//   });

//   const savedCrack = await crack.save();
//   res.status(201).json(savedCrack);
// });

const analyzeAndSaveCrack = asyncHandler(async (req, res) => {
  const { imageUrl, description } = req.body;

  // Basic validation
  if (!imageUrl || typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl)) {
    return res.status(400).json({ message: 'Invalid or missing imageUrl. Send a public http(s) URL.' });
  }

  console.log('Received imageUrl:', imageUrl);
  console.log('Description:', description ?? '');

  // Prepare payload for EC2 — adjust field name if EC2 expects different key
  // const payload = { 
  //   imageUrl,
  //   image_url: imageUrl,
  //   image: imageUrl,
  //   url: imageUrl,
  // }; 

  try {
    // Send to EC2 with timeout and accept JSON
    const ec2Response = await axios.post(
      'https://crack-project-2.onrender.com/predict',
      {image_url : imageUrl}, 
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000, // 20s
      }
    );

    console.log('EC2 Response data:', ec2Response.data);

    // destructure safely
    const { length, width, severity, solution, prediction, confidence } = ec2Response.data || {};

    // Normalize numeric mm values if EC2 returns "40.0mm"
    const normalizeMetric = (val) => {
      if (val == null) return null;
      if (typeof val === 'number') return val; // already numeric
      const s = String(val).trim();
      const num = parseFloat(s.replace(/[^\d.-]/g, ''));
      return Number.isFinite(num) ? num : s;
    };

    const crack = new CrackDetection({
      imageUrl,
      description,
      crackDetails: {
        length: normalizeMetric(length),
        width: normalizeMetric(width),
        severity,
      },
      solution,
      prediction,
      confidence,
      user: req.user._id,
    });

    const savedCrack = await crack.save();

    // Return a consistent payload with both nested and top-level fields
    const savedObj = savedCrack.toObject();
    const responsePayload = {
      ...savedObj,
      crackDetails: savedObj.crackDetails ?? {
        length: normalizeMetric(length),
        width: normalizeMetric(width),
        severity,
      },
      length: savedObj.crackDetails?.length ?? normalizeMetric(length),
      width: savedObj.crackDetails?.width ?? normalizeMetric(width),
      severity: savedObj.crackDetails?.severity ?? severity,
      prediction: prediction ?? savedObj.prediction,
      confidence: confidence ?? savedObj.confidence,
      solution: solution ?? savedObj.solution,
    };

    return res.status(201).json(responsePayload);
  } catch (err) {
    // axios errors often have err.response with status & data
    console.error('Error calling EC2:', err.message);
    if (err.response) {
      console.error('EC2 status:', err.response.status);
      console.error('EC2 response data:', err.response.data);
      // Forward EC2 error message if present.
      const ec2Msg =
        (err.response.data && (err.response.data.message || JSON.stringify(err.response.data))) ||
        `EC2 returned status ${err.response.status}`;
      return res.status(502).json({ message: `Prediction service error: ${ec2Msg}` });
    }
    // network or other error
    return res.status(500).json({ message: 'Internal server error calling prediction service.' });
  }
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
