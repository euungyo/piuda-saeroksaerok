import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FetchQuizQuestion, QuizQuestion } from "@/lib/api";

// 오늘의 퀴즈 화면입니다.
// 유형 없이 전체 문제 풀에서 랜덤으로 1문제를 제공합니다.
// 정답 확인 후 다음 문제 없이 목록으로 돌아갑니다.
export default function QuizTodayScreen() {
  const Router = useRouter();

  const [Question, SetQuestion] = useState<QuizQuestion | null>(null);
  const [Loading, SetLoading] = useState(true);
  const [ErrorMsg, SetErrorMsg] = useState<string | null>(null);
  const [SelectedOption, SetSelectedOption] = useState<string | null>(null);
  const [TextAnswer, SetTextAnswer] = useState("");
  const [Submitted, SetSubmitted] = useState(false);
  const [IsCorrect, SetIsCorrect] = useState(false);

  const InputRef = useRef<TextInput>(null);

  useEffect(() => {
    LoadQuestion();
  }, []);

  // 전체 유형에서 랜덤으로 1문제를 불러옵니다.
  async function LoadQuestion() {
    SetLoading(true);
    SetErrorMsg(null);
    SetSelectedOption(null);
    SetTextAnswer("");
    SetSubmitted(false);
    SetIsCorrect(false);

    try {
      const Data = await FetchQuizQuestion();
      SetQuestion(Data);
    } catch {
      SetErrorMsg("문제를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      SetLoading(false);
    }
  }

  // 사용자가 입력한 답과 정답을 비교해 결과를 표시합니다.
  function HandleConfirm() {
    if (!Question) return;
    const UserAnswer =
      Question.type === "consonant" ? TextAnswer.trim() : SelectedOption ?? "";
    if (!UserAnswer) return;
    SetIsCorrect(UserAnswer === Question.answer);
    SetSubmitted(true);
  }

  // 퀴즈 목록 화면으로 돌아갑니다.
  function HandleGoToList() {
    Router.back();
  }

  const IsConsonant = Question?.type === "consonant";
  const UserAnswer = IsConsonant ? TextAnswer.trim() : SelectedOption ?? "";
  const CanConfirm = UserAnswer.length > 0;

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={Styles.Content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={Styles.Header}>
          <Pressable
            accessibilityLabel="이전 화면으로 이동"
            accessibilityRole="button"
            onPress={HandleGoToList}
            style={({ pressed }) => [Styles.HeaderButton, pressed && Styles.Pressed]}
          >
            <FontAwesome color="#465735" name="angle-left" size={31} />
          </Pressable>

          <View style={Styles.HeaderTextArea}>
            <Text style={Styles.HeaderTitle}>오늘의 퀴즈</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>오늘 하루 도전해보세요</Text>
              <MaterialCommunityIcons color="#91A969" name="star-outline" size={18} />
            </View>
          </View>

          <View style={Styles.HeaderButton} />
        </View>

        {/* 로딩 */}
        {Loading && (
          <View style={Styles.CenterBox}>
            <ActivityIndicator color="#779B4D" size="large" />
            <Text style={Styles.LoadingText}>문제를 불러오고 있어요...</Text>
          </View>
        )}

        {/* 에러 */}
        {!Loading && ErrorMsg && (
          <View style={Styles.CenterBox}>
            <MaterialCommunityIcons color="#A08060" name="alert-circle-outline" size={48} />
            <Text style={Styles.ErrorText}>{ErrorMsg}</Text>
            <Pressable
              onPress={LoadQuestion}
              style={({ pressed }) => [Styles.RetryButton, pressed && Styles.Pressed]}
            >
              <Text style={Styles.RetryButtonText}>다시 시도</Text>
            </Pressable>
          </View>
        )}

        {/* 문제 카드 */}
        {!Loading && !ErrorMsg && Question && (
          <>
            <View style={Styles.QuizCard}>
              <MaterialCommunityIcons color="#91B75F" name="leaf" size={22} style={Styles.CardLeaf} />

              {/* 초성퀴즈 */}
              {IsConsonant && (
                <>
                  <Text style={Styles.ConsonantText}>{Question.consonant}</Text>
                  <Text style={Styles.HintText}>{Question.hint}</Text>
                  <Text style={Styles.LengthHint}>
                    {"_ ".repeat(Question.length ?? 2).trim()} ({Question.length}글자)
                  </Text>

                  {!Submitted && (
                    <TextInput
                      ref={InputRef}
                      accessibilityLabel="답 입력"
                      maxLength={10}
                      onChangeText={SetTextAnswer}
                      placeholder="정답을 입력하세요"
                      placeholderTextColor="#AEAB9F"
                      style={Styles.TextInput}
                      value={TextAnswer}
                    />
                  )}
                </>
              )}

              {/* 4지선다 */}
              {!IsConsonant && (
                <>
                  <Text style={Styles.QuestionText}>{Question.question}</Text>

                  {!Submitted && (
                    <View style={Styles.OptionsArea}>
                      {Question.options?.map((Option, Index) => (
                        <Pressable
                          key={Option}
                          accessibilityLabel={`선택지 ${Index + 1}: ${Option}`}
                          accessibilityRole="button"
                          onPress={() => SetSelectedOption(Option)}
                          style={({ pressed }) => [
                            Styles.OptionButton,
                            SelectedOption === Option && Styles.OptionSelected,
                            pressed && Styles.Pressed,
                          ]}
                        >
                          <Text style={[
                            Styles.OptionNumber,
                            SelectedOption === Option && Styles.OptionTextSelected,
                          ]}>
                            {Index + 1}.
                          </Text>
                          <Text style={[
                            Styles.OptionText,
                            SelectedOption === Option && Styles.OptionTextSelected,
                          ]}>
                            {Option}
                          </Text>
                          {SelectedOption === Option && (
                            <MaterialCommunityIcons
                              color="#668743"
                              name="check-circle"
                              size={20}
                              style={Styles.OptionCheck}
                            />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}

              {/* 결과 */}
              {Submitted && (
                <View style={Styles.ResultArea}>
                  <View style={[
                    Styles.ResultIconWrap,
                    IsCorrect ? Styles.ResultCorrectBg : Styles.ResultWrongBg,
                  ]}>
                    <MaterialCommunityIcons
                      color="#FFFFFF"
                      name={IsCorrect ? "check" : "close"}
                      size={48}
                    />
                  </View>

                  <Text style={[
                    Styles.ResultLabel,
                    IsCorrect ? Styles.ResultCorrectText : Styles.ResultWrongText,
                  ]}>
                    {IsCorrect ? "정답입니다!" : "아쉬워요!"}
                  </Text>

                  <View style={Styles.AnswerBox}>
                    <MaterialCommunityIcons color="#668743" name="account-circle-outline" size={18} />
                    <Text style={Styles.AnswerText}>정답: {Question.answer}</Text>
                  </View>

                  <Text style={Styles.ExplanationText}>{Question.explanation}</Text>
                </View>
              )}
            </View>

            {/* 하단 버튼 */}
            <View style={Styles.ButtonArea}>
              {!Submitted ? (
                <Pressable
                  accessibilityLabel="정답 확인하기"
                  accessibilityRole="button"
                  disabled={!CanConfirm}
                  onPress={HandleConfirm}
                  style={({ pressed }) => [
                    Styles.ConfirmButton,
                    !CanConfirm && Styles.ConfirmButtonDisabled,
                    pressed && CanConfirm && Styles.Pressed,
                  ]}
                >
                  <Text style={Styles.ConfirmButtonText}>정답 확인</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityLabel="퀴즈 목록으로 이동"
                  accessibilityRole="button"
                  onPress={HandleGoToList}
                  style={({ pressed }) => [Styles.ListButton, pressed && Styles.Pressed]}
                >
                  <FontAwesome color="#5E8C3A" name="angle-left" size={18} />
                  <Text style={Styles.ListButtonText}>퀴즈 목록으로</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
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
  CenterBox: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", paddingVertical: 60 },
  LoadingText: { color: "#7A7569", fontSize: 15, fontWeight: "600" },
  ErrorText: { color: "#7A7569", fontSize: 15, fontWeight: "600", textAlign: "center" },
  RetryButton: {
    backgroundColor: "#779B4D",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  RetryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  QuizCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#E9E5D6",
    borderRadius: 20,
    borderWidth: 1.2,
    elevation: 3,
    minHeight: 340,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  CardLeaf: { alignSelf: "flex-end", marginBottom: 4 },
  ConsonantText: {
    color: "#284E28",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 6,
    marginBottom: 16,
    marginTop: 8,
    textAlign: "center",
  },
  HintText: { color: "#5F625B", fontSize: 15, fontWeight: "600", lineHeight: 24, textAlign: "center" },
  LengthHint: { color: "#9A9690", fontSize: 14, fontWeight: "600", marginTop: 10, textAlign: "center" },
  TextInput: {
    backgroundColor: "#F7F5EE",
    borderColor: "#D9D5C7",
    borderRadius: 12,
    borderWidth: 1.5,
    color: "#2D3A24",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: "center",
    width: "100%",
  },
  QuestionText: {
    color: "#2D3A24",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 20,
    marginTop: 8,
    textAlign: "center",
  },
  OptionsArea: { gap: 10, width: "100%" },
  OptionButton: {
    alignItems: "center",
    backgroundColor: "#F7F5EE",
    borderColor: "#DDD9CC",
    borderRadius: 12,
    borderWidth: 1.3,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  OptionSelected: { backgroundColor: "#EEF4E3", borderColor: "#779B4D", borderWidth: 2 },
  OptionNumber: { color: "#7A7569", fontSize: 15, fontWeight: "700", marginRight: 8, width: 20 },
  OptionText: { color: "#2D3A24", flex: 1, fontSize: 16, fontWeight: "700" },
  OptionTextSelected: { color: "#3A5E25" },
  OptionCheck: { marginLeft: 8 },
  ResultArea: { alignItems: "center", gap: 12, paddingTop: 8, width: "100%" },
  ResultIconWrap: {
    alignItems: "center",
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    width: 100,
  },
  ResultCorrectBg: { backgroundColor: "#5E8C3A" },
  ResultWrongBg: { backgroundColor: "#B05A3A" },
  ResultLabel: { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  ResultCorrectText: { color: "#3A5E25" },
  ResultWrongText: { color: "#8C3A1E" },
  AnswerBox: {
    alignItems: "center",
    backgroundColor: "#EEF4E3",
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  AnswerText: { color: "#3A5E25", fontSize: 15, fontWeight: "800" },
  ExplanationText: { color: "#5F625B", fontSize: 14, fontWeight: "600", lineHeight: 22, textAlign: "center" },
  ButtonArea: { marginTop: 16 },
  ConfirmButton: {
    alignItems: "center",
    backgroundColor: "#779B4D",
    borderRadius: 13,
    justifyContent: "center",
    minHeight: 52,
  },
  ConfirmButtonDisabled: { backgroundColor: "#B8C9A3" },
  ConfirmButtonText: { color: "#FFFFFF", fontSize: 19, fontWeight: "900" },
  ListButton: {
    alignItems: "center",
    backgroundColor: "#EEF4E3",
    borderColor: "#C5D9A4",
    borderRadius: 13,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 52,
  },
  ListButtonText: { color: "#5E8C3A", fontSize: 19, fontWeight: "900" },
  Pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
});
