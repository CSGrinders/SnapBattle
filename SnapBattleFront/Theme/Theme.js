import {createTheme} from "@rneui/themed";


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
            containerStyle: {
                borderRadius: 8
            },
            buttonStyle: {
                height: 50,
                width: 150
            },
            titleStyle: {
                fontSize: 20,
            }
        },
    },
});


