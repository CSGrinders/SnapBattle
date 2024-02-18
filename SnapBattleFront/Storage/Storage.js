import * as SecureStore from "expo-secure-store";
import axios from "axios";

/**
 * These methods will allow to retrieve data from the device
 * that was saved when the user signed in or up
 */


export async function saveUserInfo(key, value) {
    await SecureStore.setItemAsync(key, value);
}

export async function getUserInfo(key) {
    let info  = await SecureStore.getItemAsync(key);
    if (info) {
        return info;
    } else {
        return null;
    }
}

export async function deleteUserInfo(key) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.log(error);
    }
}

//Set User Header Verification
export async function setAuthToken(token) {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}
