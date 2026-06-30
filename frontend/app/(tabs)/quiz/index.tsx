import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 각 퀴즈 유형에 표시할 아이콘과 설명입니다.
const QUIZ_TYPE_META: { type: string; label: string; icon: string; description: string }[] = [
  { type: "consonant", label: "초성퀴즈", icon: "alphabetical-variant", description: "초성을 보고 단어를 맞춰보세요" },
  { type: "general",   label: "상식퀴즈",  icon: "lightbulb-on-outline",  description: "일상 속 상식 문제를 풀어보세요" },
  { type: "opposite",  label: "반댓말퀴즈", icon: "swap-horizontal",       description: "반대되는 말을 골라보세요" },
  { type: "blank",     label: "빈칸채우기", icon: "text-box-outline",      description: "빈칸에 들어갈 말을 맞춰보세요" },
];

// TODO: 요일별 자동 유형 선택 로직 (나중에 유형 선택 화면 대신 사용)
// const DAY_QUIZ_TYPE: Record<number, string> = {
//   0: "general",   // 일
//   1: "consonant", // 월
//   2: "general",   // 화
//   3: "opposite",  // 수
//   4: "blank",     // 목
//   5: "consonant", // 금
//   6: "opposite",  // 토
// };

// 퀴즈 유형 선택 화면입니다. 4가지 유형 카드를 보여주고 선택한 유형으로 풀이 화면에 진입합니다.
// TODO: 유형 선택 → 요일별 자동 결정으로 전환 시 DAY_QUIZ_TYPE 주석 해제 후 이 컴포넌트 교체
export default function QuizIndexScreen() {
  const Router = useRouter();

  function HandleBackPress() {
    Router.back();
  }

  // 선택한 퀴즈 유형을 파라미터로 전달하며 풀이 화면으로 이동합니다.
  function HandleTypePress(QuizType: string) {
    Router.push({ pathname: "/(tabs)/quiz/play", params: { type: QuizType } });
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={Styles.Content}
        showsVerticalScrollIndicator={false}
      >
        <View style={Styles.Header}>
          <Pressable
            accessibilityLabel="이전 화면으로 이동"
            accessibilityRole="button"
            onPress={HandleBackPress}
            style={({ pressed }) => [Styles.HeaderButton, pressed && Styles.Pressed]}
          >
            <FontAwesome color="#465735" name="angle-left" size={31} />
          </Pressable>

          <View style={Styles.HeaderTextArea}>
            <Text style={Styles.HeaderTitle}>오늘의 퀴즈</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>기억력과 암기력을 키워요</Text>
              <MaterialCommunityIcons color="#91A969" name="sprout" size={18} />
            </View>
          </View>

          <View style={Styles.HeaderButton} />
        </View>

        <View pointerEvents="none" style={Styles.TopLeftLeaves}>
          <MaterialCommunityIcons color="#9FB77A" name="leaf" size={34} />
          <MaterialCommunityIcons color="#C2D09E" name="leaf" size={25} style={Styles.TopLeafSecond} />
        </View>
        <View pointerEvents="none" style={Styles.TopRightLeaves}>
          <MaterialCommunityIcons color="#9FB77A" name="leaf" size={34} />
          <MaterialCommunityIcons color="#C2D09E" name="leaf" size={25} style={Styles.TopLeafSecond} />
        </View>

        <Text style={Styles.SelectTitle}>풀고 싶은 퀴즈를{"\n"}골라보세요</Text>

        {/* 오늘의 퀴즈 카드 */}
        <Pressable
          accessibilityLabel="오늘의 퀴즈 시작하기"
          accessibilityRole="button"
          onPress={() => Router.push("/(tabs)/quiz/today")}
          style={({ pressed }) => [Styles.TodayCard, pressed && Styles.Pressed]}
        >
          <View style={Styles.TodayIconWrap}>
            <MaterialCommunityIcons color="#FFFFFF" name="star-outline" size={32} />
          </View>
          <View style={Styles.TodayTextArea}>
            <Text style={Styles.TodayLabel}>오늘의 퀴즈</Text>
            <Text style={Styles.TodayDescription}>오늘 하루 랜덤 문제에 도전해보세요</Text>
          </View>
          <FontAwesome color="#FFFFFF" name="angle-right" size={22} />
        </Pressable>

        <View style={Styles.TypeList}>
          {QUIZ_TYPE_META.map((Item) => (
            <Pressable
              key={Item.type}
              accessibilityLabel={`${Item.label} 시작하기`}
              accessibilityRole="button"
              onPress={() => HandleTypePress(Item.type)}
              style={({ pressed }) => [Styles.TypeCard, pressed && Styles.Pressed]}
            >
              <View style={Styles.TypeIconWrap}>
                <MaterialCommunityIcons
                  color="#4D7137"
                  name={Item.icon as any}
                  size={36}
                />
              </View>
              <View style={Styles.TypeTextArea}>
                <Text style={Styles.TypeLabel}>{Item.label}</Text>
                <Text style={Styles.TypeDescription}>{Item.description}</Text>
              </View>
              <FontAwesome color="#8AAE65" name="angle-right" size={22} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: { backgroundColor: "#FFFDF8", flex: 1 },
  Content: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 20,
    paddingHorizontal: 14,
    width: "100%",
  },
  Header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 100,
    paddingTop: 7,
  },
  HeaderButton: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
  HeaderTextArea: { alignItems: "center", flex: 1 },
  HeaderTitle: { color: "#34482A", fontSize: 27, fontWeight: "900", letterSpacing: -1.2 },
  SubtitleRow: { alignItems: "center", flexDirection: "row", gap: 3, marginTop: 7 },
  HeaderSubtitle: { color: "#6F6B62", fontSize: 14, fontWeight: "600" },
  TopLeftLeaves: { left: -10, position: "absolute", top: 60, transform: [{ rotate: "-30deg" }] },
  TopRightLeaves: { position: "absolute", right: -9, top: 65, transform: [{ rotate: "205deg" }] },
  TopLeafSecond: { marginLeft: 17, marginTop: -14, transform: [{ rotate: "35deg" }] },
  SelectTitle: {
    color: "#284E28",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 20,
    marginTop: 8,
    textAlign: "center",
  },
  TodayCard: {
    alignItems: "center",
    backgroundColor: "#5E8C3A",
    borderRadius: 18,
    elevation: 4,
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#3A5E25",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  TodayIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  TodayTextArea: { flex: 1 },
  TodayLabel: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", letterSpacing: -0.5 },
  TodayDescription: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "600", marginTop: 3 },
  TypeList: { gap: 14 },
  TypeCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E9E5D6",
    borderRadius: 18,
    borderWidth: 1.2,
    elevation: 3,
    flexDirection: "row",
    gap: 14,
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  TypeIconWrap: {
    alignItems: "center",
    backgroundColor: "#F0F4DF",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  TypeTextArea: { flex: 1 },
  TypeLabel: { color: "#2D3A24", fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  TypeDescription: { color: "#6F6B62", fontSize: 13, fontWeight: "600", marginTop: 3 },
  Pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
});
