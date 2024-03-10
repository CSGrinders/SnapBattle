import {Dimensions, Text, View} from "react-native";

const {width, height} = Dimensions.get('window');


const PostComponent = ({size}) => {
    return (
        <View style={{
            width: width * 0.9,
            height: "90%",
            borderRadius: 90,
            borderWidth: 5,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text> Post </Text>
        </View>
    )
}

export default PostComponent