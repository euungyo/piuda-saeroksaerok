import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DiaryItem = {
  content: string;
  date: string;
  day: string;
  id: number;
  title: string;
};

// 일기 API가 연결되기 전 목록 UI와 검색 기능 확인에 사용하는 임시 데이터입니다.
const MOCK_DIARY_ITEMS: DiaryItem[] = [
  {
    id: 1,
    date: "2026.05.18",
    day: "월",
    title: "공원 산책한 날",
    content:
      "아침 공기가 정말 상쾌했어요.\n공원에서 걷고, 벤치에 앉아 책도 읽었어요.\n마음이 편안해지는 하루였습니다.",
  },
  {
    id: 2,
    date: "2026.05.15",
    day: "금",
    title: "가족과 점심",
    content:
      "딸과 손주가 집에 와서 함께 점심을 먹었어요.\n손주의 이야기 덕분에 웃음이 끊이지 않았어요.\n정말 행복한 시간이었습니다.",
  },
  {
    id: 3,
    date: "2026.05.12",
    day: "화",
    title: "오늘의 시장 나들이",
    content:
      "오랜만에 시장에 다녀왔어요.\n싱싱한 채소와 과일을 많이 샀어요.\n저녁에 맛있는 반찬을 만들어야겠어요.",
  },
];

// 작성한 일기를 날짜와 내용으로 검색하고 확인하는 화면입니다.
export default function DiaryListScreen() {
  const Router = useRouter();
  const [SearchText, SetSearchText] = useState("");

  const FilteredItems = useMemo(() => {
    const Query = SearchText.trim().toLowerCase();

    return MOCK_DIARY_ITEMS.filter(
      (Item) =>
        Item.date.includes(Query) ||
        Item.title.toLowerCase().includes(Query) ||
        Item.content.toLowerCase().includes(Query),
    );
  }, [SearchText]);

  function HandleBackPress() {
    Router.back();
  }

  function HandleCalendarPress() {
    // TODO: 날짜 선택 UI가 준비되면 선택한 날짜로 일기 목록을 필터링합니다.
    Alert.alert("날짜 선택", "날짜 선택 기능을 준비하고 있어요.");
  }

  function HandleDiaryPress(Item: DiaryItem) {
    // TODO: 일기 상세 API와 화면이 준비되면 Item.id를 전달해 이동합니다.
    Alert.alert(Item.title, "일기 상세 화면을 준비하고 있어요.");
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

        <View style={Styles.DiaryList}>
          {FilteredItems.map((Item) => (
            <Pressable
              accessibilityLabel={`${Item.title} 일기 자세히 보기`}
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
            <Text style={Styles.EmptyResultText}>검색된 일기가 없어요.</Text>
          </View>
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
