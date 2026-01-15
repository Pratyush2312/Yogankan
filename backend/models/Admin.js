import mongoose from "mongoose"
const AdminSchema=new mongoose.Schema({
    adminId:{
        type:'String',
        unique:true,
        required:true
    },
    password:{
        type:"String",
        required:true
    }
})
export const Admin=new mongoose.model('Admin',AdminSchema) 