const {EXPO_PUBLIC_API_URL,} = process.env;

import axios from "axios";

let imageUrl = '';

export function saveImageToCloud(userID, base64data) {
    axios.post(
        `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/upload-photo`,
        { base64data: base64data }
    )
        .then(res => {
            console.log("SaveImageToCloud: Image uploaded correctly -> ", res.data);
            setProfileImageCache(res.data.url);

        })
        .catch(error => {
            console.error("SaveImageToCloud: error while uploading image -> ", error);
        });
}

export async function getProfilePhoto(userID) {
    try {
        console.log("getProfilePhoto start:", userID);
        const response = await axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/get-photo`
        );
        return response.data;
    } catch (error) {
        console.log("return default / SaveImageToCloud: Error fetching profile photo -> ", error);
        return {url: 'default'};
    }
}

export function setProfileImageCache(url) {
    imageUrl = url;
}

export function getProfileImageCache() {
    return imageUrl;
}