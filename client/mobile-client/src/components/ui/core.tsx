import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { cssInterop } from 'nativewind';

export const StyledView = cssInterop(View, { className: 'style' });
export const StyledText = cssInterop(Text, { className: 'style' });
export const StyledPressable = cssInterop(Pressable, { className: 'style' });
export const StyledTextInput = cssInterop(TextInput, { className: 'style' });
export const StyledScrollView = cssInterop(ScrollView, { className: 'style' });
export const StyledSafeAreaView = cssInterop(SafeAreaView, { className: 'style' });
export const StyledFlatList = cssInterop(FlatList, { className: 'style' });
export const StyledActivityIndicator = cssInterop(ActivityIndicator, { className: 'style' });
export const StyledImage = cssInterop(Image, { className: 'style' });
export const StyledSwitch = cssInterop(Switch, { className: 'style' });
