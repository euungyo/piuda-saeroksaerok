import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HomeHeader from "@/components/home/HomeHeader";
import HomeMenuGrid from "@/components/home/HomeMenuGrid";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import { useUser } from "@/lib/UserContext";
import FamilyHomeScreen from "./family-home";

// userType에 따라 노년 홈 또는 가족 홈 화면을 표시합니다.
// userType이 없으면(첫 실행) 유저 유형 선택 화면으로 이동합니다.
export default function HomeScreen() {
  const { userType, isLoading, clearUserType } = useUser();
  const Router = useRouter();

  useEffect(() => {
    if (!isLoading && userType === null) {
      Router.replace("/select-type");
    }
  }, [isLoading, userType]);

  if (isLoading) {
    return (
      <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
        <View style={Styles.Loading}>
          <ActivityIndicator color="#4A7A2E" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (userType === "family") {
    return <FamilyHomeScreen />;
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <View style={Styles.Content}>
        {/* [DEV] 유저 유형 전환 */}
        <Pressable
          onPress={async () => { await clearUserType(); Router.replace("/select-type"); }}
          style={{ alignSelf: "flex-end", backgroundColor: "#E8F0DE", borderRadius: 8, marginBottom: 4, paddingHorizontal: 10, paddingVertical: 4 }}
        >
          <Text style={{ color: "#4A7A2E", fontSize: 11 }}>DEV: 유형 전환</Text>
        </Pressable>
        <HomeHeader />
        <WelcomeBanner />
        <HomeMenuGrid />
      </View>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: { backgroundColor: "#FFFDF8", flex: 1 },
  Content: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 430,
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 4,
    width: "100%",
  },
  Loading: { alignItems: "center", flex: 1, justifyContent: "center" },
});
