import express from 'express'
import ExcelJS from "exceljs";
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

const URL = process.env.FRONTEND_URL
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


app.post("/submitscore/bulk", authMiddleware, async (req, res) => {
  try {
    const { students, group } = req.body;

    // 🔴 ROLE CHECK
    if (!req.judgeId) {
      return res.status(403).json({
        status: "error",
        message: "Access denied: Only judges can submit scores"
      });
    }

    const judgeId = req.judgeId;

    // ✅ validations
    if (!group) {
      return res.status(400).json({
        status: "error",
        message: "Group required"
      });
    }

    if (!students || students.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No students data"
      });
    }

    // 🧠 helper
    const calculatePoseTotal = (pose) => {
      return Object.entries(pose)
        .filter(([_, val]) => typeof val === "number")
        .reduce((sum, [, val]) => sum + val, 0);
    };

    const results = [];
    const duplicates = [];

    for (let s of students) {
      const { studentId, poseScores } = s;

      if (!studentId || !poseScores) continue;

      // 🔒 duplicate check
      const exists = await Score.findOne({ judgeId, studentId, group });

      if (exists) {
        duplicates.push(studentId);
        continue; // 🔥 IMPORTANT: skip only this student
      }

      // 🧠 pose processing
      const poseScoresWithTotal = poseScores.map(pose => {
        const isDrop = pose.drop === true;

        if (isDrop) {
          return {
            ...pose,
            drop: true,
            poseTotal: 0
          };
        }

        const poseTotal = calculatePoseTotal(pose);

        return {
          ...pose,
          drop: false,
          poseTotal
        };
      });

      // 🧮 final total
      const finalTotal = poseScoresWithTotal.reduce(
        (sum, p) => sum + p.poseTotal,
        0
      );

      // 💾 save
      const score = new Score({
        judgeId,
        studentId,
        group,
        poseScores: poseScoresWithTotal,
        finalTotal
      });

      await score.save();

      results.push({
        studentId,
        finalTotal
      });
    }

    // 🎯 RESPONSE (important)
    res.json({
      status: "success",
      message: "Bulk scoring completed",
      saved: results,
      duplicates: duplicates
    });

  } catch (err) {
    console.error("Bulk Save Error:", err);
    res.status(500).json({
      status: "error",
      message: "Bulk save failed"
    });
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
    const group = req.params.group;

    const entries = await Score.find({ studentId, group });

    if (!entries || entries.length === 0) {
      return res.json({ message: "No scores found", total: 0 });
    }

    // 🔥 collect all judge scores
    const scores = entries.map(e => e.finalTotal);

    let combinedTotal = 0;

    if (scores.length > 2) {
      const sorted = [...scores].sort((a, b) => a - b);

      // remove lowest & highest
      const trimmed = sorted.slice(1, -1);

      combinedTotal = trimmed.reduce((sum, v) => sum + v, 0);
    } else {
      // fallback
      combinedTotal = scores.reduce((sum, v) => sum + v, 0);
    }

    const submittedCount = await Score.countDocuments({ studentId, group });

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
});

app.get("/export", async (req, res) => {
  try {
    const data = await Score.find({}, { _id: 0, __v: 0 }).lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Yoga Scores");

    // 🔥 HEADER
    const headers = [
      "Judge ID",
      "Student ID",
      "Group",
      "Total Drops",
      "Final Score"
    ];

    // Add pose headers dynamically
    for (let i = 1; i <= 5; i++) {
      headers.push(
        `Pose ${i} Drop`,
        `Pose ${i} Total`,
        `Pose ${i} Accuracy`,
        `Pose ${i} Stability`,
        `Pose ${i} Hold`,
        `Pose ${i} Flow`,
        `Pose ${i} Expression`,
        `Pose ${i} Breath`,
        `Pose ${i} Focus`,
        `Pose ${i} Sequence`,
        `Pose ${i} Composure`,
        `Pose ${i} Dress`,
        `Pose ${i} Overall`
      );
    }

    worksheet.addRow(headers);

    // 🎨 HEADER STYLE
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // 📊 DATA
    data.forEach(d => {
      const poses = d.poseScores || [];

      const row = [
        d.judgeId || "N/A",
        d.studentId,
        d.group,
        poses.filter(p => p?.drop).length,
        d.finalTotal || 0
      ];

      for (let i = 0; i < 5; i++) {
        const pose = poses[i] || {};
        const isDrop = pose.drop === true;

        row.push(
          isDrop ? "Yes" : "No",
          pose.poseTotal ?? 0,
          pose.accuracy ?? 0,
          pose.stability ?? 0,
          pose.holdDuration ?? 0,
          pose.aestheticFlow ?? 0,
          pose.facialExpression ?? 0,
          pose.breathControl ?? 0,
          pose.mindfulness ?? 0,
          pose.sequence ?? 0,
          pose.yogicComposure ?? 0,
          pose.dressCode ?? 0,
          pose.overallPerformance ?? 0
        );
      }

      const addedRow = worksheet.addRow(row);

      // 🎨 CONDITIONAL STYLING
      addedRow.eachCell((cell, colNumber) => {
        // Highlight Drops
        if (cell.value === "Yes") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF9999" } // red
          };
        }
        if (cell.value === "No") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "00FF00" } // green
          };
        }

        // Highlight high scores
        if (typeof cell.value === "number" && cell.value >= 8) {
          cell.font = { bold: true };
        }
      });
    });

    // 📏 AUTO WIDTH
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // ❄️ FREEZE HEADER
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // 📤 SEND FILE
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Yoga_Scoring.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel export failed" });
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

    const data = await Score.find({ group });

    const map = {};

    data.forEach(entry => {
      const id = entry.studentId;

      if (!map[id]) {
        map[id] = {
          studentId: id,
          totalScore: 0,
          judges: [],
          submitted: 0
        };
      }

      map[id].totalScore += entry.finalTotal;
      map[id].judges.push(entry.judgeId);
      map[id].submitted += 1;
    });

    // convert to array
    let result = Object.values(map);

    // 🔥 sort by score
    result.sort((a, b) => b.totalScore - a.totalScore);

    // 🏆 add rank
    result = result.map((s, i) => ({
      ...s,
      rank: i + 1
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
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
