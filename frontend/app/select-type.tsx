import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { UserType, useUser } from "@/lib/UserContext";

type TypeCardProps = {
  type: UserType;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  description: string;
  onPress: () => void;
};

// 유저 유형 선택 카드입니다.
function TypeCard({ icon, label, description, onPress }: TypeCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${label} 선택`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [Styles.Card, pressed && Styles.Pressed]}
    >
      <View style={Styles.CardIcon}>
        <MaterialCommunityIcons color="#4A7A2E" name={icon} size={48} />
      </View>
      <Text style={Styles.CardLabel}>{label}</Text>
      <Text style={Styles.CardDescription}>{description}</Text>
    </Pressable>
  );
}

// 앱 첫 실행 시 노년/가족 유저 유형을 선택하는 화면입니다.
// 선택값은 SecureStore에 저장되어 이후 앱 진입 시 자동 적용됩니다.
export default function SelectTypeScreen() {
  const Router = useRouter();
  const { setUserType } = useUser();

  async function HandleSelect(type: UserType) {
    await setUserType(type);
    Router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top", "bottom"]}>
      <View style={Styles.Content}>
        <View style={Styles.Header}>
          <MaterialCommunityIcons color="#4A7A2E" name="leaf" size={36} />
          <Text style={Styles.Title}>처음 오셨군요!</Text>
          <Text style={Styles.Subtitle}>
            어떤 분이신지 알려주세요{"\n"}맞춤 화면으로 안내해드릴게요
          </Text>
        </View>

        <View style={Styles.CardRow}>
          <TypeCard
            description={"일기 쓰고\n퀴즈도 풀어요"}
            icon="account-heart-outline"
            label="어르신"
            onPress={() => HandleSelect("senior")}
            type="senior"
          />
          <TypeCard
            description={"부모님 일기 보고\n사진도 올려요"}
            icon="account-group-outline"
            label="가족"
            onPress={() => HandleSelect("family")}
            type="family"
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: { backgroundColor: "#FFFDF8", flex: 1 },
  Content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  Header: { alignItems: "center", marginBottom: 44 },
  Title: {
    color: "#1E2D18",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 12,
  },
  Subtitle: {
    color: "#6F6B62",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center",
  },
  CardRow: { flexDirection: "row", gap: 16, width: "100%" },
  Card: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E9E5D6",
    borderRadius: 22,
    borderWidth: 1.5,
    elevation: 4,
    flex: 1,
    paddingVertical: 32,
    shadowColor: "#817A60",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  CardIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4E3",
    borderRadius: 20,
    height: 80,
    justifyContent: "center",
    marginBottom: 16,
    width: 80,
  },
  CardLabel: {
    color: "#1E2D18",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  CardDescription: {
    color: "#7A7569",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  Pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
