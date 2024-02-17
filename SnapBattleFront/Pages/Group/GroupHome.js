import { Header, Icon } from "@rneui/base";
import { useState } from "react";
import {Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, Text, View} from "react-native";

function GroupHome({navigation}) {
    let {width, height} = Dimensions.get('window') 
    const [groups, setGroups] = useState(["test1", "test2", "test3", "test4"])
    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                                  enabled={false} style={{
                                    width: width,
                                    height: height - 100,
                                  }}>
                <View style={{
                    alignItems: "flex-start",
                    width: width - 30,
                    paddingEnd: '100'
                }}>
                    <Text>Put header here</Text>
                </View>
                <View style={{
                    alignItems: "flex-end",
                    width: width - 30,
                    paddingEnd: '100'
                }}>
                    <Text> Put profile Icon here</Text>
                </View>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: width,
                    height: height - 100,
                }}>
                    <View style={{
                        flexDirection: 'column'
                    }}>
                        {groups.map((group) => {
                            return (
                                <Text>{group}</Text>
                            )
                        })}
                    </View>
                </View>
            </KeyboardAvoidingView>
            
        </SafeAreaView>
    )
}

export default GroupHome