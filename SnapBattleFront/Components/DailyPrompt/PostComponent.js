import {Dimensions, FlatList, Text, View, Image} from "react-native";
import {useState} from "react";
const {width, height} = Dimensions.get('window');



const PostComponent = ({size, posts}) => {
    if (posts === null || posts.length === 0) {
        return (
            <View>
                <Text>No posts</Text>
            </View>
        )
    }
    else {
        console.log(posts)
        return (
            <View style={{
                width: width * 0.9,
                height: "90%",
                borderRadius: 90,
                borderWidth: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <FlatList
                    data={posts}
                    renderItem={({item, index, separators}) => (
                        <>
                            <Image
                                source={{uri: item.picture}}
                                style={{
                                    width: width * 0.8,
                                    height: width * 0.8
                                }}
                            />
                        </>
                    )}
                    pagingEnabled
                    horizontal
                />
            </View>
        )
    }

}

export default PostComponent