/*
 * Firebase.js
 *
 * This configuration file initializes Firebase.
 *
 * @SnapBattle, 2024
 * Author: CSGrinders
 *
 */

const {initializeApp} = require("firebase/app");
const {getStorage, uploadBytes, ref} = require("firebase/storage");
require("dotenv").config();
const {
    EXPO_PUBLIC_KEY,
    EXPO_PUBLIC_DOMAIN,
    EXPO_PUBLIC_PROJECT_ID,
    EXPO_PUBLIC_BUCKET,
    EXPO_PUBLIC_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_APPID} = process.env

const firebaseConfig = {
    apiKey: EXPO_PUBLIC_KEY,
    authDomain: EXPO_PUBLIC_DOMAIN,
    projectId: EXPO_PUBLIC_PROJECT_ID,
    storageBucket: EXPO_PUBLIC_BUCKET,
    messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: EXPO_PUBLIC_APPID,
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
module.exports = storage;