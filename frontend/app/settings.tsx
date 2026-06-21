import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 홈 화면의 메뉴 버튼을 통해 진입하는 설정 안내 화면을 표시합니다.
export default function SettingsScreen() {
  return (
    <SafeAreaView style={Styles.SafeArea} edges={["bottom"]}>
      <View style={Styles.Container}>
        <View style={Styles.IconWrap}>
          <FontAwesome color="#68A85F" name="gear" size={48} />
        </View>
        <Text style={Styles.Title}>설정</Text>
        <Text style={Styles.Description}>
          알림, 글자 크기 등 앱 설정 기능이 들어올 예정입니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// 설정 화면의 아이콘, 제목, 안내 문구 배치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  Container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  IconWrap: {
    alignItems: "center",
    backgroundColor: "#F1F6DF",
    borderColor: "#D5E3C0",
    borderRadius: 46,
    borderWidth: 1.5,
    height: 92,
    justifyContent: "center",
    marginBottom: 20,
    width: 92,
  },
  Title: {
    color: "#285F31",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
  },
  Description: {
    color: "#555555",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
  },
});
