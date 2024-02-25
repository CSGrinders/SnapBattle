import {View, Text} from "react-native";
import {Button} from "@rneui/themed";

function GroupHome({route, navigation}) {
    const {name, username, email, userID, groupID} = route.params
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