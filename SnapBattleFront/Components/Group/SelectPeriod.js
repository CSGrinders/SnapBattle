import {Button} from "@rneui/themed";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {View} from "react-native";

function SelectPeriodButton(
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
    const showDurationPicker = () => {
        setVisibility(true);
    };

    const hideDurationPicker = () => {
        setVisibility(false);
    };

    const handleConfirm = (time, width) => {
        // string parsing for button title
        let hours = time.getHours();
        let hrFormat = hours === 1 ? " hour " : " hours "
        let minutes = time.getMinutes();
        let minFormat = minutes === 1 ? " minute" : " minutes";
        setTitle(hours.toString() + hrFormat + minutes.toString() + minFormat);
        // string parsing to send to server
        let hrStr = time.getHours() < 10 ? "0" + time.getHours().toString() : time.getHours().toString();
        let minStr = time.getMinutes() < 10 ? "0" + time.getMinutes().toString() : time.getMinutes().toString();
        setTime(hrStr + ":" + minStr);
        // set date for time picker
        setDate(time);
        hideDurationPicker();
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
                    onPress={showDurationPicker}
            />
            <DateTimePickerModal
                is24Hour
                locale="en_GB"
                isVisible={visibility}
                mode="time"
                date={date}
                onConfirm={handleConfirm}
                onCancel={hideDurationPicker}
            />
        </View>
    );
}
export default SelectPeriodButton;