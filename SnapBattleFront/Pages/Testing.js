import {Text, View} from "react-native";
import {Button, useThemeMode} from "@rneui/themed";

function Testing() {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Test your components on this screen :)</Text>
            <View style={{ paddingTop: 20 }}>
                <Button>Test</Button>
            </View>
        </View>
    )
}

export default Testing