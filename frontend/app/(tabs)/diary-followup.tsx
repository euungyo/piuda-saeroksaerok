import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

import {
  ComposeDiary,
  FetchFollowups,
  SaveFollowups,
  type FollowupTopic,
} from "@/lib/api";
import { ShowAlert } from "@/lib/alert";

type Step = "intro" | "loading" | "answering" | "composing" | "error";

// 작성한 일기를 바탕으로 AI 꼬리질문을 받고, 최종적으로 AI가 일기를 완성하는 화면입니다.
export default function DiaryFollowupScreen() {
  const Router = useRouter();
  const Params = useLocalSearchParams<{ id?: string | string[] }>();
  const DiaryId = Array.isArray(Params.id) ? Params.id[0] : Params.id;

  const [CurrentStep, SetCurrentStep] = useState<Step>("intro");
  const [Topics, SetTopics] = useState<FollowupTopic[]>([]);
  const [Answers, SetAnswers] = useState<string[][]>([]);
  const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);

  function GoToList() {
    Router.replace("./diary-list");
  }

  // "네, 답할게요" → AI 꼬리질문 생성 요청
  async function HandleAccept() {
    if (!DiaryId) {
      ShowAlert("오류", "일기 정보를 찾을 수 없어요.");
      GoToList();
      return;
    }

    SetCurrentStep("loading");
    SetErrorMessage(null);

    try {
      const Result = await FetchFollowups(DiaryId);
      SetTopics(Result.topics);
      SetAnswers(Result.topics.map((Topic) => Topic.followups.map(() => "")));
      SetCurrentStep("answering");
    } catch (Error_) {
      SetErrorMessage(
        Error_ instanceof Error ? Error_.message : "꼬리질문을 불러오지 못했어요.",
      );
      SetCurrentStep("error");
    }
  }

  function HandleAnswerChange(
    TopicIndex: number,
    FollowupIndex: number,
    Value: string,
  ) {
    SetAnswers((Previous) =>
      Previous.map((TopicAnswers, Ti) =>
        Ti === TopicIndex
          ? TopicAnswers.map((Answer, Fi) =>
              Fi === FollowupIndex ? Value : Answer,
            )
          : TopicAnswers,
      ),
    );
  }

  // "완료" → 꼬리질문 답변 저장 후 AI 일기 작성
  async function HandleFinish() {
    if (!DiaryId) {
      return;
    }

    SetCurrentStep("composing");

    try {
      await SaveFollowups(
        DiaryId,
        Topics.map((Topic, Ti) => ({
          questionId: Topic.questionId,
          items: Topic.followups.map((Question, Fi) => ({
            question: Question,
            answer: Answers[Ti][Fi].trim(),
          })),
        })),
      );

      await ComposeDiary(DiaryId);
      GoToList();
    } catch (Error_) {
      ShowAlert(
        "일기 작성 실패",
        Error_ instanceof Error ? Error_.message : "다시 시도해주세요.",
      );
      SetCurrentStep("answering");
    }
  }

  // "아니요, 나중에 할게요" → 꼬리질문 없이 기본 답변만으로 AI 일기 작성
  async function HandleDecline() {
    if (!DiaryId) {
      GoToList();
      return;
    }

    SetCurrentStep("composing");

    try {
      await ComposeDiary(DiaryId);
    } catch {
      // 작성 실패해도 답변은 이미 저장돼 있으므로 목록으로 이동합니다.
    }

    GoToList();
  }

  const ShowIntroCard =
    CurrentStep === "intro" ||
    CurrentStep === "loading" ||
    CurrentStep === "composing" ||
    CurrentStep === "error";

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
              onPress={GoToList}
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

          {ShowIntroCard && (
            <View style={Styles.IntroCard}>
              <View pointerEvents="none" style={Styles.CardLeaves}>
                <MaterialCommunityIcons color="#A8BC7C" name="leaf" size={30} />
                <MaterialCommunityIcons
                  color="#C7D5A4"
                  name="leaf"
                  size={22}
                  style={Styles.SmallLeaf}
                />
              </View>

              <View style={Styles.RobotIcon}>
                <MaterialCommunityIcons
                  color="#FFFFFF"
                  name="robot-happy-outline"
                  size={40}
                />
              </View>

              {CurrentStep === "loading" || CurrentStep === "composing" ? (
                <>
                  <ActivityIndicator
                    color="#759650"
                    size="large"
                    style={Styles.IntroSpinner}
                  />
                  <Text style={Styles.IntroSubtitle}>
                    {CurrentStep === "loading"
                      ? "작성해주신 내용을 바탕으로\nAI가 질문을 만들고 있어요..."
                      : "오늘의 답변을 모아\nAI가 일기를 쓰고 있어요..."}
                  </Text>
                </>
              ) : CurrentStep === "error" ? (
                <>
                  <Text style={Styles.IntroTitle}>
                    꼬리질문을 불러오지 못했어요
                  </Text>
                  <Text style={Styles.IntroSubtitle}>{ErrorMessage}</Text>
                  <Pressable
                    accessibilityLabel="다시 시도"
                    accessibilityRole="button"
                    onPress={HandleAccept}
                    style={({ pressed }) => [
                      Styles.PrimaryButton,
                      pressed && Styles.Pressed,
                    ]}
                  >
                    <Text style={Styles.PrimaryButtonText}>다시 시도</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="건너뛰기"
                    accessibilityRole="button"
                    onPress={HandleDecline}
                    style={({ pressed }) => [
                      Styles.SecondaryButton,
                      pressed && Styles.Pressed,
                    ]}
                  >
                    <Text style={Styles.SecondaryButtonText}>건너뛰기</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={Styles.IntroTitle}>
                    AI 꼬리 질문에{"\n"}답해보시겠어요?
                  </Text>
                  <Text style={Styles.IntroSubtitle}>
                    작성해주신 내용을 바탕으로{"\n"}AI가 몇 가지 질문을 드려요
                  </Text>
                  <Text style={Styles.IntroHint}>답하지 않아도 괜찮아요</Text>

                  <Pressable
                    accessibilityLabel="네, 답할게요"
                    accessibilityRole="button"
                    onPress={HandleAccept}
                    style={({ pressed }) => [
                      Styles.PrimaryButton,
                      pressed && Styles.Pressed,
                    ]}
                  >
                    <Text style={Styles.PrimaryButtonText}>네, 답할게요</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="아니요, 나중에 할게요"
                    accessibilityRole="button"
                    onPress={HandleDecline}
                    style={({ pressed }) => [
                      Styles.SecondaryButton,
                      pressed && Styles.Pressed,
                    ]}
                  >
                    <Text style={Styles.SecondaryButtonText}>
                      아니요, 나중에 할게요
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}

          {CurrentStep === "answering" && (
            <View style={Styles.AnswerArea}>
              {Topics.map((Topic, Ti) => (
                <View key={Topic.questionId} style={Styles.TopicCard}>
                  <Text style={Styles.TopicBase}>
                    “{Topic.answer}”라고 답하셨어요
                  </Text>

                  {Topic.followups.map((Question, Fi) => (
                    <View key={Fi} style={Styles.FollowupBlock}>
                      <View style={Styles.FollowupQuestionRow}>
                        <MaterialCommunityIcons
                          color="#759657"
                          name="robot-happy-outline"
                          size={20}
                        />
                        <Text style={Styles.FollowupQuestion}>{Question}</Text>
                      </View>
                      <TextInput
                        accessibilityLabel={`꼬리질문 답변 ${Ti + 1}-${Fi + 1}`}
                        maxLength={500}
                        multiline
                        onChangeText={(Value) =>
                          HandleAnswerChange(Ti, Fi, Value)
                        }
                        placeholder="편하게 답해보세요"
                        placeholderTextColor="#999A92"
                        style={Styles.FollowupInput}
                        textAlignVertical="top"
                        value={Answers[Ti]?.[Fi] ?? ""}
                      />
                    </View>
                  ))}
                </View>
              ))}

              <Pressable
                accessibilityLabel="꼬리질문 답변 완료"
                accessibilityRole="button"
                onPress={HandleFinish}
                style={({ pressed }) => [
                  Styles.PrimaryButton,
                  Styles.SubmitButton,
                  pressed && Styles.Pressed,
                ]}
              >
                <Text style={Styles.PrimaryButtonText}>완료</Text>
              </Pressable>
            </View>
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
    paddingBottom: 18,
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
  IntroCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E5E0CF",
    borderRadius: 18,
    borderWidth: 1.2,
    elevation: 3,
    marginTop: 14,
    minHeight: 420,
    overflow: "hidden",
    padding: 20,
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
  RobotIcon: {
    alignItems: "center",
    backgroundColor: "#759657",
    borderRadius: 31,
    height: 62,
    justifyContent: "center",
    marginTop: 18,
    width: 62,
  },
  IntroSpinner: {
    marginTop: 40,
    marginBottom: 8,
  },
  IntroTitle: {
    color: "#294127",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: 18,
    textAlign: "center",
  },
  IntroSubtitle: {
    color: "#66645E",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    textAlign: "center",
  },
  IntroHint: {
    color: "#9AA088",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  PrimaryButton: {
    alignItems: "center",
    backgroundColor: "#718F51",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 20,
    width: "100%",
  },
  SubmitButton: {
    marginTop: 6,
  },
  PrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  SecondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#C8D1AD",
    borderRadius: 10,
    borderWidth: 1.4,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 50,
    width: "100%",
  },
  SecondaryButtonText: {
    color: "#5C7740",
    fontSize: 16,
    fontWeight: "800",
  },
  AnswerArea: {
    marginTop: 14,
  },
  TopicCard: {
    backgroundColor: "#FFFEFB",
    borderColor: "#E9E6D6",
    borderRadius: 16,
    borderWidth: 1.2,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  TopicBase: {
    color: "#5C7740",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  FollowupBlock: {
    marginTop: 12,
  },
  FollowupQuestionRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7,
  },
  FollowupQuestion: {
    color: "#2F4129",
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  FollowupInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C8D1AD",
    borderRadius: 12,
    borderWidth: 1.2,
    color: "#45463F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    minHeight: 70,
    padding: 12,
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});
