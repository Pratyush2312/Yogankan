import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()
const secretKey = process.env.JWT_SECRET

export default function authMiddleware(req,res,next){
    const token=req.cookies.token||req.cookies.admin_token
    if(!token){
        return res.status(401).json({message:"No token found"})
    }
    try{
        const decoded=jwt.verify(token,secretKey)
        if (decoded.judgeId) req.judgeId = decoded.judgeId;
        if (decoded.adminId) req.adminId = decoded.adminId;
        next()
    }
    catch(err){
        return res.status(403).json({message:"Invalid token"})
    }
}