import * as SecureStore from "expo-secure-store";

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