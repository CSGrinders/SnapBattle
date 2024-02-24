import {useCallback, useEffect, useState} from "react";
import {Dimensions, Pressable, SafeAreaView, Text, View, Image, ScrollView, ActivityIndicator} from "react-native";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import PlusButton from "../../assets/plus.webp"
import LeaveButton from "../../assets/leave.webp"
import axios from "axios";
import uuid from 'react-native-uuid'
import {Button} from "@rneui/themed";
import {useFocusEffect} from "@react-navigation/native";
import {getUserInfo} from "../../Storage/Storage";
const {EXPO_PUBLIC_API_URL, EXPO_PUBLIC_USER_INFO, EXPO_PUBLIC_USER_TOKEN} = process.env

function Groups({navigation}) {

    //user information
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [userID, setUserID] = useState('');
    const [token, setToken] = useState('');

    //groups are in format [{groupID: ?, name: ?}, ...]
    const [groups, setGroups] = useState([-1])
    const [groupInvites, setGroupInvites] = useState(["test1", "test2", "test3", "test4"])
    const {width, height} = Dimensions.get('window')

    //getting user information
    useFocusEffect(
        useCallback(() => {
            getUserInfo(EXPO_PUBLIC_USER_INFO).then((info) => {
                if (info) {
                    const userData = JSON.parse(info);
                    if (userData.name) setName(userData.name);
                    if (userData.username) setUsername(userData.username);
                    if (userData.email) setEmail(userData.email);
                    if (userData.id) setUserID(userData.id)
                }
            })
            getUserInfo(EXPO_PUBLIC_USER_TOKEN).then((info) => {
                if (info) {
                    setToken(info);
                }
            })
        }, [])
    )

    //getting information necessary for page display
    useFocusEffect(
        useCallback(() => {
            getGroups()
        }, [userID])
    )


    //get user's list of groups
    function getGroups() {
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/groups`
        )
            .then((res) => {
                setGroups(res.data)
            })
            .catch((err) => {
                console.log("bruh")
            })
    }


    return (
        <SafeAreaView style={{alignItems: 'center', width: width, height: height}}>

            <View style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: 0.9 * width
            }}>
                <View>
                    <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Groups</Text>
                </View>
                <View>
                    <Pressable onPress={() => navigation.navigate("Profile", {name: name, username: username,
                                                                                   email: email, userID: userID})}>
                        <ProfilePicture size={50}/>
                    </Pressable>
                </View>
            </View>


            <View style={{
                flex: 0,
                width: width * 0.8,
            }}>
                <Text style={{fontSize: 24, fontFamily: "OpenSansBold"}}>Pending Requests</Text>
                {groupInvites.map((group) => {
                    return (
                        <Text key={uuid.v4()}>{group}</Text>
                    )
                })}
            </View>


            <View style={{
                width: width * 0.8,
                flex: 1
            }}>
                <Text style={{fontSize: 24, fontFamily: "OpenSansBold"}}>Groups</Text>
                <ScrollView>
                    {(groups[0]!== -1) ? groups.map((group) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5}}
                            >
                                <Button
                                    buttonStyle={{width: 200}}
                                    onPress={() => navigation.navigate("GroupHome", {name: name, username: username, email: email, userID: userID, groupID: group.groupID})}
                                >
                                    {group.name}
                                </Button>
                                <Pressable>
                                    <Image
                                        source={LeaveButton}
                                        style={{
                                            width: 50,
                                            height: 50
                                        }}
                                    />
                                </Pressable>
                            </View>
                        )
                    }) : <ActivityIndicator size="large" color="#000000"/>}
                </ScrollView>
            </View>


            <View>
                <Pressable style={{alignItems: 'center'}} onPress={() => navigation.navigate("CreateGroup", {userID: userID})}>
                    <Image
                        source={PlusButton}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                    <Text style={{fontFamily: "OpenSansRegular"}}>Create Group</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default Groups