import React, {useEffect, useState} from 'react';
import {Modal, Pressable, View} from 'react-native';
import {Button, Text} from '@rneui/themed';
import {Image} from "expo-image";
import CloseButton from "../assets/close.webp";


/**
 * @returns {JSX.Element} - info prompt
 */

const InfoPrompt = ({ Message, state, setEnable }) => {
    const [invBoxVisible, setInvBoxVisibility] = useState(false);

    useEffect(() => {
        setInvBoxVisibility(state);

        let timer;
        if (state) { //Disappear in 3 seconds
            timer = setTimeout(() => {
                setInvBoxVisibility(false);
                if (setEnable) setEnable(false);
            }, 3000);
        }

        // Cleanup function to clear the timeout
        return () => clearTimeout(timer);
    }, [state, setEnable]);

    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={invBoxVisible}
            onRequestClose={() => {
                setInvBoxVisibility(false)
                setError(false)
            }}
        >
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <View style={{
                    backgroundColor: 'white',
                    borderColor: 'black',
                    borderWidth: 2,
                    borderRadius: 8,
                    padding: 10,
                }}>
                    <Pressable onPress={() => {
                        setInvBoxVisibility(false)
                        setEnable(false)
                    }}>
                        <Image
                            source={CloseButton}
                            style={{
                                width: 30,
                                height: 30,
                                marginLeft: 'auto',
                            }}
                            rcontentFit="cover"
                            transition={500}
                        />
                    </Pressable>
                    <View style={{
                        flex: 0,
                        alignItems: 'center',
                        marginTop: 5,
                    }}>
                        <Text style={{fontSize: 36, textAlign: 'center'}}>{Message}</Text>
                        <View style={{marginTop: 10}}>
                            <Button onPress={() => {
                                setInvBoxVisibility(false)
                                setEnable(false)
                            }}>Close</Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
};


export default InfoPrompt;
