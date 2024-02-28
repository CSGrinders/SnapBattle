import {View, Text, KeyboardAvoidingView, Platform, Dimensions} from "react-native";
import {Button} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";

function GroupHome({route, navigation}) {
    const {name, username, email, userID, groupID} = route.params
    const {width, height} = Dimensions.get('window');

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={false} style={{flex: 1, alignItems: "center"}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 70,
                marginBottom: 10
            }}>
                <View style={{
                    paddingLeft: 15,
                    alignItems: 'flex-start'
                }}>
                    <BackButton size={50} navigation={navigation}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                    <Text style={{fontSize: 32, fontFamily: 'OpenSansBold'}}>Group Home</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: height - 300,
                justifyContent: "center",
                alignItems: "center",
            }}>
            <Button
                onPress={() => navigation.navigate("GroupMembers", route.params)}
            >
                Group Members
            </Button>
            <Button onPress={() => navigation.navigate('GroupSettings', route.params)}>
                GroupSettings
            </Button>
            </View>
        </KeyboardAvoidingView>
    )
}

export default GroupHome;