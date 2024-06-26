import {createTheme} from "@rneui/themed";
import {StyleSheet} from "react-native";


export const theme = createTheme({
    lightColors: {
        primary: '#252323',
        success: '#20bb5e',
        grey0: '#2D2D2D',
        background: '#ffffff'
    },
    mode: 'light',
    components: {
        Button: {
            buttonStyle: {
                height: 50,
                width: 250,
                borderRadius: 8
            },
            titleStyle: {
                fontFamily: 'OpenSansRegular',
                fontSize: 20,
            }
        },
        Input: {
            containerStyle: {
                width: 350,
            },
            inputContainerStyle: {
                borderBottomWidth: 0,
            },
            inputStyle: {
                textAlign: 'center',
                height: 60,
                fontSize: 22,
                color: '#000000',
                fontFamily: 'OpenSansRegular',
                borderWidth: 2,
                borderColor: '#252323',
                borderRadius: 8,
            },
        },
        Text: {
            style: {
                fontFamily: 'OpenSansRegular',
            }
        },
        CheckBox: {
            containerStyle: {
                backgroundColor: 'transparent',
                borderWidth: 0,
            },
        },
    },
});


export const FooterStyle = StyleSheet.create({
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        padding: 10,
    },
    footerText: {
        fontSize: 15,
        fontFamily: 'OpenSansRegular',
        textAlign: 'center',
        justifyContent: 'center',
    },
    loveEmoji: {
        fontSize: 15,
    },
});

export const HeaderTheme = StyleSheet.create({
    h1Style: {
        fontFamily: 'OpenSansBold',
        fontSize: 40
    },
    h2Style: {
        fontFamily: 'OpenSansBold',
        fontSize: 20
    }
})