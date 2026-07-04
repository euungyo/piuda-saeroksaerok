import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FetchQuestionDiaries,
  FetchTodayQuizResult,
  QuestionDiary,
  QuizResult,
} from "@/lib/api";
import { useUser } from "@/lib/UserContext";

// 임시 유저 정보 (로그인 구현 전)
const TEMP_USER_ID = "1";
const TEMP_FAMILY_ID = "1";
const PARENT_NAME = "아버지";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];
const QUIZ_TYPE_LABEL: Record<string, string> = {
  consonant: "초성퀴즈",
  general: "상식퀴즈",
  opposite: "반댓말퀴즈",
  blank: "빈칸채우기",
};

// UTC ISO 문자열을 로컬 날짜 표기로 변환합니다.
function FormatDate(Iso: string): string {
  const D = new Date(Iso.endsWith("Z") ? Iso : `${Iso}Z`);
  const Month = D.getMonth() + 1;
  const Day = D.getDate();
  const Weekday = WEEKDAY_KO[D.getDay()];
  return `${Month}월 ${Day}일 (${Weekday})`;
}

// 오늘 날짜를 한국어로 반환합니다.
function TodayLabel(): string {
  const D = new Date();
  const Year = D.getFullYear();
  const Month = D.getMonth() + 1;
  const Day = D.getDate();
  const Weekday = WEEKDAY_KO[D.getDay()];
  return `${Year}년 ${Month}월 ${Day}일 ${Weekday}요일`;
}

