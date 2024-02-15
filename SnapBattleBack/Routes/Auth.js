/*
 * Auth.js
 *
 * API routes to get signed in/up.
 *
 * @SnapBattle, 2024
 */

const {SignIn, SignUp, Auth} = require("../Controllers/Auth/Auth");
const router = require("express").Router();


/**
 * Handle user signup and login routes.
 */
router.post("/auth/signin", SignIn)
router.post("/auth/signup", SignUp)
router.post("/", Auth);

module.exports = router