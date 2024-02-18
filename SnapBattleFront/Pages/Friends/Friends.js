import {View, Image, SafeAreaView, Text} from "react-native";
import BackButton from "../../Components/Button/BackButton";
import BlockedFriendsIcon from "../../assets/blocked.webp"
import SearchIcon from "../../assets/search-icon.webp"
import {HeaderTheme} from "../../Theme/Theme";
import {Input} from "@rneui/themed";

function Friends({navigation}) {


    return (
        <SafeAreaView style={{ flex: 1, flexDirection: "column", justifyContent: 'flex-start'}}>
            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>
                <BackButton size={50} navigation={navigation} destination="Main"/>
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