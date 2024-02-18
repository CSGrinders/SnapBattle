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
                errorMessage: "Fields missing.",
            });
        }

        if (name.length < 2 || name.length > 10) {
            return res.status(400).json({
                errorMessage: "Invalid name length. Max (2-15 Chars).",
            });
        }

        if (username.length < 2 || username.length > 8) {
            return res.status(400).json({
                errorMessage: "Invalid username length. Max (2-8 Chars).",
            });
        }

        if (password.length < 4 || password.length > 20) {
            return res.status(400).json({
                errorMessage: "Invalid password length. Max (4-20 Chars).",
            });
        }


        if (!validator.isEmail(email)) {
            return res.status(400).json({
                errorMessage: "Invalid email.",
            });
        }


        const userExists = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
        })

        if (userExists != null) {
            let errorMessage = "Account already exists.";
            if (userExists.username === username) {
                errorMessage = "Username already exists.";
            } else if (userExists.email === email) {
                errorMessage = "Email already exists.";
            }
            console.log(errorMessage)
            return res.status(409).json({
                errorMessage: errorMessage,
            });
        }


        const newUser = await User.create({ //Create new user in the MongoDb
            username: username.toLowerCase(),
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
        });

        const TOKEN_EXPIRE = 3 * 24 * 60 * 60;
        const token = await signToken(
            { userId: newUser._id.toString() }, process.env.TOKEN_KEY,
            {expiresIn: parseInt(TOKEN_EXPIRE, 10)}
        );

        await Session.create({ // Create session
            userID: newUser._id.toString(),
            token: token,
        })

        //Return object to client
        const objUser = {
            id: newUser._id.toString(),
            name: newUser.name.toLowerCase(),
            email: newUser.email.toLowerCase(),
            username: newUser.username.toLowerCase(),
        }

        return res.status(200).json({ //User Created.
            isAuthenticated: true,
            token: token,
            user: objUser
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({
            errorMessage: "Something went wrong...",
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
                errorMessage: "Fields missing.",
            });
        }

        const findUser = await User.findOne({ username: username.toLowerCase() }); //Find username in the database

        if (findUser === null) { //User does not exist.
            return res.status(401).json({
                errorMessage: "Invalid credentials.",
            });
        }

        // Compares password given by client and decrypted password stored in MongoDB
        const verifyPassword = await compare(password, findUser.password);

        if (!verifyPassword) {
            return res.status(401).json({
                errorMessage: "Invalid credentials.",
            });
        }

        // Create token
        const TOKEN_EXPIRE = 3 * 24 * 60 * 60;
        const token = await signToken(
            { userId: findUser._id }, process.env.TOKEN_KEY,
            {expiresIn: parseInt(TOKEN_EXPIRE, 10)}
        );

        const user_session = await Session.findOne({userID: findUser._id}) // Find session

        if (user_session) { //Check if it does exist the session and update the session
            await Session.findOneAndUpdate({ userID: findUser._id }, { token: token }, { new: true });
        } else {
            await Session.create({ // Create session
                userID: findUser._id.toString(),
                token: token,
            })
        }

        //Return object to client
        const objUser = {
            id: findUser._id.toString(),
            name: findUser.name.toLowerCase(),
            email: findUser.email.toLowerCase(),
            username: findUser.username.toLowerCase(),
        }

        return res.status(200).json({ //Use found.
            isAuthenticated: true,
            token: token,
            user: objUser
        });

    } catch (error) {
        res.status(500).json({
            errorMessage: "Something went wrong...",
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
        const { token } = req.body;
        console.log(token)
        if (!token) { //Token required, return null
            return res.status(400).json({
                errorMessage: "Something went wrong...",
            });
        }
        const user_session = await Session.findOne({token: token});
        if (!user_session) { //User session not found, return null
            console.log("test")
            return res.status(401).json({
                errorMessage: "Something went wrong...",
            });
        }
        const findUser = await User.findOne({ _id: user_session.userID});
        if (!findUser) { //User not found by ID, return null
            return res.status(500).json({
                errorMessage: "Something went wrong...",
            });
        }

        await verifyToken(token, process.env.TOKEN_KEY)
        console.log("Verify token")
        return res.status(200).json({ //Use found.
            isAuthenticated: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorMessage: "Something went wrong...",
        });
    }
}


module.exports.AuthenticateOrSignUp = async (req, res) => {
    const { isLogin, token, ...userData } = req.body;
    if (token) { //Check for token
        await module.exports.Auth(req, res);
        return
    }

    //Routing to Sign up or Sign in
    if (isLogin) { //SignIn
        req.body = userData; // Prepare the request body for SignIn
        await module.exports.SignIn(req, res);
    } else { //SignUp
        req.body = userData; // Prepare the request body for SignUp
        await module.exports.SignUp(req, res);
    }
};



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
            if (error) return reject(error);
            resolve(decoded);
        })
    })
}

//Verify user
module.exports.userVerification = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];
            console.log(token)
            // Verify token
            req.user = jwt.verify(token, process.env.TOKEN_KEY);
            next();
        } catch (error) {
            res.status(401).json({ errorMessage: "Something went wrong..." });
        }
    }
    if (!token) {
        res.status(401).json({ errorMessage: "Something went wrong..." });
    }
};