import express, { json } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authMiddleware from './middleware/authmiddleware.js'
import mongoose from 'mongoose'
import { json2csv } from 'json-2-csv'
import { Score } from './models/Score.js'
const app = express()
const port = 3000
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser";

const URL=process.env.FRONTEND_URL
app.use(cookieParser());
app.use(cors({
  origin: URL, 
  credentials: true
}));
dotenv.config()
const mongoUrl = process.env.MONGO_URL

await mongoose.connect(mongoUrl)

app.use(express.json())
app.use("/auth", authRoutes)


app.post("/submitscore", authMiddleware, async (req, res) => {
  console.log("JWT Judge:", req.judgeId);

  try {
    const { studentId, poseScores, group, drop } = req.body;
    const judgeId = req.judgeId;
    // Duplicate check
    const exists = await Score.findOne({ judgeId, studentId, group });
    if (exists) {
      return res.json({
        status: "duplicate",
        message: `Score for Student ${studentId} is already submitted by Judge ${judgeId}`
      });
    }

    // Function to calculate one pose total
    const calculatePoseTotal = (pose) => {
      return Object.values(pose)
        .filter(v => typeof v === "number")
        .reduce((sum, v) => sum + v, 0);
    };

    // Add poseTotal to each pose
    const poseScoresWithTotal = poseScores.map(pose => {
      const poseTotal = calculatePoseTotal(pose);
      return {
        ...pose,
        poseTotal
      };
    });

    // Calculate final total (sum of all poseTotals)
    const finalTotal = poseScoresWithTotal.reduce(
      (sum, p) => sum + p.poseTotal,
      0
    );

    // Save to DB
    const score = new Score({
      judgeId,
      studentId,
      group,
      drop,
      poseScores: poseScoresWithTotal,
      finalTotal
    });

    await score.save();

    const submittedCount = await Score.countDocuments({ studentId });

    res.json({
      status: "success",
      message: "Score received successfully",
      judgeId,
      group,
      studentId,
      finalTotal,
      submittedCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Error saving score" });
  }
});


app.delete("/reset-scores", authMiddleware, async (req, res) => {
  try {
    await Score.deleteMany({})
    res.json({
      message: "All scores are deleted succesfully",
      status: "success"
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting scores" });
  }
})

app.get("/results/:group/:studentId", authMiddleware, async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const group = req.params.group
    const entries = await Score.find({ studentId, group });
    // const entries = await Score.find({
    //   studentId,
    //   $or: [
    //     { group },
    //     { group: { $exists: false } } // old records without group
    //   ]
    // });


    if (!entries || entries.length === 0) {
      return res.json({ message: "No scores found", total: 0 });
    }

    const combinedTotal = entries.reduce((sum, entry) => sum + entry.finalTotal, 0);
    const submittedCount = await Score.countDocuments({studentId})
    res.json({
      studentId,
      judgesCount: entries.length,
      judgeScores: entries,
      group,
      combinedTotal,
      submittedCount
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching results" });
  }
})


app.get("/export", async (req, res) => {
  try {
    const data = await Score.find({}, { _id: 0, __v: 0 }).lean();

    const formatted = data.map(d => {
      const row = {
        Judge: d.judgeId,
        StudentID: d.studentId,
        Group: d.group,
        Drop:d.drop===true||d.drop==="Yes"?"Yes":"No"
      };

      d.poseScores.forEach((pose, i) => {
        const p = i + 1;
        row[`P${p}_Accuracy`] = pose.accuracy || 0;
        row[`P${p}_Stability`] = pose.stability || 0;
        row[`P${p}_HoldDuration`] = pose.holdDuration || 0;
        row[`P${p}_AestheticFlow`] = pose.aestheticFlow || 0;
        row[`P${p}_FacialExpression`] = pose.facialExpression || 0;
        row[`P${p}_BreathControl`] = pose.breathControl || 0;
        row[`P${p}_Mindfulness`] = pose.mindfulness || 0;
        row[`P${p}_YogicComposure`] = pose.yogicComposure || 0;
        row[`P${p}_DressCode`] = pose.dressCode || 0;
        row[`P${p}_OverallPerformance`] = pose.overallPerformance || 0;
        row[`P${p}_finalScore`] = pose.poseTotal
      });

      row.FinalTotal = d.finalTotal;
      return row;
    });

    const csv = await json2csv(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("yoga_scores_5poses.csv");
    res.send(csv);

  } catch (err) {
    res.status(500).json({ message: "CSV export failed" });
  }
});



app.get("/students", authMiddleware, async (req, res) => {
  try {
    const students = await Score.distinct("studentId");

    students.sort((a, b) => a - b);

    res.json(students);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
  }
})

app.put("/admin/update", authMiddleware, async (req, res) => {
  try {
    const { judgeId, studentId, group, poseIndex, updatedPose } = req.body;

    const record = await Score.findOne({ judgeId, studentId, group });
    if (!record) {
      return res.json({ status: "error", message: "Record not found" });
    }

    const poseTotal = Object.values(updatedPose)
      .filter(v => typeof v === "number")
      .reduce((a, b) => a + b, 0);

    updatedPose.poseTotal = poseTotal;

    record.poseScores.set(poseIndex, updatedPose);

    record.finalTotal = record.poseScores.reduce(
      (sum, p) => sum + (p.poseTotal || 0),
      0
    );

    await record.save();

    res.json({
      status: "success",
      message: "Pose updated successfully",
      poseTotal,
      finalTotal: record.finalTotal
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



app.get("/students/:group", authMiddleware, async (req, res) => {
  try {
    const group = req.params.group;
    const students = await Score.distinct("studentId", { group });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching group students" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    sameSite: "None",
    secure: true
  });
  res.json({ status: "logged out" });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
