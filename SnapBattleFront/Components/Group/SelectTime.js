import {Button} from "@rneui/themed";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {View} from "react-native";

function SelectTimeButton(
    {
        width,
        visibility,
        setVisibility,
        title,
        setTitle,
        date,
        setDate,
        setTime,
    }) {
    const showTimePicker = () => {
        setVisibility(true);
    };

    const hideTimePicker = () => {
        setVisibility(false);
    };

    const handleConfirm = (time, width) => {
        // string parsing for button title
        let hours = time.getHours() - 13 < 0 ? time.getHours() : time.getHours() - 12;
        hours = hours === 0 ? 12 : hours;
        let minutes = time.getMinutes() - 10 < 0 ? "0" + time.getMinutes().toString() : time.getMinutes().toString();
        let AMPM = time.getHours() - 12 < 0 ? "AM" : "PM";
        setTitle(hours.toString() + ":" + minutes + " " + AMPM);
        // string parsing to send to server
        let hrStr = time.getHours() < 10 ? "0" + time.getHours().toString() : time.getHours().toString();
        let minStr = time.getMinutes() < 10 ? "0" + time.getMinutes().toString() : time.getMinutes().toString();
        setTime(hrStr + ":" + minStr);
        // set date for time picker
        setDate(time);
        hideTimePicker();
    };

    return (
        <View>
            <Button title={title} type="outline"
                    buttonStyle={{
                        borderRadius: 8,
                        borderWidth: 2,
                        width: width,
                        height: 55,
                    }}
                    containerStyle={{
                        marginLeft: 5,
                        marginRight: 10,
                    }}
                    onPress={showTimePicker}
            />
            <DateTimePickerModal
                isVisible={visibility}
                mode="time"
                date={date}
                onConfirm={handleConfirm}
                onCancel={hideTimePicker}
            />
        </View>
    );
}
export default SelectTimeButton;