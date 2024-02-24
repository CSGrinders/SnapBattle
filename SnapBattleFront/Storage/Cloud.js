const {
    EXPO_PUBLIC_API_URL,} = process.env

import axios from "axios";

export const saveImageToCloud = async (userID, imageUri) => {
    //const image = await fetch(imageUri)
    const image = await fetch(imageUri)
    const blob = await image.blob()

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
        const base64data = reader.result.split(',')[1]
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/upload-photo`,
            {
                base64data: base64data,
            }
        ).then(
            (res) => {

            }
        ).catch(
            (error) => {

            }
        )
    }
};

export async function getProfilePhoto(userID) {
    try {
        const response = await axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/get-photo`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching profile photo:", error);
        throw error;
    }
}