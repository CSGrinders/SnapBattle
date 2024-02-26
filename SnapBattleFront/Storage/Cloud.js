const {EXPO_PUBLIC_API_URL,} = process.env;

import axios from "axios";

let imageUrl = '';

export function saveImageToCloud(userID, imageUri) {
    return new Promise((resolve, reject) => {
        fetch(imageUri)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    axios.post(
                        `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/upload-photo`,
                        { base64data: base64data }
                    )
                        .then(res => {
                            console.log("SaveImageToCloud: Image uploaded correctly -> ", res.data);
                            resolve(res); // Resolve the promise with the response
                        })
                        .catch(error => {
                            console.error("SaveImageToCloud: error while uploading image -> ", error);
                            reject(error); // Reject the promise with the error
                        });
                };
            })
            .catch(error => {
                console.error("SaveImageToCloud: ", error);
                reject(error); // Reject the promise if fetching image fails
            });
    });
}

export async function getProfilePhoto(userID) {
    try {
        const response = await axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/profile/get-photo`
        );
        return response.data;
    } catch (error) {
        console.log("return default / SaveImageToCloud: Error fetching profile photo -> ", error);
        return {url: 'default'};
    }
}

export async function setProfileImageCache(url) {
    imageUrl = url;
}

export async function getProfileImageCache() {
    return imageUrl;
}