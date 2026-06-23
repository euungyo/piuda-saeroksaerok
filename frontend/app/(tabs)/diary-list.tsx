import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

import { FetchQuestionDiaries, type QuestionDiary } from "@/lib/api";
import { ShowAlert } from "@/lib/alert";

type DiaryItem = {
  content: string;
  date: string;
  day: string;
  id: string;
  title: string;
  topics: string[];
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 서버의 UTC createdAt 을 로컬 날짜/요일로 변환합니다.
function FormatDate(Iso: string): { date: string; day: string } {
  const Parsed = new Date(Iso.endsWith("Z") ? Iso : `${Iso}Z`);
  const Year = Parsed.getFullYear();
  const Month = String(Parsed.getMonth() + 1).padStart(2, "0");
  const Day = String(Parsed.getDate()).padStart(2, "0");

  return { date: `${Year}.${Month}.${Day}`, day: WEEKDAYS[Parsed.getDay()] };
}

// 질문 일기 문서를 목록 카드용 데이터로 변환합니다.
function ToDiaryItem(Diary: QuestionDiary): DiaryItem {
  const { date, day } = FormatDate(Diary.createdAt);

  // AI가 작성한 일기가 있으면 그것을, 없으면 답변을 이어붙여 보여줍니다.
  const Content =
    Diary.content?.trim() ||
    Diary.answers.map((Answer) => Answer.answer).join("  ·  ");
  const Title = Diary.title?.trim() || "오늘의 일기";

  return {
    id: Diary._id,
    date,
    day,
    title: Title,
    content: Content,
    topics: Diary.topics ?? [],
  };
}

// 작성한 일기를 날짜와 내용으로 검색하고 확인하는 화면입니다.
export default function DiaryListScreen() {
  const Router = useRouter();
  const [SearchText, SetSearchText] = useState("");
  const [Items, SetItems] = useState<DiaryItem[]>([]);
  const [Loading, SetLoading] = useState(true);
  const [LoadError, SetLoadError] = useState<string | null>(null);

  const LoadDiaries = useCallback(async () => {
    SetLoading(true);
    SetLoadError(null);

    try {
      const Data = await FetchQuestionDiaries();
      SetItems(Data.map(ToDiaryItem));
    } catch (Error_) {
      SetLoadError(
        Error_ instanceof Error ? Error_.message : "일기를 불러오지 못했어요.",
      );
    } finally {
      SetLoading(false);
    }
  }, []);

  // 화면에 들어올 때마다(작성 후 돌아올 때 포함) 목록을 새로 불러옵니다.
  useFocusEffect(
    useCallback(() => {
      LoadDiaries();
    }, [LoadDiaries]),
  );

  const FilteredItems = useMemo(() => {
    const Query = SearchText.trim().toLowerCase();

    return Items.filter(
      (Item) =>
        Item.date.includes(Query) ||
        Item.title.toLowerCase().includes(Query) ||
        Item.content.toLowerCase().includes(Query) ||
        Item.topics.some((Topic) => Topic.toLowerCase().includes(Query)),
    );
  }, [Items, SearchText]);

  function HandleBackPress() {
    Router.back();
  }

  function HandleCalendarPress() {
    // TODO: 날짜 선택 UI가 준비되면 선택한 날짜로 일기 목록을 필터링합니다.
    ShowAlert("날짜 선택", "날짜 선택 기능을 준비하고 있어요.");
  }

  function HandleDiaryPress(Item: DiaryItem) {
    // TODO: 상세 화면이 준비되면 GET /api/diary/answers/{id} 로 이동합니다.
    ShowAlert("오늘의 일기", `${Item.date} 일기 상세 화면을 준비하고 있어요.`);
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
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
            <Text style={Styles.HeaderTitle}>일기 조회</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>
                작성한 일기를 날짜별로 확인해요
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

        <View style={Styles.SearchWrap}>
          <MaterialCommunityIcons color="#688647" name="magnify" size={25} />
          <TextInput
            accessibilityLabel="일기 검색"
            onChangeText={SetSearchText}
            placeholder="날짜나 내용으로 찾아보세요"
            placeholderTextColor="#9C9D91"
            returnKeyType="search"
            style={Styles.SearchInput}
            value={SearchText}
          />
          <Pressable
            accessibilityLabel="날짜 선택"
            accessibilityRole="button"
            onPress={HandleCalendarPress}
            style={({ pressed }) => pressed && Styles.Pressed}
          >
            <MaterialCommunityIcons
              color="#4F7337"
              name="calendar-month-outline"
              size={27}
            />
          </Pressable>
        </View>

        {Loading ? (
          <View style={Styles.StateArea}>
            <ActivityIndicator color="#759650" size="large" />
            <Text style={Styles.StateText}>일기를 불러오는 중이에요...</Text>
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
              onPress={LoadDiaries}
              style={({ pressed }) => [
                Styles.RetryButton,
                pressed && Styles.Pressed,
              ]}
            >
              <Text style={Styles.RetryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={Styles.DiaryList}>
              {FilteredItems.map((Item) => (
                <Pressable
                  accessibilityLabel={`${Item.date} 일기 자세히 보기`}
                  accessibilityRole="button"
                  key={Item.id}
                  onPress={() => HandleDiaryPress(Item)}
                  style={({ pressed }) => [
                    Styles.DiaryCard,
                    pressed && Styles.Pressed,
                  ]}
                >
                  <View style={Styles.DiaryTextArea}>
                    <Text style={Styles.DiaryDate}>
                      {Item.date} ({Item.day})
                    </Text>
                    <Text style={Styles.DiaryTitle}>{Item.title}</Text>
                    <Text numberOfLines={3} style={Styles.DiaryContent}>
                      {Item.content}
                    </Text>

                    {Item.topics.length > 0 && (
                      <View style={Styles.TopicRow}>
                        {Item.topics.map((Topic) => (
                          <View key={Topic} style={Styles.TopicChip}>
                            <Text style={Styles.TopicChipText}>#{Topic}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={Styles.DetailArea}>
                    <View style={Styles.ArrowButton}>
                      <FontAwesome color="#668449" name="angle-right" size={27} />
                    </View>
                    <Text style={Styles.DetailText}>자세히 보기</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {FilteredItems.length === 0 && (
              <View style={Styles.EmptyResult}>
                <Text style={Styles.EmptyResultText}>
                  {Items.length === 0
                    ? "아직 작성한 일기가 없어요."
                    : "검색된 일기가 없어요."}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={Styles.Guide}>
          <MaterialCommunityIcons color="#6E9A4E" name="leaf" size={19} />
          <Text style={Styles.GuideText}>
            일기를 누르면 자세히 볼 수 있어요
          </Text>
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
    minHeight: 88,
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
    fontSize: 12,
    fontWeight: "600",
  },
  TopLeftLeaves: {
    left: -11,
    position: "absolute",
    top: 52,
    transform: [{ rotate: "-30deg" }],
  },
  TopRightLeaves: {
    position: "absolute",
    right: -9,
    top: 55,
    transform: [{ rotate: "205deg" }],
  },
  TopLeafSecond: {
    marginLeft: 17,
    marginTop: -14,
    transform: [{ rotate: "35deg" }],
  },
  SearchWrap: {
    alignItems: "center",
    backgroundColor: "#FFFEF9",
    borderColor: "#ECEADC",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 13,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  SearchInput: {
    color: "#42473D",
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  StateArea: {
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
    minHeight: 280,
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
  DiaryList: {
    gap: 10,
    marginTop: 14,
  },
  DiaryCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#EEECE2",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    minHeight: 136,
    paddingHorizontal: 17,
    paddingVertical: 13,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  DiaryTextArea: {
    flex: 1,
  },
  DiaryDate: {
    color: "#66804F",
    fontSize: 12,
    fontWeight: "800",
  },
  DiaryTitle: {
    color: "#334B2C",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 5,
  },
  DiaryContent: {
    color: "#575952",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  TopicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  TopicChip: {
    backgroundColor: "#EEF3E3",
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  TopicChipText: {
    color: "#5C7740",
    fontSize: 10,
    fontWeight: "800",
  },
  DetailArea: {
    alignItems: "center",
    marginLeft: 10,
  },
  ArrowButton: {
    alignItems: "center",
    backgroundColor: "#FAFCF3",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  DetailText: {
    color: "#627E4C",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5,
  },
  EmptyResult: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 280,
  },
  EmptyResultText: {
    color: "#929187",
    fontSize: 14,
  },
  Guide: {
    alignItems: "center",
    backgroundColor: "#F6F6EB",
    borderRadius: 20,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  GuideText: {
    color: "#666258",
    fontSize: 12,
    fontWeight: "600",
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});
