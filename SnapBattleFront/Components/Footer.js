import React from 'react';
import { View } from 'react-native';
import { Text } from '@rneui/themed';
import {FooterStyle} from "../Theme/Theme";

/**
 * @returns {JSX.Element} - Footer Component
 */

const Footer = () => {
    return (
        <View style={FooterStyle.footerContainer}>
            <Text style={FooterStyle.footerText}>
               Made with <Text style={FooterStyle.loveEmoji}>❤️</Text> CSGrinders, © 2024
            </Text>
        </View>
    );
};


export default Footer;
