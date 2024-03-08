import {KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, View, Image} from "react-native";
import {Camera, CameraType, FlashMode, getCameraPermissionsAsync, requestCameraPermissionsAsync} from "expo-camera";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import {useEffect, useState} from "react";
import {Button, Text} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import CameraButton from '../../assets/take-photo.png'
import CamSwitchButton from '../../assets/cam-switch.png'
import FlashButton from '../../assets/flash.png'

function SubmissionCamera({navigation}) {
    const isFocused = useIsFocused()
    const [permission, setPermission] = useState(false)

    //camera options
    const [flash, setFlash] = useState(FlashMode.off)
    const [direction, setDirection] = useState(CameraType.back)

    //change flash mode from on->off or off->on
    function changeFlashMode() {
        if (flash === FlashMode.off) {
            setFlash(FlashMode.torch)
        }
        else {
            setFlash(FlashMode.off)
        }
    }

    //change camera direction from back->front or front->back
    function changeDirection() {
        if (direction === CameraType.back) {
            setDirection(CameraType.front)
        }
        else {
            setDirection(CameraType.back)
        }
    }


    //request camera permissions from user
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

    useEffect(() => {
        requestPermissions()
    }, []);

    if (isFocused && permission) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                enabled={false} style={{flex: 1, alignItems: "center"}}>


                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 70,
                    marginBottom: 10,
                    flex: 1
                }}>
                    <View style={{
                        paddingLeft: 15,
                        alignItems: 'flex-start'
                    }}>
                        <BackButton size={50} navigation={navigation}/>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                        <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Photo Submission</Text>
                    </View>
                </View>

                <Camera type={direction} flashMode={flash} style={{width: '100%', flex: 10}} />


                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    width: '100%',
                    flex: 3
                }}>
                    <TouchableOpacity onPress={changeFlashMode}>
                         <Image
                            source={FlashButton}
                            style={{width: 50, height: 50}}
                         />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            source={CameraButton}
                            style={{width: 50, height: 50}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={changeDirection}>
                        <Image
                            source={CamSwitchButton}
                            style={{width: 50, height: 50}}
                        />
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        )
    }
    else {
        return (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text>Allow Camera Permissions in Settings</Text>
            </View>
        )
    }
}

export default SubmissionCamera