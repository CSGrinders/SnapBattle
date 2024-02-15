import {KeyboardAvoidingView, Platform, View, Dimensions, SafeAreaView} from "react-native";
import {Image} from 'expo-image';
import Logo from '../../assets/logo.webp'
import {Button, Input, Text} from "@rneui/themed";
import Footer from "../../Components/Footer";

function SignIn({navigation}) {
    let {width, height} = Dimensions.get('window') //Get dimensions of the screen for footer

    return (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
                                  enabled={false}>
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: width,
                    height: height - 100,
                }}>
                    <View style={{
                        width: 400,
                        height: 400,
                        marginLeft: 5
                    }}>
                        <Image
                            style={{width: '100%', height: '100%'}}
                            source={Logo}
                            //placeholder={blurhash}
                            rcontentFit="cover"
                            transition={1000}
                        />
                    </View>
                    <View>
                        <Input placeholder='Username'/>
                    </View>
                    <View>
                        <Input placeholder='Password'/>
                    </View>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'wrap',
                        marginTop: 20
                    }}>
                        <Button>Sign In</Button>
                        <Text style={{
                            marginHorizontal: 10,
                            marginTop: 10,
                            marginBottom: 10,
                            fontSize: 20,
                        }}>OR</Text>
                        <Button>Sign Up</Button>
                    </View>
                </View>
                <View style={{width: width, height: 80}}><Footer/></View>
            </KeyboardAvoidingView>
    )
}

export default SignIn