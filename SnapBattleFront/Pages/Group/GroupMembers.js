import {Alert, Modal, Pressable, SafeAreaView, Text, View} from "react-native";
import {Image} from "expo-image";
import {Button, Input} from "@rneui/themed";
import {useEffect, useState} from "react";
import CloseButton from "../../assets/close.webp"
import axios from "axios";
import {getUserInfo} from "../../Storage/Storage";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO} = process.env

function GroupMembers({navigation}) {

    //get current user's ID from storage
    const [userID, setUserID] = useState("")
    useEffect(() => {
        getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
            if (info) {
                const userData = JSON.parse(info);
                if (userData.id) setUserID(userData.id)
            }
        })
    }, [])

    //state for whether the invite box is open or not
    const [invBoxVisible, setInvBoxVisibility] = useState(false)

    //state for the username to be invited to the group
    const [invUser, setInvUser] = useState("")

    //state for group invite status message
    const [invStatusMsg, setInvStatusMsg] = useState("")
    const [invStatusColor, setInvStatusColor] = useState("green")

    //API call to check if user is a friend -> invites the friend to the group
    function inviteUser() {
        console.log(`${EXPO_PUBLIC_API_URL}`)
        const groupID = "random"
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/invite`,
            {
                inviteUsername: invUser
            }
        ).then(
            (res) => {
                setInvStatusMsg(res.data)
                setInvStatusColor("green")
            }
        ).catch(
            (error) => {
                // Check for error.response if its null, also you can use //error.response.status
                setInvStatusMsg(error.response.data)
                setInvStatusColor("red")
            }
        )
    }

    function closeInviteBox() {
        setInvStatusMsg("")
        setInvBoxVisibility(false)
    }
    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between'}} >
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={invBoxVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.')
                        setInvBoxVisibility(false)
                        setInvStatusMsg("")
                    }}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            borderColor: 'black',
                            borderWidth: 2,
                            padding: 10,
                        }}>
                            <Pressable onPress={closeInviteBox}>
                                <Image
                                    source={CloseButton}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginLeft: 'auto',
                                    }}
                                    rcontentFit="cover"
                                    transition={500}
                                />
                            </Pressable>
                            <View style={{
                                flex: 0,
                                alignItems: 'center'
                            }}>
                                <Text>Enter the username of the friend you would like to invite</Text>
                                <Input
                                    placeholder='username'
                                    onChangeText={username => setInvUser(username)}
                                    errorStyle={{color: invStatusColor}}
                                    errorMessage={invStatusMsg}
                                />
                                <Button onPress={inviteUser}>Confirm</Button>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View>
                    <Text>
                        Put header here
                    </Text>
                </View>
                <View>
                    <Text>
                        Put group members here
                    </Text>
                </View>
                <Button onPress={() => setInvBoxVisibility(true)}>Invite +</Button>
        </SafeAreaView>
    )
}

export default GroupMembers