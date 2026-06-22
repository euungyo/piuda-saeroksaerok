import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 퀴즈 API가 연결되기 전 화면에 표시할 임시 데이터입니다.
const MOCK_DAILY_QUIZ = {
  category: "초성퀴즈",
  dayLabel: "월요일",
  questionCount: 5,
};

// 오늘의 퀴즈 시작 화면입니다.
export default function QuizScreen() {
  const Router = useRouter();

  function HandleBackPress() {
    Router.back();
  }

  function HandleStartPress() {
    // TODO: 퀴즈 조회 API 호출 후 첫 번째 문제 화면으로 이동합니다.
    Alert.alert("오늘의 퀴즈", "퀴즈 문제 화면을 준비하고 있어요.");
  }

  function HandleLaterPress() {
    Router.replace("/");
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
            style={({ pressed }) => [
              Styles.HeaderButton,
              pressed && Styles.Pressed,
            ]}
          >
            <FontAwesome color="#465735" name="angle-left" size={31} />
          </Pressable>

          <View style={Styles.HeaderTextArea}>
            <Text style={Styles.HeaderTitle}>오늘의 퀴즈</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>
                기억력과 암기력을 키워요
              </Text>
              <MaterialCommunityIcons color="#91A969" name="sprout" size={18} />
            </View>
          </View>

          <View style={Styles.HeaderButton} />
        </View>

        <View pointerEvents="none" style={Styles.TopLeftLeaves}>
          <MaterialCommunityIcons color="#9FB77A" name="leaf" size={34} />
          <MaterialCommunityIcons
            color="#C2D09E"
            name="leaf"
            size={25}
            style={Styles.TopLeafSecond}
          />
        </View>
        <View pointerEvents="none" style={Styles.TopRightLeaves}>
          <MaterialCommunityIcons color="#9FB77A" name="leaf" size={34} />
          <MaterialCommunityIcons
            color="#C2D09E"
            name="leaf"
            size={25}
            style={Styles.TopLeafSecond}
          />
        </View>

        <View style={Styles.QuizCard}>
          <View style={Styles.BrainIconBackground}>
            <MaterialCommunityIcons
              color="#4D7137"
              name="lightbulb-on-outline"
              size={57}
            />
          </View>

          <Text style={Styles.MainTitle}>
            오늘의 퀴즈를{"\n"}시작해볼까요?
          </Text>

          <View style={Styles.DividerRow}>
            <View style={Styles.Divider} />
            <MaterialCommunityIcons color="#91B75F" name="leaf" size={25} />
            <View style={Styles.Divider} />
          </View>

          <Text style={Styles.QuizDescription}>
            오늘은 {MOCK_DAILY_QUIZ.dayLabel} {MOCK_DAILY_QUIZ.category}예요
          </Text>
          <Text style={Styles.QuizCount}>
            총 {MOCK_DAILY_QUIZ.questionCount}문제를 풀어보세요
          </Text>

          <View style={Styles.ButtonArea}>
            <Pressable
              accessibilityLabel="오늘의 퀴즈 시작하기"
              accessibilityRole="button"
              onPress={HandleStartPress}
              style={({ pressed }) => [
                Styles.StartButton,
                pressed && Styles.Pressed,
              ]}
            >
              <Text style={Styles.StartButtonText}>시작하기</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="퀴즈를 나중에 하고 홈으로 이동"
              accessibilityRole="button"
              onPress={HandleLaterPress}
              style={({ pressed }) => [
                Styles.LaterButton,
                pressed && Styles.Pressed,
              ]}
            >
              <Text style={Styles.LaterButtonText}>나중에 할게요</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  Content: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 12,
    paddingHorizontal: 10,
    width: "100%",
  },
  Header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 100,
    paddingTop: 7,
  },
  HeaderButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  HeaderTextArea: {
    alignItems: "center",
    flex: 1,
  },
  HeaderTitle: {
    color: "#34482A",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  SubtitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 7,
  },
  HeaderSubtitle: {
    color: "#6F6B62",
    fontSize: 14,
    fontWeight: "600",
  },
  TopLeftLeaves: {
    left: -10,
    position: "absolute",
    top: 60,
    transform: [{ rotate: "-30deg" }],
  },
  TopRightLeaves: {
    position: "absolute",
    right: -9,
    top: 65,
    transform: [{ rotate: "205deg" }],
  },
  TopLeafSecond: {
    marginLeft: 17,
    marginTop: -14,
    transform: [{ rotate: "35deg" }],
  },
  QuizCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E9E5D6",
    borderRadius: 22,
    borderWidth: 1.2,
    elevation: 3,
    flex: 1,
    minHeight: 475,
    paddingBottom: 20,
    paddingHorizontal: 28,
    paddingTop: 25,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  BrainIconBackground: {
    alignItems: "center",
    backgroundColor: "#F0F4DF",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  MainTitle: {
    color: "#284E28",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.4,
    lineHeight: 47,
    marginTop: 20,
    textAlign: "center",
  },
  DividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
    marginTop: 22,
    width: "83%",
  },
  Divider: {
    backgroundColor: "#ECE9DF",
    flex: 1,
    height: 1,
  },
  QuizDescription: {
    color: "#5F625B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
  QuizCount: {
    color: "#5F625B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 11,
    textAlign: "center",
  },
  ButtonArea: {
    gap: 10,
    marginTop: "auto",
    paddingTop: 28,
    width: "100%",
  },
  StartButton: {
    alignItems: "center",
    backgroundColor: "#779B4D",
    borderRadius: 13,
    justifyContent: "center",
    minHeight: 52,
  },
  StartButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  LaterButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#779B4D",
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 45,
  },
  LaterButtonText: {
    color: "#668743",
    fontSize: 16,
    fontWeight: "800",
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});
