import {View, Text} from "react-native";
import {Button} from "@rneui/themed";

function GroupHome({route, navigation}) {
    const {username, userID, groupID} = route.params
    console.log(username)
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>GROUP HOME</Text>
            <Text>Group ID: {groupID}</Text>
            <Button
                onPress={() => navigation.navigate("GroupMembers", route.params)}
            >
                Group Members
            </Button>
            <Button onPress={() => navigation.navigate('GroupSettings', route.params)}>
                GroupSettings
            </Button>
        </View>
    )
}

export default GroupHome;