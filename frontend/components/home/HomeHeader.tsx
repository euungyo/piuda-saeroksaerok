import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// 홈 화면 상단에 서비스 이름과 설정 메뉴 버튼을 표시합니다.
export default function HomeHeader() {
  // 설정 메뉴 버튼을 눌렀을 때 화면을 이동시키는 라우터 객체입니다.
  const Router = useRouter();

  // 설정 메뉴 버튼 클릭 시 설정 화면으로 이동합니다.
  function HandleSettingsPress() {
    Router.push("/settings");
  }

  return (
    <View style={Styles.Container}>
      <View style={Styles.BrandArea}>
        <View style={Styles.BrandRow}>
          <Text numberOfLines={1} style={Styles.BrandName}>
            새록새록
          </Text>
        </View>
        <Text numberOfLines={1} style={Styles.BrandMessage}>
          기억을 담고, 마음을 잇다
        </Text>
      </View>

      <Pressable
        accessibilityLabel="설정 화면으로 이동"
        accessibilityRole="button"
        onPress={HandleSettingsPress}
        style={({ pressed }) => [
          Styles.NotificationButton,
          pressed && Styles.Pressed,
        ]}
      >
        <View style={Styles.SettingsIconWrap}>
          <FontAwesome color="#68A85F" name="bars" size={27} />
        </View>
      </Pressable>
    </View>
  );
}

// 홈 헤더의 서비스명, 설명 문구, 메뉴 버튼 배치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  Container: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 96,
    paddingBottom: 9,
    paddingHorizontal: 5,
    paddingTop: 4,
  },
  BrandArea: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  BrandRow: {
    alignItems: "center",
    flexDirection: "row",
    height: 52,
  },
  BrandName: {
    color: "#285F31",
    flexShrink: 1,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  BrandMessage: {
    color: "#32663A",
    fontSize: 14,
    marginTop: -2,
  },
  NotificationButton: {
    alignItems: "center",
    flexShrink: 0,
    marginTop: 12,
    width: 58,
  },
  SettingsIconWrap: {
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    borderColor: "#DDE8CD",
    borderRadius: 27,
    borderWidth: 1.3,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  Pressed: {
    opacity: 0.7,
  },
});
