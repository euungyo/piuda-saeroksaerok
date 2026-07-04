import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

import { useUser } from "@/lib/UserContext";

const ACTIVE_COLOR = "#3E9B35";
const INACTIVE_COLOR = "#343A3D";

const TAB_BAR_STYLE = {
  backgroundColor: "#FFFDF9",
  borderColor: "#ECE9E1",
  borderRadius: 22,
  borderTopWidth: 1,
  elevation: 8,
  height: 70,
  marginBottom: 5,
  marginHorizontal: 10,
  paddingBottom: 7,
  paddingTop: 6,
  shadowColor: "#6B665D",
  shadowOffset: { height: 3, width: 0 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
} as const;

// userType에 따라 노년/가족 탭 구성을 다르게 적용합니다.
// 노년: 홈, 일기(작성+조회), 퀴즈, 가족사진(보기)
// 가족: 홈, 일기(보기), 가족사진(업로드+목록)
export default function TabLayout() {
  const { userType } = useUser();
  const IsFamily = userType === "family";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700", marginTop: 1 },
        tabBarStyle: TAB_BAR_STYLE,
      }}
    >
      {/* 홈 — 양쪽 공통, 내부에서 userType 분기 */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome color={color} name="home" size={24} />
          ),
          title: "홈",
        }}
      />

      {/* 일기 — 노년: 작성+조회 메뉴 / 가족: 일기 목록(읽기 전용) */}
      <Tabs.Screen
        name="diary"
        options={
          IsFamily
            ? { href: null }
            : {
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    color={color}
                    name="notebook-outline"
                    size={25}
                  />
                ),
                title: "일기",
              }
        }
      />
      <Tabs.Screen
        name="diary-list"
        options={
          IsFamily
            ? {
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    color={color}
                    name="notebook-outline"
                    size={25}
                  />
                ),
                title: "일기",
              }
            : { href: null }
        }
      />

      {/* 퀴즈 — 노년만 표시 */}
      <Tabs.Screen
        name="quiz"
        options={
          IsFamily
            ? { href: null }
            : {
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    color={color}
                    name="head-question-outline"
                    size={26}
                  />
                ),
                title: "퀴즈",
              }
        }
      />

      {/* 가족사진 — 노년: 보기만 / 가족: 업로드+목록 */}
      <Tabs.Screen
        name="family"
        options={
          IsFamily
            ? { href: null }
            : {
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    color={color}
                    name="account-group-outline"
                    size={26}
                  />
                ),
                title: "가족사진",
              }
        }
      />
      <Tabs.Screen
        name="family-list"
        options={
          IsFamily
            ? {
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    color={color}
                    name="image-multiple-outline"
                    size={25}
                  />
                ),
                title: "가족사진",
              }
            : { href: null }
        }
      />

      {/* 숨김 라우트 */}
      <Tabs.Screen name="diary-write" options={{ href: null }} />
      <Tabs.Screen name="diary-followup" options={{ href: null }} />
      <Tabs.Screen name="diary-detail" options={{ href: null }} />
      <Tabs.Screen name="family-home" options={{ href: null }} />
      <Tabs.Screen name="family-upload" options={{ href: null }} />
      <Tabs.Screen name="quiz_temp" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
