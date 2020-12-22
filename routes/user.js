const express = require("express");
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const Router = express.Router();
const cloudinary = require("cloudinary");

Router.post("/user/signup", async (req, res) => {
    const body = req.fields;

    if (!body.username) {
        res.status(400).json({ error: { message: "Missing username" } });
    } else if (!body.email) {
        res.status(400).json({ error: { message: "Missing an email" } });
    } else if (!body.password) {
        res.status(400).json({ error: { message: "Missing a password" } });
    } else {
        const { email, username, phone, password } = body;

        try {
            const oneUser = await User.findOne({ email });

            if (!oneUser) {
                const token = uid2(64);
                const salt = uid2(64);
                const hash = SHA256(password + salt).toString(encBase64);
                const newUser = new User({
                    email,
                    account: {
                        username,
                        phone,
                        avatar: Object,
                    },
                    token,
                    salt,
                    hash,
                });
                if (Object.keys(req.files) > 0) {
                    const pictureToUpload = req.files.picture.path;
                    const result = await cloudinary.uploader.upload(
                        pictureToUpload
                    );
                    newUser.account.avatar = result;
                }
                await newUser.save();
                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: newUser.account,
                    email: newUser.email,
                });
            } else {
                res.status(400).json({
                    error: { message: "Email address is already taken" },
                });
            }
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }
});

Router.post("/user/login", async (req, res) => {
    const { email, password } = req.fields;

    try {
        if (email && password) {
            const userSearched = await User.findOne({ email });
            if (userSearched) {
                const { salt, hash } = userSearched;
                const identified =
                    SHA256(password + salt).toString(encBase64) === hash;
                if (identified) {
                    res.status(200).json({
                        _id: userSearched._id,
                        token: userSearched.token,
                        account: userSearched.account,
                    });
                } else {
                    res.status(401).json({
                        error: { message: "Unauthorized" },
                    });
                }
            } else {
                res.status(400).json({ error: { message: "User not found" } });
            }
        } else {
            res.status(400).json({ error: { message: "Missing credentials" } });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

module.exports = Router;
