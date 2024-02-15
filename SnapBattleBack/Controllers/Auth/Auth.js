/*
 * Auth.js
 *
 * Controllers to handle user sign up and sign in
 * in the MongoDB database,
 *
 * @SnapBattle, 2024
 */

const jwt = require('jsonwebtoken');
const {User, Session} = require("../../Models/User");
const {compare} = require("bcrypt");
const {TOKEN_KEY, TOKEN_EXPIRE} = process.env
const validator = require('validator');
/**
 * Handle user signup.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.SignUp = async (req, res) => {
    try {
        const {name, username, email, password} = req.body;
        if (name === null || username === null || email === null || password === null || name === '' || username === '' || email === '' || password === '') {
            //Check for null fields or empty fields.
            return res.status(400).json({
                error: true,
                errorMessage: "Fields missing.",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        if (name.length < 2 || name.length > 10) {
            return res.status(400).json({
                error: true,
                errorMessage: "Invalid name length. Max (2-15 Chars).",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        if (username.length < 2 || username.length > 8) {
            return res.status(400).json({
                error: true,
                errorMessage: "Invalid username length. Max (2-8 Chars).",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        if (password.length < 4 || password.length > 20) {
            return res.status(400).json({
                error: true,
                errorMessage: "Invalid password length. Max (4-20 Chars).",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }


        if (!validator.isEmail(email)) {
            return res.status(400).json({
                error: true,
                errorMessage: "Invalid email.",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        const userExists = await User.findOne({ //Check if username, or email exist
            $or: [{ username: username }, { email: email }]
        })
        if (userExists) {
            let errorMessage = "Account already exists.";
            if (userExists.username === username) {
                errorMessage = "Username already exists.";
            } else if (userExists.email === email) {
                errorMessage = "Email already exists.";
            }
            return res.status(409).json({
                error: true,
                errorMessage: errorMessage,
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        const newUser = await User.create({ //Create new user in the MongoDb
            username: username,
            name: name,
            email: email,
            password: password,
        });

        const token = await signToken(
            { userId: newUser._id }, TOKEN_KEY,
            {expiresIn: parseInt(TOKEN_EXPIRE, 10)}
        );

        await Session.create({ // Create session
            userID: newUser._id,
            token: token,
        })

        return res.status(200).json({ //User Created.
            error: false,
            errorMessage: "",
            isAuthenticated: true,
            token: token,
            user: null
        });


    } catch (error) {
        res.status(500).json({
            error: true,
            errorMessage: "Something went wrong...",
            isAuthenticated: false,
            token: null,
            user: null
        });
    }
}

/**
 * Handle user signIn.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.SignIn = async (req, res) => {
    try {
        const {username, password} = req.body;
        if (username === null || password === null || username === '' || password === '') {
            //Check for null fields or empty fields.
            return res.status(400).json({
                error: true,
                errorMessage: "Fields missing.",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        const findUser = await User.findOne({username: username}); //Find username in the database

        if (findUser === null) { //User does not exist.
            return res.status(401).json({
                error: true,
                errorMessage: "Invalid credentials.",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        // Compares password given by client and decrypted password stored in MongoDB
        const verifyPassword = await compare(password, findUser.password);

        if (!verifyPassword) {
            return res.status(401).json({
                error: true,
                errorMessage: "Invalid credentials.",
                isAuthenticated: false,
                token: null,
                user: null,
            });
        }

        // Create token
        const token = await signToken(
            { userId: findUser._id }, TOKEN_KEY,
            {expiresIn: parseInt(TOKEN_EXPIRE, 10)}
        );

        const user_session = await Session.findOne({userID: findUser._id}) // Find session

        if (user_session) { //Check if it does exist the session and update the session
            await Session.findOneAndUpdate({ userID: findUser._id }, { token: token }, { new: true });
        } else {
            await Session.create({ // Create session
                userID: findUser._id,
                token: token,
            })
        }

        //Return object to client
        const objUser = {
            id: findUser._id,
            name: findUser.name,
            email: findUser.email,
        }

        return res.status(200).json({ //Use found.
            error: false,
            errorMessage: "",
            isAuthenticated: true,
            token: user_session.token,
            user: objUser
        });

    } catch (error) {
        res.status(500).json({
            error: true,
            errorMessage: "Something went wrong...",
            isAuthenticated: false,
            token: null,
            user: null
        });
    }

}

/**
 * Handle user Login user with token.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */

module.exports.Auth = async (req, res) => {
    try {
        const {token_req} = req.body;
        if (!token_req) { //Token required, return null
            return res.status(400).json({
                error: true,
                errorMessage: "Token required. Something went wrong...",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }
        const user_session = await Session.findOne({token: token_req});
        if (!user_session) { //User session not found, return null
            return res.status(401).json({
                error: true,
                errorMessage: "User account expired. Try sign in again.",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }
        const findUser = await User.findOne({ _id: user_session.userID});
        if (!findUser) { //User not found by ID, return null
            return res.status(500).json({
                error: true,
                errorMessage: "Something went wrong...",
                isAuthenticated: false,
                token: null,
                user: null
            });
        }

        //Return object to client
        const userObj = {
            id: findUser._id,
            name: findUser.name,
            email: findUser.email,
        }

        await verifyToken(token_req, TOKEN_KEY)
        return res.status(200).json({ //Use found.
            error: false,
            errorMessage: "",
            isAuthenticated: true,
            token: user_session.token,
            user: userObj
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            errorMessage: "Something went wrong...",
            isAuthenticated: false,
            token: null,
            user: null
        });
        console.error(error);
    }
}


const signToken = (payload, secret, options) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, options, (error, token) => {
            if (error) return reject(error);
            resolve(token);
        })
    })
}

const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
            if(error) return reject(error);
            resolve(decoded);
        })
    })
}