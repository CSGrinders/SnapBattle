import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";

import BackButton from '../../Components/Navigation/Back.js'
import {useState} from "react";
import {Button, Input} from "@rneui/themed";

function GroupSettings({navigation}) {
    let {width, height} = Dimensions.get('window')
    const [page, setPage] = useState("")
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
                    <BackButton setPage={setPage} pageName={"Groups Page"} />
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
                }}>
                    <Input placeholder='Enter Group Name'/>
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
                }}>
                    <Input placeholder='Enter Group Size'/>
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
                }}>
                    <Input placeholder='Select Time'/>
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
                    marginBottom: 40,
                }}>
                    <Input placeholder='Select Time'/>
                </View>
                <View style={{
                    alignItems: 'center',
                    width: width,
                }}>
                    <Button>Delete Group</Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default GroupSettings