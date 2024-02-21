import {View, Image, SafeAreaView, Text, Dimensions, Pressable, TouchableOpacity} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Input} from "@rneui/themed";
import {useState} from "react";
import axios from "axios";

const {EXPO_PUBLIC_API_URL} = process.env

function Friends({route, navigation}) {

    const {name, username, email, userID} = route.params

    const {width, height} = Dimensions.get('window')
    const [search, setSearch] = useState("")

    function searchUser() {
        console.log('test')
        axios.get(
            `${EXPO_PUBLIC_API_URL}/user/${userID}/search/${search}`,
        )
    }


    return (
        <SafeAreaView style={{
            alignItems: 'center',
            width: width,
            height: height,
            gap: 20
        }}
        >

            <View style={{flexDirection: 'row', justifyContent: 'center', width: 0.9 * width}}>
                <BackButton size={50} navigation={navigation} destination={"Profile"} params={route.params}/>
                <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={HeaderTheme.h1Style}>Friends</Text>
                </View>
                <Image
                    source={BlockedFriendsIcon}
                    style={{
                        width: 50,
                        height: 50
                    }}
                />
            </View>


            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center', width: 0.9 * width}}>
                <Input
                    placeholder={"username"}
                    containerStyle={{flex: 1}}
                    onChangeText={username => setSearch(username)}/>
                <TouchableOpacity onPress={searchUser}>
                    <Image
                        source={SearchIcon}
                        style={{
                            width: 50,
                            height: 50
                        }}
                    />
                </TouchableOpacity>
            </View>
            <View>
                <Text style={HeaderTheme.h2Style}>Pending Requests</Text>
            </View>
            <View>
                <Text style={HeaderTheme.h2Style}>Friends</Text>
            </View>
        </SafeAreaView>
    )
}

export default Friends