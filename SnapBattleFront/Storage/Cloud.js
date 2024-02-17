// import { initializeApp } from "firebase/app";
// import { getStorage, uploadBytes, ref} from "firebase/storage";
//
// const app = initializeApp(firebaseConfig);
//
// const storage = getStorage(app);
//
const {
    EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_KEY,
    EXPO_PUBLIC_DOMAIN,
    EXPO_PUBLIC_PROJECT_ID,
    EXPO_PUBLIC_BUCKET,
    EXPO_PUBLIC_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_APPID} = process.env
//
// const firebaseConfig = {
//     apiKey: EXPO_PUBLIC_KEY,
//     authDomain: EXPO_PUBLIC_DOMAIN,
//     projectId: EXPO_PUBLIC_PROJECT_ID,
//     storageBucket: EXPO_PUBLIC_BUCKET,
//     messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
//     appId: EXPO_PUBLIC_APPID,
// };

import axios from "axios";

export const saveImageToCloud = async (userID, imageUri) => {
    console.log(`${EXPO_PUBLIC_API_URL}`)
    console.log(imageUri)
    //const image = await fetch(imageUri)
    const blob = await fetch(imageUri)
        .then((image) => {
            return image.blob()
        })
    console.log(blob)

    // {
    //     headers: {
    //         'Content-Type': `multipart/form-data`,
    //     },
    // }

    axios.post(
        `${EXPO_PUBLIC_API_URL}/user/profile/upload-photo`,
        {
            userID: userID,
            blob: blob
        }
        // /*,{
        //     headers: {
        //         'Content-Type': `multipart/form-data`,
        //     },
        // }
        //  */
    ).then(
        (res) => {

        }
    ).catch(
        (error) => {

        }
    )
};