// 가족 유저 홈 화면입니다.
// 상단 배너에 교환일기 현황과 퀴즈 결과 뱃지를 표시하고
// 부모님의 최근 일기 2개를 피드 카드로 보여줍니다.
export default function FamilyHomeScreen() {
  const Router = useRouter();
  const { clearUserType } = useUser();

  const [Diaries, SetDiaries] = useState<QuestionDiary[]>([]);
  const [QuizResult, SetQuizResult] = useState<QuizResult | null>(null);
  const [Loading, SetLoading] = useState(true);

  // 화면 포커스 시 일기 목록과 퀴즈 결과를 동시에 불러옵니다.
  useFocusEffect(
    useCallback(() => {
      let Active = true;

      async function Load() {
        SetLoading(true);
        try {
          const DiaryData = await FetchQuestionDiaries().catch(() => []);
          const QuizData = await FetchTodayQuizResult(TEMP_USER_ID, TEMP_FAMILY_ID).catch(() => null);
          if (Active) {
            SetDiaries(DiaryData.slice(0, 2));
            SetQuizResult(QuizData);
          }
        } finally {
          if (Active) SetLoading(false);
        }
      }

      Load();
      return () => { Active = false; };
    }, []),
  );

  // 사진 올리기 화면으로 이동합니다.
  function HandleWritePress() {
    Router.push("/(tabs)/family-upload" as any);
  }

  // 일기 전체 목록으로 이동합니다.
  function HandleAllDiariesPress() {
    Router.push("/(tabs)/diary-list" as any);
  }

  // 일기 상세 화면으로 이동합니다.
  function HandleDiaryPress(Id: string) {
    Router.push({ pathname: "/diary-detail" as any, params: { id: Id } });
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={Styles.Content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 배너 */}
        <View style={Styles.Banner}>
          {/* [DEV] 유저 유형 전환 */}
        <Pressable onPress={async () => { await clearUserType(); Router.replace("/select-type" as any); }} style={{ alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, marginBottom: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: "#fff", fontSize: 11 }}>DEV: 유형 전환</Text>
        </Pressable>
        <Text style={Styles.BannerDate}>{TodayLabel()}</Text>
          <Text style={Styles.BannerTitle}>우리 가족 교환일기</Text>

          {/* 퀴즈 결과 뱃지 */}
          <View style={Styles.BadgeRow}>
            {QuizResult?.solved ? (
              <View style={Styles.Badge}>
                <Text style={Styles.BadgeText}>
                  🧠 {PARENT_NAME} 퀴즈{" "}
                  {QuizResult.is_correct ? "정답 ✓" : "오답 ✗"}
                  {QuizResult.quiz_type
                    ? `  ·  ${QUIZ_TYPE_LABEL[QuizResult.quiz_type] ?? ""}`
                    : ""}
                </Text>
              </View>
            ) : (
              <View style={[Styles.Badge, Styles.BadgeInactive]}>
                <Text style={Styles.BadgeTextInactive}>
                  🧠 {PARENT_NAME} 아직 퀴즈 미풀이
                </Text>
              </View>
            )}
          </View>

          {/* 내 일기 작성 유도 카드 */}
          <Pressable
            accessibilityLabel="오늘 일기 쓰기"
            accessibilityRole="button"
            onPress={HandleWritePress}
            style={({ pressed }) => [Styles.MyStatus, pressed && Styles.Pressed]}
          >
            <View style={Styles.MyAvatar}>
              <Text style={Styles.MyAvatarText}>나</Text>
            </View>
            <View style={Styles.MyStatusText}>
              <Text style={Styles.MyStatusMain}>오늘 사진을 올려볼까요?</Text>
              <Text style={Styles.MyStatusSub}>
                부모님께 사진 한 장을 보내보세요
              </Text>
            </View>
            <MaterialCommunityIcons
              color="rgba(255,255,255,0.6)"
              name="arrow-right"
              size={18}
            />
          </Pressable>
        </View>

        {/* 부모님 최근 일기 피드 */}
        <View style={Styles.Section}>
          <View style={Styles.SectionHeader}>
            <Text style={Styles.SectionTitle}>부모님의 최근 일기</Text>
            <View style={Styles.SectionDivider} />
            <Pressable
              accessibilityLabel="전체 일기 보기"
              accessibilityRole="button"
              onPress={HandleAllDiariesPress}
              style={({ pressed }) => pressed && Styles.Pressed}
            >
              <Text style={Styles.SectionMore}>전체보기</Text>
            </Pressable>
          </View>

          {Loading ? (
            <View style={Styles.LoadingBox}>
              <ActivityIndicator color="#4A7A2E" size="large" />
            </View>
          ) : Diaries.length === 0 ? (
            <View style={Styles.EmptyBox}>
              <MaterialCommunityIcons
                color="#B0B8A8"
                name="notebook-outline"
                size={40}
              />
              <Text style={Styles.EmptyText}>아직 작성된 일기가 없어요</Text>
            </View>
          ) : (
            Diaries.map((Diary) => (
              <Pressable
                key={Diary._id}
                accessibilityLabel={`${Diary.title} 일기 읽기`}
                accessibilityRole="button"
                onPress={() => HandleDiaryPress(Diary._id)}
                style={({ pressed }) => [
                  Styles.DiaryCard,
                  pressed && Styles.Pressed,
                ]}
              >
                <View style={Styles.DiaryCardHeader}>
                  <View style={Styles.AuthorWrap}>
                    <View style={Styles.AuthorAvatar}>
                      <Text style={Styles.AuthorAvatarText}>
                        {PARENT_NAME[0]}
                      </Text>
                    </View>
                    <Text style={Styles.AuthorName}>{PARENT_NAME}</Text>
                  </View>
                  <Text style={Styles.DiaryDate}>{FormatDate(Diary.createdAt)}</Text>
                </View>

                <Text style={Styles.DiaryTitle}>{Diary.title || "오늘의 일기"}</Text>
                <Text numberOfLines={3} style={Styles.DiaryPreview}>
                  {Diary.content ||
                    Diary.answers.map((A) => A.answer).join("  ·  ")}
                </Text>

                {Diary.topics?.length > 0 && (
                  <View style={Styles.TopicRow}>
                    {Diary.topics.map((Topic) => (
                      <View key={Topic} style={Styles.TopicChip}>
                        <Text style={Styles.TopicChipText}>#{Topic}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: { backgroundColor: "#F0F2EC", flex: 1 },
  Content: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 24,
    width: "100%",
  },

  // 배너
  Banner: {
    backgroundColor: "#3D5C28",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  BannerDate: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  BannerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 14,
  },

  // 퀴즈 뱃지
  BadgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  Badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  BadgeInactive: { backgroundColor: "rgba(255,255,255,0.08)" },
  BadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  BadgeTextInactive: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
  },

  // 내 일기 작성 카드
  MyStatus: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  MyAvatar: {
    alignItems: "center",
    backgroundColor: "#6FAA45",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  MyAvatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  MyStatusText: { flex: 1 },
  MyStatusMain: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  MyStatusSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },

  // 피드 섹션
  Section: { paddingHorizontal: 16 },
  SectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  SectionTitle: {
    color: "#1E2D18",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  SectionDivider: {
    backgroundColor: "#C8D2BE",
    flex: 1,
    height: 1,
    marginHorizontal: 10,
  },
  SectionMore: { color: "#7A9A6A", fontSize: 12, fontWeight: "700" },

  // 일기 카드
  DiaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  DiaryCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  AuthorWrap: { alignItems: "center", flexDirection: "row", gap: 8 },
  AuthorAvatar: {
    alignItems: "center",
    backgroundColor: "#C8D9A8",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  AuthorAvatarText: { color: "#3D5C28", fontSize: 11, fontWeight: "900" },
  AuthorName: { color: "#4A5A3A", fontSize: 13, fontWeight: "700" },
  DiaryDate: { color: "#A0A898", fontSize: 12, fontWeight: "600" },
  DiaryTitle: {
    color: "#1E2D18",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  DiaryPreview: {
    color: "#6B7565",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
  TopicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  TopicChip: {
    backgroundColor: "#EEF4E3",
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  TopicChipText: { color: "#4A7A2E", fontSize: 10, fontWeight: "800" },

  // 상태
  LoadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  EmptyBox: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 40,
  },
  EmptyText: { color: "#8A9A7A", fontSize: 14, fontWeight: "600" },

  Pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
