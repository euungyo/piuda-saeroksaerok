import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DiaryQuestion = {
  placeholder: string;
  question: string;
};

// 질문 API가 연결되기 전 일기 작성 흐름을 확인하기 위한 임시 질문입니다.
const MOCK_DIARY_QUESTIONS: DiaryQuestion[] = [
  {
    question: "오늘 점심은\n무엇을 드셨나요?",
    placeholder: "예: 밥, 국, 김치",
  },
  {
    question: "오늘 가장 기억에\n남는 일은 무엇인가요?",
    placeholder: "오늘 있었던 일을 적어보세요",
  },
  {
    question: "오늘 하루의 기분은\n어떠셨나요?",
    placeholder: "느낀 기분을 편하게 적어보세요",
  },
];

// 질문에 차례대로 답하며 오늘의 일기를 작성하는 화면입니다.
export default function DiaryWriteScreen() {
  const Router = useRouter();
  const [Answers, SetAnswers] = useState<string[]>(
    MOCK_DIARY_QUESTIONS.map(() => ""),
  );
  const [QuestionIndex, SetQuestionIndex] = useState(0);

  const CurrentQuestion = MOCK_DIARY_QUESTIONS[QuestionIndex];
  const IsLastQuestion = QuestionIndex === MOCK_DIARY_QUESTIONS.length - 1;
  const Progress =
    ((QuestionIndex + 1) / MOCK_DIARY_QUESTIONS.length) * 100;

  function HandleBackPress() {
    Router.back();
  }

  function HandleAnswerChange(Value: string) {
    SetAnswers((PreviousAnswers) =>
      PreviousAnswers.map((Answer, Index) =>
        Index === QuestionIndex ? Value : Answer,
      ),
    );
  }

  function HandleVoicePress() {
    // TODO: 음성 인식 기능을 연결해 변환된 문장을 현재 답변에 입력합니다.
    Alert.alert("말로 답하기", "음성 입력 기능을 준비하고 있어요.");
  }

  function HandleNextPress() {
    if (!Answers[QuestionIndex].trim()) {
      Alert.alert("답변을 입력해주세요", "오늘의 이야기를 짧게라도 남겨주세요.");
      return;
    }

    if (!IsLastQuestion) {
      SetQuestionIndex((PreviousIndex) => PreviousIndex + 1);
      return;
    }

    // TODO: Answers를 일기 저장 API로 전송한 뒤 완료 화면으로 이동합니다.
    Alert.alert("오늘의 일기", "일기 저장 API가 연결되면 저장할 수 있어요.");
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={Styles.KeyboardArea}
      >
        <ScrollView
          contentContainerStyle={Styles.Content}
          keyboardShouldPersistTaps="handled"
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
              <Text style={Styles.HeaderTitle}>오늘의 일기</Text>
              <View style={Styles.SubtitleRow}>
                <Text style={Styles.HeaderSubtitle}>
                  질문에 답하고 하루를 기록해요
                </Text>
                <MaterialCommunityIcons
                  color="#91A969"
                  name="sprout"
                  size={18}
                />
              </View>
            </View>

            <View style={Styles.HeaderButton} />
          </View>

          <View style={Styles.ProgressCard}>
            <View style={Styles.ProgressHeader}>
              <Text style={Styles.ProgressText}>
                질문 {QuestionIndex + 1} / {MOCK_DIARY_QUESTIONS.length}
              </Text>
              <MaterialCommunityIcons color="#9DB676" name="leaf" size={24} />
            </View>
            <View style={Styles.ProgressTrack}>
              <View style={[Styles.ProgressFill, { width: `${Progress}%` }]} />
            </View>
          </View>

          <View style={Styles.QuestionCard}>
            <View pointerEvents="none" style={Styles.CardLeaves}>
              <MaterialCommunityIcons color="#A8BC7C" name="leaf" size={30} />
              <MaterialCommunityIcons
                color="#C7D5A4"
                name="leaf"
                size={22}
                style={Styles.SmallLeaf}
              />
            </View>

            <View style={Styles.QuestionIcon}>
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="head-question-outline"
                size={38}
              />
            </View>

            <Text style={Styles.QuestionText}>{CurrentQuestion.question}</Text>

            <TextInput
              accessibilityLabel={`${QuestionIndex + 1}번째 질문 답변`}
              maxLength={500}
              multiline
              onChangeText={HandleAnswerChange}
              placeholder={CurrentQuestion.placeholder}
              placeholderTextColor="#999A92"
              style={Styles.AnswerInput}
              textAlignVertical="top"
              value={Answers[QuestionIndex]}
            />

            <View style={Styles.ButtonArea}>
              <Pressable
                accessibilityLabel="말로 답하기"
                accessibilityRole="button"
                onPress={HandleVoicePress}
                style={({ pressed }) => [
                  Styles.VoiceButton,
                  pressed && Styles.Pressed,
                ]}
              >
                <MaterialCommunityIcons
                  color="#FFFFFF"
                  name="microphone-outline"
                  size={26}
                />
                <Text style={Styles.ButtonText}>말로 답하기</Text>
              </Pressable>

              <Pressable
                accessibilityLabel={
                  IsLastQuestion ? "일기 작성 완료" : "다음 질문으로 이동"
                }
                accessibilityRole="button"
                onPress={HandleNextPress}
                style={({ pressed }) => [
                  Styles.NextButton,
                  pressed && Styles.Pressed,
                ]}
              >
                <Text style={Styles.ButtonText}>
                  {IsLastQuestion ? "작성 완료" : "다음 질문"}
                </Text>
                <FontAwesome color="#FFFFFF" name="angle-right" size={24} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  KeyboardArea: {
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
    minHeight: 66,
    paddingTop: 5,
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
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -1,
  },
  SubtitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 5,
  },
  HeaderSubtitle: {
    color: "#6F6B62",
    fontSize: 12,
    fontWeight: "600",
  },
  ProgressCard: {
    backgroundColor: "#FFFEFB",
    borderColor: "#ECE9DC",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  ProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ProgressText: {
    color: "#42483B",
    fontSize: 13,
    fontWeight: "900",
  },
  ProgressTrack: {
    backgroundColor: "#EDEBD9",
    borderRadius: 6,
    height: 9,
    marginTop: 5,
    overflow: "hidden",
  },
  ProgressFill: {
    backgroundColor: "#759650",
    borderRadius: 6,
    height: "100%",
  },
  QuestionCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E5E0CF",
    borderRadius: 18,
    borderWidth: 1.2,
    elevation: 3,
    flex: 1,
    marginTop: 14,
    minHeight: 445,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 7,
  },
  CardLeaves: {
    position: "absolute",
    right: 2,
    top: 2,
    transform: [{ rotate: "210deg" }],
  },
  SmallLeaf: {
    marginLeft: 18,
    marginTop: -11,
    transform: [{ rotate: "38deg" }],
  },
  QuestionIcon: {
    alignItems: "center",
    backgroundColor: "#759657",
    borderRadius: 29,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  QuestionText: {
    color: "#294127",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
    marginTop: 8,
    textAlign: "center",
  },
  AnswerInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8D1AD",
    borderRadius: 12,
    borderWidth: 1.2,
    color: "#45463F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 13,
    minHeight: 100,
    padding: 13,
    width: "100%",
  },
  ButtonArea: {
    gap: 10,
    marginTop: "auto",
    paddingTop: 14,
    width: "100%",
  },
  VoiceButton: {
    alignItems: "center",
    backgroundColor: "#718F51",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
  },
  NextButton: {
    alignItems: "center",
    backgroundColor: "#718F51",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  ButtonText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});
