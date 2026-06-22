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

type PhotoFilter = "all" | "recent";

type FamilyPhotoItem = {
  date: string;
  id: number;
  title: string;
};

// 사진 목록 API가 연결되기 전 카드 배치를 확인하기 위한 임시 메타데이터입니다.
// 실제 사진 이미지는 사용자가 등록한 서버 이미지 URI로 교체합니다.
const MOCK_PHOTO_ITEMS: FamilyPhotoItem[] = [
  { id: 1, title: "딸 가족", date: "2026.05.18" },
  { id: 2, title: "손주와 함께", date: "2026.05.15" },
  { id: 3, title: "봄나들이", date: "2026.04.23" },
  { id: 4, title: "주말 산책", date: "2026.04.12" },
];

// 가족이 공유한 사진을 검색하고 날짜별로 살펴보는 화면입니다.
export default function FamilyListScreen() {
  const Router = useRouter();
  const [Filter, SetFilter] = useState<PhotoFilter>("all");
  const [SearchText, SetSearchText] = useState("");

  const FilteredItems = useMemo(() => {
    const NormalizedSearchText = SearchText.trim().toLowerCase();
    const SearchResults = MOCK_PHOTO_ITEMS.filter(
      (Item) =>
        Item.title.toLowerCase().includes(NormalizedSearchText) ||
        Item.date.includes(NormalizedSearchText),
    );

    return Filter === "recent" ? SearchResults.slice(0, 2) : SearchResults;
  }, [Filter, SearchText]);

  function HandleBackPress() {
    Router.back();
  }

  function HandlePhotoPress(Item: FamilyPhotoItem) {
    // TODO: 사진 상세 API와 상세 화면이 준비되면 Item.id를 전달해 이동합니다.
    Alert.alert(Item.title, "사진 상세 화면을 준비하고 있어요.");
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
            <Text style={Styles.HeaderTitle}>가족사진</Text>
            <Text style={Styles.HeaderSubtitle}>
              가족의 사진과 소식을 확인해보세요
            </Text>
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
          <TextInput
            accessibilityLabel="가족사진 검색"
            onChangeText={SetSearchText}
            placeholder="가족 이름이나 날짜로 찾아보세요"
            placeholderTextColor="#9C9D91"
            returnKeyType="search"
            style={Styles.SearchInput}
            value={SearchText}
          />
          <MaterialCommunityIcons color="#688647" name="magnify" size={30} />
        </View>

        <View style={Styles.FilterRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => SetFilter("all")}
            style={[
              Styles.FilterButton,
              Filter === "all" && Styles.ActiveFilterButton,
            ]}
          >
            <Text
              style={[
                Styles.FilterText,
                Filter === "all" && Styles.ActiveFilterText,
              ]}
            >
              전체
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => SetFilter("recent")}
            style={[
              Styles.FilterButton,
              Filter === "recent" && Styles.ActiveFilterButton,
            ]}
          >
            <Text
              style={[
                Styles.FilterText,
                Filter === "recent" && Styles.ActiveFilterText,
              ]}
            >
              최근 사진
            </Text>
          </Pressable>
        </View>

        <View style={Styles.PhotoGrid}>
          {FilteredItems.map((Item) => (
            <Pressable
              accessibilityLabel={`${Item.title} 사진 상세 보기`}
              accessibilityRole="button"
              key={Item.id}
              onPress={() => HandlePhotoPress(Item)}
              style={({ pressed }) => [
                Styles.PhotoCard,
                pressed && Styles.Pressed,
              ]}
            >
              <View style={Styles.PhotoArea}>
                <Text style={Styles.PhotoAreaText}>
                  사용자 사진 표시 영역
                </Text>
              </View>
              <View style={Styles.PhotoInfo}>
                <Text numberOfLines={1} style={Styles.PhotoTitle}>
                  {Item.title}
                </Text>
                <View style={Styles.DateRow}>
                  <MaterialCommunityIcons
                    color="#929486"
                    name="calendar-month-outline"
                    size={15}
                  />
                  <Text style={Styles.PhotoDate}>{Item.date}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {FilteredItems.length === 0 && (
          <View style={Styles.EmptyResult}>
            <Text style={Styles.EmptyResultText}>검색된 사진이 없어요.</Text>
          </View>
        )}

        <View style={Styles.Guide}>
          <MaterialCommunityIcons color="#6E9A4E" name="leaf" size={19} />
          <Text style={Styles.GuideText}>
            사진을 누르면 자세히 볼 수 있어요
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
    paddingHorizontal: 15,
    width: "100%",
  },
  Header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 90,
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
  HeaderSubtitle: {
    color: "#6F6B62",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  TopLeftLeaves: {
    left: -13,
    position: "absolute",
    top: 54,
    transform: [{ rotate: "-30deg" }],
  },
  TopRightLeaves: {
    position: "absolute",
    right: -11,
    top: 57,
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
    borderColor: "#DDE3C9",
    borderRadius: 22,
    borderWidth: 1.4,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 15,
  },
  SearchInput: {
    color: "#42473D",
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  FilterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 13,
    marginTop: 12,
  },
  FilterButton: {
    alignItems: "center",
    backgroundColor: "#FFFEF9",
    borderColor: "#E5E5D8",
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 22,
  },
  ActiveFilterButton: {
    backgroundColor: "#718E4E",
    borderColor: "#718E4E",
  },
  FilterText: {
    color: "#77766F",
    fontSize: 14,
    fontWeight: "700",
  },
  ActiveFilterText: {
    color: "#FFFFFF",
  },
  PhotoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  PhotoCard: {
    backgroundColor: "#FFFEFB",
    borderColor: "#ECE9DC",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    overflow: "hidden",
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.09,
    shadowRadius: 5,
    width: "48.5%",
  },
  PhotoArea: {
    alignItems: "center",
    aspectRatio: 1.35,
    backgroundColor: "#F5F5ED",
    borderBottomColor: "#ECEADF",
    borderBottomWidth: 1,
    justifyContent: "center",
    width: "100%",
  },
  PhotoAreaText: {
    color: "#AAA99F",
    fontSize: 10,
  },
  PhotoInfo: {
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  PhotoTitle: {
    color: "#3C4136",
    fontSize: 15,
    fontWeight: "900",
  },
  DateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
  },
  PhotoDate: {
    color: "#8A8B82",
    fontSize: 11,
  },
  EmptyResult: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 220,
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
    marginTop: 14,
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
