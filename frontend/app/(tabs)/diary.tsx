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

type DiaryMenuCardProps = {
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  title: string;
};

// 카드 모서리에 참고 화면과 비슷한 잎 장식을 표시합니다.
function LeafDecoration({ position }: { position: "left" | "right" }) {
  return (
    <View
      pointerEvents="none"
      style={[
        Styles.LeafDecoration,
        position === "left"
          ? Styles.LeftLeafDecoration
          : Styles.RightLeafDecoration,
      ]}
    >
      <MaterialCommunityIcons color="#A8BC7C" name="leaf" size={29} />
      <MaterialCommunityIcons
        color="#C7D5A4"
        name="leaf"
        size={22}
        style={Styles.SmallLeaf}
      />
    </View>
  );
}

// 일기 작성과 조회 기능으로 이동하는 공통 메뉴 카드입니다.
function DiaryMenuCard({
  description,
  icon,
  onPress,
  title,
}: DiaryMenuCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${title} 화면으로 이동`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        Styles.MenuCard,
        pressed && Styles.Pressed,
      ]}
    >
      <LeafDecoration position="right" />

      <View style={Styles.MenuIconArea}>
        <MaterialCommunityIcons color="#7D9E55" name={icon} size={82} />
        <MaterialCommunityIcons
          color="#466B2E"
          name={icon === "notebook-edit-outline" ? "pencil" : "magnify"}
          size={40}
          style={Styles.IconAccent}
        />
      </View>

      <View style={Styles.MenuTextArea}>
        <Text style={Styles.MenuTitle}>{title}</Text>
        <Text style={Styles.MenuDescription}>{description}</Text>
      </View>

      <View style={Styles.ArrowButton}>
        <FontAwesome color="#668449" name="angle-right" size={28} />
      </View>
    </Pressable>
  );
}

// 일기 기능 선택 화면입니다. 백엔드 연결 전에는 다음 화면 준비 안내만 표시합니다.
export default function DiaryScreen() {
  const Router = useRouter();

  function HandleBackPress() {
    Router.back();
  }

  function HandleDiaryFeaturePress(FeatureName: string) {
    // TODO: 일기 작성/조회 화면과 API가 준비되면 각 경로로 연결합니다.
    Alert.alert(FeatureName, `${FeatureName} 화면을 준비하고 있어요.`);
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
            <Text style={Styles.HeaderTitle}>일기</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>원하는 기능을 골라보세요</Text>
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

        <View style={Styles.MenuList}>
          <DiaryMenuCard
            description="질문에 답하고 하루를 기록해요"
            icon="notebook-edit-outline"
            onPress={() => HandleDiaryFeaturePress("오늘의 일기 작성")}
            title="오늘의 일기 작성"
          />
          <DiaryMenuCard
            description="작성한 일기를 날짜별로 확인해요"
            icon="calendar-text-outline"
            onPress={() => HandleDiaryFeaturePress("일기 조회")}
            title="일기 조회"
          />
        </View>

        <View style={Styles.Guide}>
          <MaterialCommunityIcons color="#6E9A4E" name="leaf" size={19} />
          <Text style={Styles.GuideText}>
            버튼을 누르면 다음 화면으로 이동해요
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
    paddingHorizontal: 14,
    width: "100%",
  },
  Header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 104,
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
    fontSize: 28,
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
    left: -14,
    position: "absolute",
    top: 64,
    transform: [{ rotate: "-30deg" }],
  },
  TopRightLeaves: {
    position: "absolute",
    right: -12,
    top: 69,
    transform: [{ rotate: "205deg" }],
  },
  TopLeafSecond: {
    marginLeft: 17,
    marginTop: -14,
    transform: [{ rotate: "35deg" }],
  },
  MenuList: {
    flex: 1,
    gap: 16,
    minHeight: 410,
  },
  MenuCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#ECE9D9",
    borderRadius: 17,
    borderWidth: 1.2,
    elevation: 3,
    flex: 1,
    flexDirection: "row",
    minHeight: 190,
    overflow: "hidden",
    paddingHorizontal: 18,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  MenuIconArea: {
    alignItems: "center",
    height: 105,
    justifyContent: "center",
    width: 105,
  },
  IconAccent: {
    bottom: 4,
    position: "absolute",
    right: 0,
    transform: [{ rotate: "-9deg" }],
  },
  MenuTextArea: {
    flex: 1,
    marginLeft: 9,
    zIndex: 2,
  },
  MenuTitle: {
    color: "#35482D",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  MenuDescription: {
    color: "#66645E",
    fontSize: 12,
    lineHeight: 18,
  },
  ArrowButton: {
    alignItems: "center",
    backgroundColor: "#FBFCF4",
    borderColor: "#EFF0E2",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginLeft: 5,
    width: 44,
    zIndex: 2,
  },
  LeafDecoration: {
    position: "absolute",
  },
  RightLeafDecoration: {
    right: 2,
    top: 4,
    transform: [{ rotate: "210deg" }],
  },
  LeftLeafDecoration: {
    bottom: 0,
    left: 0,
  },
  SmallLeaf: {
    marginLeft: 18,
    marginTop: -11,
    transform: [{ rotate: "38deg" }],
  },
  Guide: {
    alignItems: "center",
    backgroundColor: "#F6F6EB",
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 36,
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
