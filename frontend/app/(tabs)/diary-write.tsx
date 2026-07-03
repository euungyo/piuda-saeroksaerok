import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { FetchDailyQuestions, SubmitDiaryAnswers, type DiaryQuestion } from "@/lib/api";
import { ShowAlert } from "@/lib/alert";

// 질문에 차례대로 답하며 오늘의 일기를 작성하는 화면입니다.
export default function DiaryWriteScreen() {
  const Router = useRouter();
  const [Questions, SetQuestions] = useState<DiaryQuestion[]>([]);
  const [Answers, SetAnswers] = useState<string[]>([]);
  const [QuestionIndex, SetQuestionIndex] = useState(0);
  const [Loading, SetLoading] = useState(true);
  const [LoadError, SetLoadError] = useState<string | null>(null);
  const [Submitting, SetSubmitting] = useState(false);

  useEffect(() => {
    LoadQuestions();
  }, []);

  // 백엔드에서 오늘의 질문을 받아옵니다.
  async function LoadQuestions() {
    SetLoading(true);
    SetLoadError(null);

    try {
      const Data = await FetchDailyQuestions(3);
      SetQuestions(Data);
      SetAnswers(Data.map(() => ""));
      SetQuestionIndex(0);
    } catch (Error_) {
      SetLoadError(
        Error_ instanceof Error ? Error_.message : "질문을 불러오지 못했어요.",
      );
    } finally {
      SetLoading(false);
    }
  }

  const HasQuestions = Questions.length > 0;
  const CurrentQuestion = Questions[QuestionIndex];
  const IsLastQuestion = QuestionIndex === Questions.length - 1;
  const Progress = HasQuestions
    ? ((QuestionIndex + 1) / Questions.length) * 100
    : 0;

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
    ShowAlert("말로 답하기", "음성 입력 기능을 준비하고 있어요.");
  }

  async function HandleNextPress() {
    if (!Answers[QuestionIndex].trim()) {
      ShowAlert("답변을 입력해주세요", "오늘의 이야기를 짧게라도 남겨주세요.");
      return;
    }

    if (!IsLastQuestion) {
      SetQuestionIndex((PreviousIndex) => PreviousIndex + 1);
      return;
    }

    // 마지막 질문이면 모든 답변을 일기 저장 API로 전송합니다.
    SetSubmitting(true);

    try {
      const Saved = await SubmitDiaryAnswers(
        Questions.map((Question, Index) => ({
          questionId: Question._id,
          answer: Answers[Index].trim(),
        })),
      );

      // 저장 후 AI 꼬리질문 페이지로 이동 (저장된 일기 id 전달)
      Router.replace({
        pathname: "./diary-followup",
        params: { id: Saved._id },
      });
    } catch (Error_) {
      ShowAlert(
        "저장 실패",
        Error_ instanceof Error ? Error_.message : "저장에 실패했어요.",
      );
    } finally {
      SetSubmitting(false);
    }
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

          {Loading ? (
            <View style={Styles.StateArea}>
              <ActivityIndicator color="#759650" size="large" />
              <Text style={Styles.StateText}>질문을 불러오는 중이에요...</Text>
            </View>
          ) : LoadError ? (
            <View style={Styles.StateArea}>
              <MaterialCommunityIcons
                color="#B6735B"
                name="alert-circle-outline"
                size={44}
              />
              <Text style={Styles.StateText}>{LoadError}</Text>
              <Pressable
                accessibilityLabel="다시 시도"
                accessibilityRole="button"
                onPress={LoadQuestions}
                style={({ pressed }) => [
                  Styles.RetryButton,
                  pressed && Styles.Pressed,
                ]}
              >
                <Text style={Styles.RetryText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : !HasQuestions ? (
            <View style={Styles.StateArea}>
              <Text style={Styles.StateText}>등록된 질문이 없어요.</Text>
            </View>
          ) : (
            <>
              <View style={Styles.ProgressCard}>
                <View style={Styles.ProgressHeader}>
                  <Text style={Styles.ProgressText}>
                    질문 {QuestionIndex + 1} / {Questions.length}
                  </Text>
                  <MaterialCommunityIcons
                    color="#9DB676"
                    name="leaf"
                    size={24}
                  />
                </View>
                <View style={Styles.ProgressTrack}>
                  <View
                    style={[Styles.ProgressFill, { width: `${Progress}%` }]}
                  />
                </View>
              </View>

              <View style={Styles.QuestionCard}>
                <View pointerEvents="none" style={Styles.CardLeaves}>
                  <MaterialCommunityIcons
                    color="#A8BC7C"
                    name="leaf"
                    size={30}
                  />
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

                <Text style={Styles.QuestionText}>{CurrentQuestion.text}</Text>

                <TextInput
                  accessibilityLabel={`${QuestionIndex + 1}번째 질문 답변`}
                  editable={!Submitting}
                  maxLength={500}
                  multiline
                  onChangeText={HandleAnswerChange}
                  placeholder="오늘 있었던 일을 편하게 적어보세요"
                  placeholderTextColor="#999A92"
                  style={Styles.AnswerInput}
                  textAlignVertical="top"
                  value={Answers[QuestionIndex]}
                />

                <View style={Styles.ButtonArea}>
                  <Pressable
                    accessibilityLabel="말로 답하기"
                    accessibilityRole="button"
                    disabled={Submitting}
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
                    disabled={Submitting}
                    onPress={HandleNextPress}
                    style={({ pressed }) => [
                      Styles.NextButton,
                      pressed && Styles.Pressed,
                    ]}
                  >
                    {Submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={Styles.ButtonText}>
                          {IsLastQuestion ? "작성 완료" : "다음 질문"}
                        </Text>
                        <FontAwesome
                          color="#FFFFFF"
                          name="angle-right"
                          size={24}
                        />
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </>
          )}
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
  StateArea: {
    alignItems: "center",
    flex: 1,
    gap: 14,
    justifyContent: "center",
    minHeight: 420,
    paddingHorizontal: 20,
  },
  StateText: {
    color: "#66645E",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  RetryButton: {
    backgroundColor: "#718F51",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 30,
  },
  RetryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
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
