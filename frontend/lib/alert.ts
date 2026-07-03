import { Alert, Platform } from "react-native";

// react-native-web 에서는 Alert.alert 가 화면에 표시되지 않으므로,
// 웹에서는 window.alert 로 대체해 문구가 항상 보이도록 합니다.
export function ShowAlert(Title: string, Message?: string, OnConfirm?: () => void) {
  if (Platform.OS === "web") {
    const Text = Message ? `${Title}\n\n${Message}` : Title;
    window.alert(Text);
    OnConfirm?.();
    return;
  }

  Alert.alert(
    Title,
    Message,
    OnConfirm ? [{ text: "확인", onPress: OnConfirm }] : undefined,
  );
}
