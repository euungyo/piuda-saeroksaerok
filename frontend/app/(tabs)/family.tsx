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

type FamilyMenuCardProps = {
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  title: string;
};

// 일기 화면과 동일한 모양의 잎 장식을 표시합니다.
function LeafDecoration() {
  return (
    <View pointerEvents="none" style={Styles.LeafDecoration}>
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

// 사진 등록과 목록 조회 기능을 선택하는 카드입니다.
function FamilyMenuCard({
  description,
  icon,
  onPress,
  title,
}: FamilyMenuCardProps) {
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
      <LeafDecoration />

      <View style={Styles.MenuIconBackground}>
        <MaterialCommunityIcons color="#6E914D" name={icon} size={64} />
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

// 가족사진 기능 선택 화면입니다.
export default function FamilyScreen() {
  const Router = useRouter();

  function HandleBackPress() {
    Router.back();
  }

  function HandleFamilyFeaturePress(FeatureName: string) {
    // TODO: 사진 업로드/조회 화면과 API가 준비되면 각 경로로 연결합니다.
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
            <Text style={Styles.HeaderTitle}>가족사진</Text>
            <View style={Styles.SubtitleRow}>
              <Text style={Styles.HeaderSubtitle}>
                가족사진에서 할 일을 골라보세요
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

        <View style={Styles.MenuList}>
          <FamilyMenuCard
            description="가족에게 사진과 소식을 올려요"
            icon="camera-plus"
            onPress={() => HandleFamilyFeaturePress("사진 등록")}
            title="사진 등록"
          />
          <FamilyMenuCard
            description="올린 사진을 날짜별로 살펴봐요"
            icon="image-multiple"
            onPress={() => HandleFamilyFeaturePress("사진 목록 조회")}
            title="사진 목록 조회"
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
    minHeight: 124,
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
    marginTop: 10,
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
    minHeight: 365,
  },
  MenuCard: {
    alignItems: "center",
    backgroundColor: "#FFFEFB",
    borderColor: "#ECE9D9",
    borderRadius: 20,
    borderWidth: 1.2,
    elevation: 3,
    flex: 1,
    flexDirection: "row",
    minHeight: 170,
    overflow: "hidden",
    paddingHorizontal: 18,
    shadowColor: "#817A60",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
  },
  MenuIconBackground: {
    alignItems: "center",
    backgroundColor: "#F1F4E7",
    borderRadius: 52,
    height: 104,
    justifyContent: "center",
    width: 104,
  },
  MenuTextArea: {
    flex: 1,
    marginLeft: 16,
    zIndex: 2,
  },
  MenuTitle: {
    color: "#35482D",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 11,
  },
  MenuDescription: {
    color: "#66645E",
    fontSize: 12,
    lineHeight: 18,
  },
  ArrowButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    bottom: 4,
    position: "absolute",
    right: 3,
    transform: [{ rotate: "-28deg" }],
  },
  SmallLeaf: {
    marginLeft: 18,
    marginTop: -11,
    transform: [{ rotate: "38deg" }],
  },
  Guide: {
    alignItems: "center",
    backgroundColor: "#F6F6EB",
    borderColor: "#E5E6D8",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 40,
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
