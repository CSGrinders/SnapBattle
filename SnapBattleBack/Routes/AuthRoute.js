/*
 * AuthRoute.js
 *
 * This routing module manages authentication processes.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {AuthenticateOrSignUp} = require("../Controllers/Auth/AuthController");
const router = require("express").Router();


router.post("/", AuthenticateOrSignUp);

module.exports = router;