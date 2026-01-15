import mongoose from "mongoose";
const JudgeSchema = new mongoose.Schema({
    judgeId:{
        type:'String',
        required:true,
        unique:true
    },
    password:{
        type:'String',
        required:true,
    }
})

export const Judge= mongoose.model('Judge',JudgeSchema)