import { Header, Icon } from "@rneui/base";
import {useCallback, useEffect, useState} from "react";
import {Dimensions, Pressable, SafeAreaView, Text, View, Image, ScrollView} from "react-native";
import ProfilePicture from "../../Components/Profile/ProfilePicture";
import PlusButton from "../../assets/plus.png"
import LeaveButton from "../../assets/leave.png"
import axios from "axios";
import uuid from 'react-native-uuid'
import {Button} from "@rneui/themed";
import {useFocusEffect} from "@react-navigation/native";
const {EXPO_PUBLIC_API_URL} = process.env

function Groups({route, navigation}) {
    const { userID } = route.params;

    //groups are in format [{groupID: ?, name: ?}, ...]
    const [groups, setGroups] = useState([])
    const [groupInvites, setGroupInvites] = useState(["test1", "test2", "test3", "test4"])
    const {width, height} = Dimensions.get('window')

    //run on page load
    useFocusEffect(
        useCallback(() => {
            getGroups()
        }, [])
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
                    <ProfilePicture source={""} size={50}/>
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
                    {groups.map((group) => {
                        return (
                            <View key={uuid.v4()} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginVertical: 5}}
                            >
                                <Button
                                    buttonStyle={{width: 200}}
                                    onPress={() => navigation.navigate("GroupHome", {userID: userID, groupID: group.groupID})}
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
                    })}
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