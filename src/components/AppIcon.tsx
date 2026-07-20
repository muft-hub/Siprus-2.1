import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
};

const DEFAULT_COLOR = '#64748B';
const DEFAULT_SIZE = 16;

const AppIcon: React.FC<Props> = ({ name, size = DEFAULT_SIZE, color, style }) => {
  return <MaterialCommunityIcons name={name} size={size} color={color || DEFAULT_COLOR} style={style} />;
};

export default AppIcon;
