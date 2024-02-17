import { initializeApp } from "firebase/app";
import { getStorage, uploadBytes, ref} from "firebase/storage";
const {
    EXPO_PUBLIC_KEY,
    EXPO_PUBLIC_DOMAIN,
    EXPO_PUBLIC_PROJECT_ID,
    EXPO_PUBLIC_BUCKET,
    EXPO_PUBLIC_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_APPID} = process.env

const firebaseConfig = {
    EXPO_PUBLIC_KEY,
    apiKey: EXPO_PUBLIC_KEY,
    authDomain: EXPO_PUBLIC_DOMAIN,
    projectId: EXPO_PUBLIC_PROJECT_ID,
    storageBucket: EXPO_PUBLIC_BUCKET,
    messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: EXPO_PUBLIC_APPID,
};

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

export const saveImageToCloud = async (imageUri) => {
    try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = imageUri.substring(imageUri.lastIndexOf('/')+1);
        const imageRef = await ref(storage, `profileImage/${fileName}`);
        console.log(imageRef, blob);
        await uploadBytes(imageRef, blob);

        alert('Image uploaded successfully.');
    } catch (error) {
        alert('Error uploading image: ' + error.message);
    }
};