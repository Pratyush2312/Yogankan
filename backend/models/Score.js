import mongoose from "mongoose"
const PoseSchema = new mongoose.Schema({
    accuracy: Number,
    stability: Number,
    holdDuration: Number,
    aestheticFlow: Number,
    facialExpression: Number,
    breathControl: Number,
    mindfulness: Number,
    yogicComposure: Number,
    dressCode: Number,
    overallPerformance: Number,
    poseTotal:Number,
    drop:{type:Boolean, default:false}
})
const ScoreSchema = new mongoose.Schema({
    judgeId: String,
    studentId: Number,
    group: String,
    drop: String,
    poseScores: [PoseSchema],
    finalTotal: Number
});

export const Score = mongoose.model('Score', ScoreSchema)