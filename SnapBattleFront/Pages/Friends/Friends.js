import {View, Image, SafeAreaView, Text, Dimensions} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Input} from "@rneui/themed";

function Friends({route, navigation}) {

    const {name, username, email, userID} = route.params

    const {width, height} = Dimensions.get('window') //Get


    return (
        <SafeAreaView style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: 'flex-start',
            width: width,
            height: height}}
        >

            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-between'}}>
                <BackButton size={50} navigation={navigation} destination={"Profile"} params={{name: name, username: username, email: email, userID: userID}}/>
                <Text style={HeaderTheme.h1Style}>Friends</Text>
                <Image
                    source={BlockedFriendsIcon}
                    style={{
                        width: 50,
                        height: 50
                    }}
                />
            </View>


            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Input></Input>
                <Image
                    source={SearchIcon}
                    style={{
                        width: 50,
                        height: 50
                    }}
                />
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