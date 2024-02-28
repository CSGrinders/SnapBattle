import {Modal, Pressable, Text, View} from "react-native";
import {Image} from "expo-image";
import CloseButton from "../../assets/close.webp";
import {Button, Input} from "@rneui/themed";

function TransferPermsPrompt(confirmTransfer, setConfirmTransfer, transferError, setTransferError, setNewAdminUsername) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={confirmTransfer}
            onRequestClose={() => {
                setConfirmTransfer(false);
                setTransferError('');
            }}>
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
                        setConfirm(false);
                        setConfirmUsername('');
                        setConfirmStatus('');
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
                        alignItems: 'center'

                    }}>
                        <View style={{marginBottom: 10}}>
                            <Text>You are the administrator. To leave, type the username of an existing member to transfer your permissions to. </Text>
                        </View>
                        <Input
                            placeholder='Confirm action.'
                            onChangeText={username => {
                                setNewAdminUsername(username);
                                setTransferError('');
                            }}
                            autoCapitalize="none"
                            errorMessage={transferError}
                        />
                        <View style={{marginTop: 10}}>
                            <Button onPress={() => {deleteGroup()}}>Confirm</Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}