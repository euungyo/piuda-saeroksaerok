import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/lib/api";

type PhotoFilter = "all" | "recent";

type FamilyPhotoItem = {
  content: string;
  createdAt: string;
  familyId?: number;
  id: string;
  imageUrl: string;
  userId?: number;
  isAvailable: boolean;
};

type PhotoApiItem = {
  content?: string;
  created_at?: string;
  createdAt?: string;
  family_id?: number;
  familyId?: number;
  id?: number | string;
  image_url?: string;
  imageUrl?: string;
  photo_id?: number | string;
  user_id?: number;
  userId?: number;
  is_available?: boolean;
  isAvailable?: boolean;
};

function FormatDate(DateText?: string) {
  if (!DateText) return "";

  const ParsedDate = new Date(DateText);

  if (Number.isNaN(ParsedDate.getTime())) return DateText;

  const Year = ParsedDate.getFullYear();
  const Month = String(ParsedDate.getMonth() + 1).padStart(2, "0");
  const Day = String(ParsedDate.getDate()).padStart(2, "0");

  return `${Year}.${Month}.${Day}`;
}

function BuildImageUrl(ImagePath?: string) {
  if (!ImagePath) return "";

  if (ImagePath.startsWith("http")) return ImagePath;
  if (ImagePath.startsWith("/")) return `${API_BASE_URL}${ImagePath}`;

  return `${API_BASE_URL}/${ImagePath}`;
}

function ToFamilyPhotoItem(Item: PhotoApiItem): FamilyPhotoItem {
  const ImagePath = Item.image_url ?? Item.imageUrl ?? "";

  return {
    id: String(Item.id ?? Item.photo_id ?? ""),
    content: Item.content ?? "가족이 공유한 사진입니다.",
    createdAt: FormatDate(Item.created_at ?? Item.createdAt),
    imageUrl: BuildImageUrl(ImagePath),
    familyId: Item.family_id ?? Item.familyId,
    userId: Item.user_id ?? Item.userId,
    isAvailable: Item.is_available ?? Item.isAvailable ?? false,
  };
}

