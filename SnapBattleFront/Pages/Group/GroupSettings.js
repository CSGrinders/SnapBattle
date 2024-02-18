import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";
import BackButton from "../../Components/Navigation/BackButton.js";
import SubmitButton from "../../Components/Group/SubmitSettingsButton.js"
import {Button, Input} from "@rneui/themed";

function GroupSettings({navigation}) {
    let {width, height} = Dimensions.get('window');
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
                width: width,
                height: height,
                justifyContent: "center"
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <BackButton size={50} backPressed={backPressed}/>
                    <Text style={{
                        marginHorizontal: 30,
                        marginTop: 10,
                        marginBottom: 10,
                        fontSize: 30,
                        fontWeight: 'bold',
                    }}>
                        Group Settings
                    </Text>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    New Group Name
                </Text>
                <View style={{
                    alignItems: 'center',
                    flexDirection: "row",
                    justifyContent: "center",
                }}>
                    <Input placeholder='Enter Group Name' containerStyle={{
                        width: width * 0.8
                    }}/>
                    <SubmitButton size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    New Group Size
                </Text>
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <Input placeholder='Enter Group Size' containerStyle={{
                        width: width * 0.8
                    }}/>
                    <SubmitButton size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    New Prompt Time
                </Text>
                <View style={{
                    alignItems: 'center',
                    flexDirection: "row",
                    justifyContent: "center",
                }}>
                    <Input placeholder='Select Time' containerStyle={{
                        width: width * 0.8
                    }}/>
                    <SubmitButton size={50} submitPressed={submitPressed}/>
                </View>
                <Text style={{
                    marginHorizontal: 30,
                    marginTop: 10,
                    marginBottom: 10,
                    fontSize: 25,
                    fontWeight: 'bold',
                }}>
                    New Submission Time
                </Text>
                <View style={{
                    alignItems: 'center',
                    flexDirection: "row",
                    justifyContent: "center",
                    marginBottom: 40,
                }}>
                    <Input placeholder='Select Time' containerStyle={{
                        width: width * 0.8
                    }}/>
                    <SubmitButton size={50} submitPressed={submitPressed}/>
                </View>
                <View style={{
                    alignItems: 'center',
                    width: width,
                }}>
                    <Button color='red'>Delete Group</Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings