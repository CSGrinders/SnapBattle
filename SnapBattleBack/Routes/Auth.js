/*
 * Auth.js
 *
 * API routes to get signed in/up.
 *
 * @SnapBattle, 2024
 */

const {SignIn, SignUp, Auth, AuthenticateOrSignUp} = require("../Controllers/Auth/Auth");
const router = require("express").Router();


/**
 * Handle user signup and login routes.
 */
router.post("/", AuthenticateOrSignUp);

module.exports = router