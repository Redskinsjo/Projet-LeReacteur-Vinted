const express = require("express");
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const Router = express.Router();
// Not used yet
const cloudinary = require("cloudinary");

Router.post("/user/signup", async (req, res) => {
    const { username, email, password, phone } = req.fields;

    try {
        if (username && email && password) {
            const userFound = await User.findOne({ email });

            if (!userFound) {
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

                // However the user can't upload a picture on signup yet
                if (Object.keys(req.files) > 0) {
                    const pictureToUpload = req.files.picture.path;
                    const result = await cloudinary.uploader.upload(
                        pictureToUpload
                    );
                    newUser.account.avatar = result;
                }
                // ----------------------------------

                await newUser.save();
                res.status(200).json({
                    _id: newUser._id,
                    token: newUser.token,
                    account: newUser.account,
                    email: newUser.email,
                });
            } else {
                res.status(400).json({
                    error: {
                        message:
                            "A user with this email address already exists",
                    },
                });
            }
        } else {
            res.status(400).json({
                error: {
                    message:
                        "These fields should be present: username, email, password",
                },
            });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

Router.post("/user/login", async (req, res) => {
    const { email, password } = req.fields;

    try {
        if (email && password) {
            const userFound = await User.findOne({ email });
            if (userFound) {
                const { salt, hash } = userFound;
                const identified =
                    SHA256(password + salt).toString(encBase64) === hash;
                if (identified) {
                    res.status(200).json({
                        _id: userFound._id,
                        token: userFound.token,
                        account: userFound.account,
                    });
                } else {
                    res.status(401).json({
                        error: { message: "Unauthorized" },
                    });
                }
            } else {
                res.status(400).json({
                    error: {
                        message: "No user exist with this email address",
                    },
                });
            }
        } else {
            res.status(400).json({ error: { message: "Missing credentials" } });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
});

module.exports = Router;
