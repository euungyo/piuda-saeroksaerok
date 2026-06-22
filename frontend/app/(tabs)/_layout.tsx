import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

// 현재 선택된 하단 탭의 아이콘과 글자에 사용하는 초록색입니다.
const ACTIVE_COLOR = "#3E9B35";
// 선택되지 않은 하단 탭의 아이콘과 글자에 사용하는 색상입니다.
const INACTIVE_COLOR = "#343A3D";

// 홈, 일기, 퀴즈, 가족사진 화면을 이동하는 하단 탭 메뉴를 구성합니다.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 1,
        },
        tabBarStyle: {
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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome color={color} name="home" size={24} />
          ),
          title: "홈",
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              color={color}
              name="notebook-outline"
              size={25}
            />
          ),
          title: "일기",
        }}
      />
      <Tabs.Screen name="diary-list" options={{ href: null }} />
      <Tabs.Screen
        name="quiz"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              color={color}
              name="head-question-outline"
              size={26}
            />
          ),
          title: "퀴즈",
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              color={color}
              name="account-group-outline"
              size={26}
            />
          ),
          title: "가족사진",
        }}
      />
      <Tabs.Screen name="family-list" options={{ href: null }} />
      <Tabs.Screen name="family-upload" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
