import { Card, Text } from '@rneui/themed';
import { TouchableOpacity } from "react-native";
import {View} from "react-native";
import {Image} from "expo-image";
import KickButton from "../Button/KickButton";
import OtherProfilePicture from "../Profile/OtherProfilePicture";

function GroupMemberInfo({navigation, name, pfpURL, username, email, userID, width, admin}) {
    let adminStr = admin ? "Administrator" : "Member";
    return (
        <Card wrapperStyle={{
            width: width,
        }}>
            <View style={{
                flexDirection: "row",
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Profile", {
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
                        <OtherProfilePicture size={55} imageUrl={pfpURL}/>
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
                    justifyContent: "center"
                }}>
                    <KickButton size={50}/>
                </View>
            </View>
        </Card>
    )
}
export default GroupMemberInfo;