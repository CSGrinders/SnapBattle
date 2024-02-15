import { Button } from '@rneui/themed'
function SendFriendReq() {

    //API call when send friend request button is clicked
    function pressSendFriendReq() {
        console.log("test");
    }


    return (
        <Button onPress={pressSendFriendReq}>
            Send Friend Request
        </Button>
    )
}

export default SendFriendReq;