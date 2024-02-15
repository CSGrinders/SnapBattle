import {Alert, Modal, Pressable, SafeAreaView, Text, View, Image} from "react-native";
import {Button, Input} from "@rneui/themed";
import {useState} from "react";
import CloseButton from "../../assets/close.png"
import axios from "axios";
const {EXPO_PUBLIC_API_URL} = process.env

function GroupMembers({navigation}) {
    //state for whether the invite box is open or not
    const [invBoxVisible, setInvBoxVisibility] = useState(false)

    //state for the username to be invited to the group
    const [userInput, setUserInput] = useState("")

    //API call to check if user is a friend -> invites the friend to the group
    function inviteUser() {
        console.log(`${EXPO_PUBLIC_API_URL}`)
        axios.post(
            `${EXPO_PUBLIC_API_URL}/user/groups/invite`,
            {
                username: userInput
            }
        ).then(
            (res) => {console.log(res.status)}
        ).catch(
            (err) => console.log(err)
        )
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
                            <Pressable onPress={() => setInvBoxVisibility(false)}>
                                <Image
                                    source={CloseButton}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginLeft: 'auto',
                                    }}
                                />
                            </Pressable>
                            <View style={{
                                flex: 0,
                                alignItems: 'center'
                            }}>
                                <Text>Enter the username of the friend you would like to invite</Text>
                                <Input placeholder='username' onChangeText={username => setUserInput(username)}/>
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