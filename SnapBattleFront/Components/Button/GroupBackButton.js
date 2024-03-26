import React from 'react';
import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import BackIcon from "../../assets/back-icon.webp";

const GroupBackButton = ({ size, navigation, leaveRoom, userID, groupID }) => {

    const handlePress = () => {
        leaveRoom(userID, groupID);
        navigation.goBack();
    };

    return (
        <View>
            <TouchableOpacity onPress={handlePress}>
                <Image source={BackIcon} style={{ width: size, height: size }} />
            </TouchableOpacity>
        </View>
    );
};

export default GroupBackButton;
