import { Alert as NativeAlert } from 'react-native';

const defaultButtons = (resolve, reject) => [
    {
        text: 'YES',
        onPress: () => {
            resolve();
        },
    },
    {
        text: 'NO',
        onPress: () => {
            reject()
        }
    }
];

const AsyncAlert = (title, msg, getButtons = defaultButtons) =>
    new Promise((resolve, reject) => {
        NativeAlert.alert(title, msg, getButtons(resolve, reject), { cancelable: false });
    });

export default AsyncAlert;