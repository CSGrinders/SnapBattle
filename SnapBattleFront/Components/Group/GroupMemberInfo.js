import { Card, Text } from '@rneui/themed';
import { TouchableOpacity } from "react-native";
import {View} from "react-native";
import Profile from "../../assets/default-profile-picture.webp";
import {Image} from "expo-image";
import KickButton from "../Button/KickButton";

function GroupMemberInfo({navigation, name, username, email, userID, width, admin, isAdmin}) {
    // TODO: PFP @hojin
    let adminStr = admin ? "Administrator" : "Member";
    return (
        <Card wrapperStyle={{
            width: width,
        }}>
            <View style={{
                flexDirection: "row",
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("OtherProfile", {
                        name: name,
                        username: username,
                        email: email,
                        userID: userID
                    })}
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
                            }}> {name} </Text>
                            <Text> @{username} </Text>
                            <Text> {adminStr} </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{
                    justifyContent: "center",
                    display: !isAdmin
                }}>
                    <KickButton size={50}/>
                </View>
            </View>
        </Card>
    )
}
export default GroupMemberInfo;