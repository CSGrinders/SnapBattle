import {View} from "react-native";
import {Camera, CameraType, getCameraPermissionsAsync, requestCameraPermissionsAsync} from "expo-camera";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import {useEffect, useState} from "react";

function SubmissionCamera() {
    const isFocused = useIsFocused()
    const [permission, setPermission] = useState(false)


    const requestPermissions = async () => {
        console.log("Requesting camera permission");
        const perm = await Camera.requestCameraPermissionsAsync();

        if (perm && perm.granted !== true) {
            console.log("Not allowed to access camera");
        }
        else {
            console.log("Allowed to use camera")
        }

        setPermission(perm.granted);
    }

    useFocusEffect(() => {
        requestPermissions()
    });



    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {isFocused && permission ?
                (<Camera type={CameraType.back} style={{width: '100%', height: '100%'}} />)
                :
                (<></>)
            }
        </View>
    );
}

export default SubmissionCamera