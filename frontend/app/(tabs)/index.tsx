import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HomeHeader from "@/components/home/HomeHeader";
import HomeMenuGrid from "@/components/home/HomeMenuGrid";
import WelcomeBanner from "@/components/home/WelcomeBanner";

// 홈 화면의 헤더, 환영 배너, 주요 메뉴 카드를 순서대로 배치합니다.
export default function HomeScreen() {
  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <View style={Styles.Content}>
        <HomeHeader />
        <WelcomeBanner />
        <HomeMenuGrid />
      </View>
    </SafeAreaView>
  );
}

// 휴대폰 화면 안에서 홈 콘텐츠의 크기와 여백을 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  Content: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 430,
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 4,
    width: "100%",
  },
});
