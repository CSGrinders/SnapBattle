import {Dimensions, FlatList, Text, View, Image} from "react-native";
import {useRef, useState} from "react";
import Carousel from "react-native-snap-carousel";
const {width, height} = Dimensions.get('window');



const PostComponent = ({size, posts}) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const ref = useRef(null)

    function renderItem({item, index}) {
        return (
            <Image
                source={{uri: item.picture}}
                style={{
                    width: width * 0.9 - 10,
                    height: (4 / 3) * (width * 0.9)
                }}
            />
        )
    }

    if (posts === null || posts.length === 0) {
        return (
            <View style={{
                width: width * 0.9,
                height: "90%",
                borderWidth: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Text>No posts</Text>
            </View>
        )
    }
    else {
        //console.log(posts)
        return (
            <View style={{
                width: width * 0.9,
                height: "90%",
                borderWidth: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Carousel
                    layout="default"
                    ref={ref}
                    data={posts}
                    sliderWidth={width * 0.9 - 10}
                    itemWidth={width * 0.9 - 10}
                    renderItem={renderItem}
                    onSnapToItem={(index) => setActiveIndex(index)}
                    vertical={false}
                />
            </View>
        )
    }

}

export default PostComponent