import React from 'react';
import { View, Animated } from 'react-native';
import {
    GestureHandlerRootView,
    Swipeable,
} from 'react-native-gesture-handler';
import { Message } from 'react-native-gifted-chat';
import { isSameDay, isSameUser } from 'react-native-gifted-chat/lib/utils';
import { Image } from 'expo-image';

const ChatMessageBox = ({ setReplyOnSwipeOpen, updateRowRef, ...props }) => {

    const isNextMyMessage =
        props.currentMessage && props.nextMessage &&
        isSameUser(props.currentMessage, props.nextMessage) &&
        isSameDay(props.currentMessage, props.nextMessage);

    const renderLeftAction = (progressAnimatedValue) => {
        const size = progressAnimatedValue.interpolate({
            inputRange: [0, 1, 100],
            outputRange: [0, 1, 1],
        });
        const trans = progressAnimatedValue.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, 12, 20],
        });

        return (
            <Animated.View
                style={[
                    { width: 40 },
                    {
                        transform: [{ scale: size }, { translateX: trans }]
                    },
                    isNextMyMessage ? { marginBottom: 2 } : { marginBottom: 10 },
                    props.position === 'left' && { marginRight: 16 },
                ]}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Image
                        style={{
                            width: 20,
                            height: 20
                        }}
                        source={require('../../assets/reply-icon.webp')}
                    />
                </View>
            </Animated.View>
        );
    };

    const onSwipeOpenAction = () => {
        if (props.currentMessage) {
            setReplyOnSwipeOpen({ ...props.currentMessage });
        }
    };

    return (
        <GestureHandlerRootView>
            <Swipeable
                ref={updateRowRef}
                friction={2}
                leftThreshold={40}
                renderLeftActions={renderLeftAction}
                onSwipeableOpen={onSwipeOpenAction}
            >
                <Message {...props} />
            </Swipeable>
        </GestureHandlerRootView>
    );
};

export default ChatMessageBox;
