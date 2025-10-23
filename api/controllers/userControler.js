import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

import User from "../models/User.js";
import { getErrorMessage } from "../utils/errorUtils.js";

const userController = Router();

userController.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({ message: 'Invalid username of password!' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid username of password!' });
    }

    const token = jwt.sign({
        id: user.id,
        username: user.username,
    }, 'ASDASJKLDHASIKJDKASJHD', { expiresIn: '2h' });

    res.status(200).json({
        accessToken: token,
    });
});

userController.post('/register', async (req, res) => {
    const userData = req.body;

    try {
        await User.create(userData);

        res.status(204).end();
    } catch (err) {
        res.status(400).json({ message: getErrorMessage(err) });
    }
});

export default userController;
