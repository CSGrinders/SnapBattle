import {KeyboardAvoidingView, Platform, Text, TouchableOpacity, View, Image} from "react-native";
import {Camera, CameraType, FlashMode} from "expo-camera";
import {useFocusEffect, useIsFocused} from "@react-navigation/native";
import {useEffect, useRef, useState} from "react";
import {Button, Overlay} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";
import CameraButton from '../../assets/take-photo.webp'
import CamSwitchButton from '../../assets/cam-switch.webp'
import FlashButton from '../../assets/flash.webp'
import * as MediaLibrary from 'expo-media-library'
import AsyncAlert from "../../Components/AsyncAlert";
import axios from "axios";
const {EXPO_PUBLIC_API_URL} = process.env;

function SubmissionCamera({route, navigation}) {
    const {userID, groupID} = route.params

    const isFocused = useIsFocused()
    const [permission, setPermission] = useState(false)

    //camera options
    const [flash, setFlash] = useState(FlashMode.off)
    const [direction, setDirection] = useState(CameraType.back)

    //camera reference
    const cameraRef = useRef(null)

    //display status for pop-up message
    const [overlayVisible, setOverlayVisible] = useState(false)

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
        const camPerm = await Camera.requestCameraPermissionsAsync();

        if (camPerm && camPerm.granted !== true) {
            console.log("Not allowed to access camera");
            return
        }
        else {
            console.log("Allowed to use camera")
        }

        const libPerm = await MediaLibrary.requestPermissionsAsync();
        if (libPerm && libPerm.granted !== true) {
            console.log("Not allowed to access media library")
            return
        }
        else {
            console.log("Allowed to access library")
        }


        setPermission(true);
    }

    async function takePhoto() {
        await cameraRef.current.takePictureAsync({
            base64: true,
            fixOrientation: true,
            skipProcessing: false,
            quality: 0,
            onPictureSaved: async (picture) => {
                //console.log(picture.uri)
                await AsyncAlert("Picture Taken", "Save to Camera Roll?")
                    .then((res) => {
                        MediaLibrary.saveToLibraryAsync(picture.uri)
                    })
                    .catch((rej) => {
                    })
                axios.post(
                    `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/post`,
                    {
                        base64: picture.base64
                    }
                )
            }
        })
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

                <Camera type={direction} flashMode={flash} ref={cameraRef} style={{width: '100%', flex: 10}} />


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
                    <TouchableOpacity onPress={takePhoto}>
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
                <Overlay isVisible={overlayVisible}>
                    <Button onPress={() => {
                        setOverlayVisible(false)
                    }}/>
                    <Button onPress={() => {
                        setOverlayVisible(false)
                    }}/>
                </Overlay>

            </KeyboardAvoidingView>
        )
    }
    else {
        return (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text>Allow Camera and Photo Library Permissions in Settings</Text>
            </View>
        )
    }
}

export default SubmissionCamera