import {KeyboardAvoidingView, Dimensions, Text, View, Platform} from "react-native";

import {useState} from "react";
import {Button, Input} from "@rneui/themed";
import BackButton from "../../Components/Button/BackButton";

function GroupSettings({navigation}) {
    let {width, height} = Dimensions.get('window')
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
                    <BackButton size={50} navigation={navigation} destination="Main"/>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingRight: 20}}>
                    <Text style={{fontSize: 36, fontFamily: 'OpenSansBold'}}>Group Settings</Text>
                </View>
            </View>
            <View style={{
                width: width,
                height: height * 0.6,
                justifyContent: "center"
            }}>
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