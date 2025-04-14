import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });


// SignUp
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({message:"All fields required."});
    }

    const existingUser = await User.findOne({ email });
    if(existingUser) return res.status(400).json({message:"User Already exists !!!"});

    const user = await User.create({ name, email, password});

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
})


// Login
router.post("/login", async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      Status: "LoggedIn Successfully !!!",
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
})


export default router;