export default function FamilyListScreen() {
  const Router = useRouter();
  const [Filter, SetFilter] = useState<PhotoFilter>("all");
  const [SearchText, SetSearchText] = useState("");
  const [PhotoItems, SetPhotoItems] = useState<FamilyPhotoItem[]>([]);
  const [Loading, SetLoading] = useState(true);
  const [LoadError, SetLoadError] = useState<string | null>(null);
  const [SelectedPhoto, SetSelectedPhoto] = useState<FamilyPhotoItem | null>(null);

  const LoadPhotos = useCallback(async () => {
    SetLoading(true);
    SetLoadError(null);

    try {
      const Response = await fetch(`${API_BASE_URL}/api/photos/family/1`);
      const Data = await Response.json();

      if (!Response.ok) {
        throw new Error(Data.message ?? "사진 목록을 불러오지 못했어요.");
      }

      const RawItems = Array.isArray(Data.data) ? Data.data : [];
      SetPhotoItems(RawItems.map(ToFamilyPhotoItem));
    } catch (Error_) {
      SetLoadError(
        Error_ instanceof Error
          ? Error_.message
          : "사진 목록을 불러오지 못했어요.",
      );
    } finally {
      SetLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      LoadPhotos();
    }, [LoadPhotos]),
  );

  const FilteredItems = useMemo(() => {
    const NormalizedSearchText = SearchText.trim().toLowerCase();

    const SearchResults = PhotoItems.filter(
      (Item) =>
        Item.content.toLowerCase().includes(NormalizedSearchText) ||
        Item.createdAt.includes(NormalizedSearchText),
    );

    return Filter === "recent" ? SearchResults.slice(0, 2) : SearchResults;
  }, [Filter, PhotoItems, SearchText]);

  function HandleBackPress() {
    Router.back();
  }

  function HandleUploadPress() {
    Router.push("/family-upload" as any);
  }

  function HandlePhotoPress(Item: FamilyPhotoItem) {
    if (!Item.isAvailable) return;
    SetSelectedPhoto(Item);
  }

  function HandleCloseModal() {
    SetSelectedPhoto(null);
  }

  function HandleQuizPress() {
    Router.push("/quiz" as any);
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

          <Pressable
            accessibilityLabel="가족사진 올리기"
            accessibilityRole="button"
            onPress={HandleUploadPress}
            style={({ pressed }) => [
              Styles.HeaderButton,
              pressed && Styles.Pressed,
            ]}
          >
            <FontAwesome color="#465735" name="plus" size={22} />
          </Pressable>
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
            placeholder="내용이나 날짜로 찾아보세요"
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

        {Loading ? (
          <View style={Styles.StateArea}>
            <ActivityIndicator color="#759650" size="large" />
            <Text style={Styles.StateText}>사진을 불러오는 중이에요...</Text>
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
              onPress={LoadPhotos}
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
            <View style={Styles.PhotoGrid}>
              {FilteredItems.map((Item) => (
                <Pressable
                  accessibilityLabel={
                    Item.isAvailable
                      ? "가족사진 상세 보기"
                      : "잠긴 가족사진"
                  }
                  accessibilityRole="button"
                  key={Item.id}
                  onPress={() => HandlePhotoPress(Item)}
                  style={({ pressed }) => [
                    Styles.PhotoCard,
                    pressed && Item.isAvailable && Styles.Pressed,
                  ]}
                >
                  <View style={Styles.PhotoArea}>
                    {Item.imageUrl ? (
                      <>
                        <Image
                          blurRadius={Item.isAvailable ? 0 : 18}
                          source={{ uri: Item.imageUrl }}
                          style={Styles.PhotoImage}
                        />

                        {!Item.isAvailable && (
                          <View style={Styles.LockOverlay}>
                            <Text style={Styles.LockIcon}>🔒</Text>
                            <Text style={Styles.LockTitle}>잠긴 사진</Text>
                            <Text style={Styles.LockText}>
                              퀴즈를 풀면{"\n"}사진을 볼 수 있습니다.
                            </Text>

                            <Pressable
                              accessibilityLabel="퀴즈 풀러가기"
                              accessibilityRole="button"
                              onPress={HandleQuizPress}
                              style={({ pressed }) => [
                                Styles.LockButton,
                                pressed && Styles.Pressed,
                              ]}
                            >
                              <Text style={Styles.LockButtonText}>
                                퀴즈 풀러가기
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </>
                    ) : (
                      <Text style={Styles.PhotoAreaText}>사진이 없어요</Text>
                    )}
                  </View>

                  <View style={Styles.PhotoInfo}>
                    <Text numberOfLines={2} style={Styles.PhotoTitle}>
                      {Item.content}
                    </Text>
                    <View style={Styles.DateRow}>
                      <MaterialCommunityIcons
                        color="#929486"
                        name="calendar-month-outline"
                        size={15}
                      />
                      <Text style={Styles.PhotoDate}>
                        {Item.createdAt || "날짜 없음"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {FilteredItems.length === 0 && (
              <View style={Styles.EmptyResult}>
                <Text style={Styles.EmptyResultText}>
                  {PhotoItems.length === 0
                    ? "아직 등록된 사진이 없어요."
                    : "검색된 사진이 없어요."}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={Styles.Guide}>
          <MaterialCommunityIcons color="#6E9A4E" name="leaf" size={19} />
          <Text style={Styles.GuideText}>
            퀴즈를 풀면 잠긴 사진을 볼 수 있어요
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={HandleCloseModal}
        transparent
        visible={SelectedPhoto !== null}
      >
        <View style={Styles.ModalOverlay}>
          <Pressable
            accessibilityLabel="사진 상세 닫기"
            accessibilityRole="button"
            onPress={HandleCloseModal}
            style={Styles.ModalBackgroundPressArea}
          />

          <View style={Styles.DetailCard}>
            <View style={Styles.DetailHandle} />

            <View style={Styles.DetailHeader}>
              <View>
                <Text style={Styles.DetailTitle}>사진 자세히 보기</Text>
                <Text style={Styles.DetailSubtitle}>
                  가족이 공유한 순간을 확인해요
                </Text>
              </View>

              <Pressable
                accessibilityLabel="사진 상세 닫기"
                accessibilityRole="button"
                onPress={HandleCloseModal}
                style={({ pressed }) => [
                  Styles.CloseButton,
                  pressed && Styles.Pressed,
                ]}
              >
                <FontAwesome color="#465735" name="close" size={23} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={Styles.DetailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {SelectedPhoto?.imageUrl ? (
                <Image
                  source={{ uri: SelectedPhoto.imageUrl }}
                  style={Styles.DetailImage}
                />
              ) : (
                <View style={Styles.DetailImageEmpty}>
                  <Text style={Styles.PhotoAreaText}>사진이 없어요</Text>
                </View>
              )}

              <View style={Styles.DetailContentCard}>
                <View style={Styles.DetailDateRow}>
                  <MaterialCommunityIcons
                    color="#6E9A4E"
                    name="calendar-month-outline"
                    size={19}
                  />
                  <Text style={Styles.DetailDate}>
                    {SelectedPhoto?.createdAt || "날짜 없음"}
                  </Text>
                </View>

                <View style={Styles.DetailDivider} />

                <View style={Styles.DetailTextTitleRow}>
                  <MaterialCommunityIcons
                    color="#8DAA65"
                    name="sprout"
                    size={21}
                  />
                  <Text style={Styles.DetailTextTitle}>사진 설명</Text>
                </View>

                <Text style={Styles.DetailContent}>
                  {SelectedPhoto?.content || "사진 설명이 없어요."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    overflow: "hidden",
    width: "100%",
  },
  PhotoImage: {
    height: "100%",
    width: "100%",
  },
  PhotoAreaText: {
    color: "#AAA99F",
    fontSize: 10,
  },
  LockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  LockIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  LockTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  LockText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginBottom: 9,
    marginTop: 4,
    textAlign: "center",
  },
  LockButton: {
    backgroundColor: "#6E9A4E",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  LockButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  PhotoInfo: {
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  PhotoTitle: {
    color: "#3C4136",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
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
  ModalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
  },
  ModalBackgroundPressArea: {
    flex: 1,
  },
  DetailCard: {
    backgroundColor: "#FFFDF8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  DetailHandle: {
    alignSelf: "center",
    backgroundColor: "#D7D8CB",
    borderRadius: 3,
    height: 5,
    marginBottom: 13,
    width: 46,
  },
  DetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  DetailTitle: {
    color: "#34482A",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  DetailSubtitle: {
    color: "#6F6B62",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  CloseButton: {
    alignItems: "center",
    backgroundColor: "#F3F5E9",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  DetailScrollContent: {
    paddingBottom: 8,
  },
  DetailImage: {
    backgroundColor: "#F5F5ED",
    borderRadius: 18,
    height: 360,
    width: "100%",
  },
  DetailImageEmpty: {
    alignItems: "center",
    backgroundColor: "#F5F5ED",
    borderRadius: 18,
    height: 360,
    justifyContent: "center",
    width: "100%",
  },
  DetailContentCard: {
    backgroundColor: "#FFFEFB",
    borderColor: "#ECE9DC",
    borderRadius: 17,
    borderWidth: 1,
    elevation: 2,
    marginTop: 14,
    padding: 15,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  DetailDateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  DetailDate: {
    color: "#6F6B62",
    fontSize: 14,
    fontWeight: "800",
  },
  DetailDivider: {
    backgroundColor: "#ECE9DF",
    height: 1,
    marginVertical: 13,
  },
  DetailTextTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  DetailTextTitle: {
    color: "#34482A",
    fontSize: 16,
    fontWeight: "900",
  },
  DetailContent: {
    color: "#3C4136",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 26,
    marginTop: 12,
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});