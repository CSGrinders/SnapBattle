import { Card, Text } from '@rneui/themed';
import { TouchableOpacity } from "react-native";
import {View} from "react-native";
import OtherProfilePicture from "../Profile/OtherProfilePicture";
import KickButton from "../Button/KickButton";
import axios from "axios";
const {EXPO_PUBLIC_API_URL} = process.env

function GroupMemberInfo({navigation,
                             groupID,
                             userID,
                             searchName,
                             searchUsername,
                             searchID,
                             width,
                             isAdmin,
                             adminPerms,
                             pfpURL,
                             token,
                             setKickUser,
                             setKick,
                             setPrompt,
                             setGroupMembers,
                             groupMembers,
}) {
    function handleOnPress() {
        console.log("HERE>");
        try {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/visit-member-profile`, {
                searchID: searchID
            }).then((response) => {
                let {status, data} = response;
                if (status === 202) {
                    navigation.navigate("Profile", {userID: userID})
                } else {
                    navigation.navigate("OtherProfile", {
                        searchName: data.searchName,
                        searchUsername: data.searchUsername,
                        searchBio: data.searchBio,
                        searchID:searchID,
                        url: data.searchPFP,
                        viewType: data.viewType,
                        userID: userID,
                        token: token,
                    })
                }
            }).catch((error) => {
                console.log("Members Home page: " + error);
                if (error && error.response) {
                    const {data} = error.response;
                    setGroupMembers(groupMembers.filter(member => member.username !== searchUsername));
                    setPrompt(data.errorMessage);
                }
            })
        } catch (error) {
            console.log("Members Home page: " + error);
        }
    }

    function kick() {
        setKickUser(searchUsername);
        setKick(true);
    }


    let adminStr = isAdmin ? "Administrator" : "Member";

    return (
        <Card wrapperStyle={{
            width: width,
        }}>
            <View style={{
                flexDirection: "row",
            }}>
                <TouchableOpacity
                    onPress={handleOnPress}
                    style={{
                        flex: 1,
                    }}
                >
                    <View style={{
                        flexDirection: "row",
                        alignContent: "center",
                        maxHeight: 200
                    }}>
                        <OtherProfilePicture size={55} imageUrl={pfpURL}/>
                        <View style={{
                            marginLeft: 5
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold'
                            }}> {searchName} </Text>
                            <Text> @{searchUsername} </Text>
                            <Text> {adminStr} </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{
                    justifyContent: "center",
                    display: !adminPerms
                }}>
                    <KickButton size={50} onPress={kick}/>
                </View>
            </View>
        </Card>
    )
}
export default GroupMemberInfo;