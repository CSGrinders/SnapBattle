import { Card, Text } from '@rneui/themed';
import { TouchableOpacity } from "react-native";
import {View} from "react-native";
import Profile from "../../assets/default-profile-picture.webp";
import {Image} from "expo-image";
import KickButton from "../Button/KickButton";
import axios from "axios";
const {EXPO_PUBLIC_API_URL} = process.env

function GroupMemberInfo({navigation,
                             groupID,
                             name,
                             username,
                             email,
                             userID,
                             searchName,
                             searchUsername,
                             searchID,
                             width,
                             isAdmin,
                             adminPerms,
                             setError,
                             setErrorMessage}) {
    // TODO: PFP @hojin
    function handleOnPress() {
        try {
            axios.post(`${EXPO_PUBLIC_API_URL}/user/${userID}/groups/${groupID}/visit-member-profile`, {
                searchID: searchID
            }).then((response) => {
                let {status, data} = response;
                if (status === 202) {
                    navigation.navigate("Profile", {
                        name: name,
                        username: username,
                        email: email,
                        userID: userID
                    })
                } else {
                    navigation.navigate("OtherProfile", {
                        name: name,
                        username: username,
                        email: email,
                        userID: userID,
                        searchName: data.searchName,
                        searchUsername: data.searchUsername,
                        searchBio: data.searchBio,
                        searchID: data.searchID,
                        viewType: data.viewType
                    })
                }
            })
        } catch (error) {
            let {status, data} = error;
            setError(true);
            setErrorMessage(data.errorMessage);
        }
    }
    let adminStr = isAdmin ? "Administrator" : "Member";
    console.log(adminPerms)
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
                        <View>
                            <Image source={Profile} style={{width:55, height:55}}/>
                        </View>
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
                    <KickButton size={50}/>
                </View>
            </View>
        </Card>
    )
}
export default GroupMemberInfo;