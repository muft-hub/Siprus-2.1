declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { TextStyle } from 'react-native';
  export type IconProps = {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  };
  interface MaterialCommunityIconsType extends ComponentType<IconProps> {
    loadFont?: () => void;
  }
  const MaterialCommunityIcons: MaterialCommunityIconsType;
  export default MaterialCommunityIcons;
}
