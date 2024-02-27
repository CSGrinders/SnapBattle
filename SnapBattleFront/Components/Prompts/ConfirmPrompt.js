import React, {useEffect, useState} from 'react';
import {Modal, Pressable, View} from 'react-native';
import {Button, Text} from '@rneui/themed';
import {Image} from "expo-image";
import CloseButton from "../../assets/close.webp";


/**
 * @returns {JSX.Element} - Error prompt
 */

const ConfirmPrompt = ({ Message, state, setState, command }) => {
    const [invBoxVisible, setInvBoxVisibility] = useState(false);

    useEffect(() => {
        setInvBoxVisibility(state);
    }, [state]);

    return(
        <Modal
            animationType="slide"
            transparent={true}
            visible={invBoxVisible}
            onRequestClose={() => {
                setInvBoxVisibility(false);
                setState(false);
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
                        setState(false)
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
                        <Text style={{
                            fontSize: 36,
                            textAlign: 'center'
                        }}>{Message}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20}}>
                            <View>
                                <Button buttonStyle={{width: 100}} onPress={command}>Yes</Button>
                            </View>
                            <View style={{marginLeft: 20}}>
                                <Button buttonStyle={{width: 100}} onPress={() => {
                                    setInvBoxVisibility(false);
                                    setState(false);
                                }}>No</Button>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
};


export default ConfirmPrompt;
