import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";
import SubmitIcon from "../../Components/Group/SubmitSettingsIcon.js"
import {Button, Input} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";

function GroupSettings({route, navigation}) {
    const {userID, groupID} = route.params
    let {width, height} = Dimensions.get('window')
    function backPressed() {
        console.log("back pressed")
    }
    function submitPressed() {
        console.log("submit pressed")
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                              enabled={false}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: height * 0.2,
                width: width * 0.9,
            }}>
                <View style={{paddingLeft: 20, alignItems: 'flex-start'}}>
                    <BackButton size={50} navigation={navigation} destination={"GroupHome"} params={route.params}/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Group Settings</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: Platform.OS === "ios" ? height * 0.6 : height * 0.7,
                justifyContent: "center"
            }}>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Name
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                }}>
                    <Input placeholder='Enter Group Name' containerStyle={{width: width * 0.8}}></Input>
                    <SubmitIcon size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Group Size
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                }}>
                    <Input placeholder='Enter Group Size' containerStyle={{width: width * 0.8}}></Input>
                    <SubmitIcon size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Prompt Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                }}>
                    <Input placeholder='Select Time' containerStyle={{width: width * 0.8}}></Input>
                    <SubmitIcon size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 22,
                    fontWeight: 'bold',
                }}>
                    New Submission Time
                </Text>
                <View style={{
                    alignItems: 'flex-start',
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 20,
                }}>
                    <Input placeholder='Select Time' containerStyle={{width: width * 0.8}}></Input>
                    <SubmitIcon size={50} submitPressed={submitPressed}/>
                </View>
                <View style={{
                    alignItems: 'center',
                    marginTop: 30,
                    width: width,
                    height: height * 0.01,
                }}>
                    <Button color='#A90808FF'>Delete Group</Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings