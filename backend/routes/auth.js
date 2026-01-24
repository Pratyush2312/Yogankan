import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { Judge } from '../models/Judge.js'
import { Admin } from '../models/Admin.js'
const router = express.Router()
dotenv.config()
const secretKey = process.env.JWT_SECRET
const expiresIn = process.env.JWT_EXPIRES
router.post('/login', async (req, res) => {
    const { judgeId, password } = req.body
    const judge = await Judge.findOne({ judgeId })
    if (!judge || judge.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ judgeId }, secretKey, { expiresIn: expiresIn })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true, 
        maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({
        status: 'success',
        judgeId,
        role: "judge",
    })
})

router.post('/admin/login', async (req, res) => {
    const { adminId, password } = req.body
    const admin = await Admin.findOne({ adminId })
    if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" })
    }
    const token = jwt.sign(
        { adminId },
        secretKey,
        { expiresIn: "12h" }
    );
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000 
    });
    res.json({
        status: 'success',
        adminId,
        role: "admin",
    })
})

export default router