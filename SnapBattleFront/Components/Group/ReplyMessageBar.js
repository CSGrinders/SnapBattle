import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import {Image} from 'expo-image';



const ReplyMessageBar = ({ clearReply, message, ...props }) => {
    if (!message) {
        return null;
    }

    return (
        <View {...props} style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            height: 50,
        }}>
            <View style={{
                paddingLeft: 8,
                paddingRight: 6,
                borderRightWidth: 2,
                borderRightColor: '#2196F3',
                marginRight: 6,
                height: '100%',
                justifyContent: 'center',
            }}>
                <Image
                    style={{
                        width: 20,
                        height: 20,
                    }}
                    source={require('../../assets/reply-icon.webp')}
                />
            </View>

            <View style={{flex: 1}}>
                <Text>{message.text}</Text>
            </View>

            <TouchableOpacity style={{
                padding: 4
            }} onPress={clearReply}>
                <Image
                    style={{
                        width: 24,
                        height: 24,
                    }}
                    source={require('../../assets/close.webp')}
                />
            </TouchableOpacity>
        </View>
    );
};
export default ReplyMessageBar;
