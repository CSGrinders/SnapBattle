import {View} from "react-native";
import {Image} from "expo-image";
import Logo from "../../assets/logo.webp";


/**
 * @returns {JSX.Element} - Loading logo component.
 */

const LoadingScreen = () => {
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Image
                style={{width: '100%', height: '100%'}}
                source={Logo}
                contentFit="contain"
                transition={1000}
            />
        </View>
    );
};

export default LoadingScreen;