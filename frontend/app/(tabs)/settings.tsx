import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 로그인 및 사용자 API가 연결되기 전 화면에 표시하는 임시 사용자 정보입니다.
const MOCK_USER_PROFILE = {
  name: "홍길동",
  profileImage: require("../../assets/images/home/profile-avatar.png"),
};

// 설정 메뉴에서 사용하는 메뉴 종류입니다.
type SettingsMenuType = "profile" | "notification" | "family" | "logout";

// 각 설정 메뉴에 표시할 문구와 아이콘 정보를 정의합니다.
type SettingsMenuItem = {
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconBackgroundColor: string;
  iconColor: string;
  title: string;
  type: SettingsMenuType;
};

// 설정 목록에 표시할 메뉴 데이터입니다.
const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    type: "profile",
    title: "내 정보 수정",
    description: "이름과 기본 정보를 확인해요",
    icon: "card-account-details-outline",
    iconColor: "#71804A",
    iconBackgroundColor: "#F0F4DE",
  },
  {
    type: "notification",
    title: "알림 설정",
    description: "중요한 소식을 알려드려요",
    icon: "bell-outline",
    iconColor: "#78804A",
    iconBackgroundColor: "#FFF8E3",
  },
  {
    type: "family",
    title: "가족 연결 관리",
    description: "가족 사용자와 연결 상태를 확인해요",
    icon: "account-group-outline",
    iconColor: "#71804A",
    iconBackgroundColor: "#F0F4DE",
  },
  {
    type: "logout",
    title: "로그아웃",
    description: "앱 사용을 종료해요",
    icon: "logout",
    iconColor: "#A76B55",
    iconBackgroundColor: "#FFF0EA",
  },
];

// 내 정보 화면의 프로필과 설정 메뉴 목록을 표시합니다.
export default function SettingsScreen() {
  // 뒤로가기와 향후 세부 설정 화면 이동에 사용하는 라우터 객체입니다.
  const Router = useRouter();

  // 상단 뒤로가기 버튼을 누르면 이전 화면으로 이동합니다.
  function HandleBackPress() {
    Router.back();
  }

  // 프로필 사진 변경 기능이 아직 연결되지 않았음을 안내합니다.
  function HandleProfileImagePress() {
    // TODO: 이미지 선택 후 서버의 프로필 이미지 업로드 API와 연결합니다.
    Alert.alert("프로필 사진", "로그인 기능이 연결되면 사진을 변경할 수 있어요.");
  }

  // 선택한 설정 메뉴에 맞는 화면 이동 또는 기능을 실행합니다.
  function HandleMenuPress(MenuType: SettingsMenuType) {
    // TODO: 백엔드와 세부 설정 화면이 완성되면 각 메뉴 경로 및 API를 연결합니다.
    if (MenuType === "logout") {
      Alert.alert("로그아웃", "로그인 기능이 연결되면 로그아웃할 수 있어요.");
      return;
    }

    Alert.alert("준비 중", "해당 설정 기능을 준비하고 있어요.");
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
            <FontAwesome color="#59643C" name="angle-left" size={29} />
          </Pressable>

          <Text style={Styles.HeaderTitle}>내 정보</Text>

          <View style={Styles.HeaderButton}>
            <MaterialCommunityIcons
              color="#667244"
              name="bell-outline"
              size={25}
            />
          </View>
        </View>

        <MaterialCommunityIcons
          color="#C6D49A"
          name="leaf"
          size={42}
          style={Styles.LeftLeaf}
        />
        <MaterialCommunityIcons
          color="#C6D49A"
          name="leaf"
          size={45}
          style={Styles.RightLeaf}
        />

        <View style={Styles.ProfileSection}>
          <Image
            accessibilityLabel={`${MOCK_USER_PROFILE.name}님의 프로필 사진`}
            resizeMode="contain"
            source={MOCK_USER_PROFILE.profileImage}
            style={Styles.ProfileImage}
          />
          <Text style={Styles.UserName}>
            {MOCK_USER_PROFILE.name}
            <Text style={Styles.UserSuffix}> 님</Text>
          </Text>

          <Pressable
            accessibilityLabel="프로필 사진 변경"
            accessibilityRole="button"
            onPress={HandleProfileImagePress}
            style={({ pressed }) => [
              Styles.ChangePhotoButton,
              pressed && Styles.Pressed,
            ]}
          >
            <FontAwesome color="#6A7748" name="camera" size={15} />
            <Text style={Styles.ChangePhotoText}>프로필 사진 바꾸기</Text>
          </Pressable>
        </View>

        <View style={Styles.MenuList}>
          {SETTINGS_MENU_ITEMS.map((MenuItem) => (
            <Pressable
              accessibilityLabel={`${MenuItem.title} 메뉴`}
              accessibilityRole="button"
              key={MenuItem.type}
              onPress={() => HandleMenuPress(MenuItem.type)}
              style={({ pressed }) => [
                Styles.MenuCard,
                pressed && Styles.Pressed,
              ]}
            >
              <View
                style={[
                  Styles.MenuIconWrap,
                  { backgroundColor: MenuItem.iconBackgroundColor },
                ]}
              >
                <MaterialCommunityIcons
                  color={MenuItem.iconColor}
                  name={MenuItem.icon}
                  size={27}
                />
              </View>

              <View style={Styles.MenuTextArea}>
                <Text style={Styles.MenuTitle}>{MenuItem.title}</Text>
                <Text style={Styles.MenuDescription}>
                  {MenuItem.description}
                </Text>
              </View>

              <FontAwesome color="#6A744D" name="angle-right" size={27} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 설정 화면의 헤더, 프로필, 메뉴 카드 배치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  Content: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  Header: {
    alignItems: "center",
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
  },
  HeaderButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  HeaderTitle: {
    color: "#4F5D35",
    fontSize: 21,
    fontWeight: "900",
  },
  LeftLeaf: {
    left: -24,
    opacity: 0.72,
    position: "absolute",
    top: 58,
    transform: [{ rotate: "-35deg" }],
  },
  RightLeaf: {
    opacity: 0.72,
    position: "absolute",
    right: -20,
    top: 82,
    transform: [{ rotate: "140deg" }],
  },
  ProfileSection: {
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 3,
  },
  ProfileImage: {
    height: 124,
    width: 124,
  },
  UserName: {
    color: "#45532D",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 5,
  },
  UserSuffix: {
    fontSize: 18,
    fontWeight: "700",
  },
  ChangePhotoButton: {
    alignItems: "center",
    backgroundColor: "#F0F3E1",
    borderColor: "#DCE4C8",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  ChangePhotoText: {
    color: "#5E6942",
    fontSize: 13,
    fontWeight: "700",
  },
  MenuList: {
    gap: 10,
  },
  MenuCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0EEE7",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 13,
    paddingVertical: 10,
    shadowColor: "#766D5E",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  MenuIconWrap: {
    alignItems: "center",
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  MenuTextArea: {
    flex: 1,
    marginLeft: 13,
  },
  MenuTitle: {
    color: "#2D2D2D",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  MenuDescription: {
    color: "#777777",
    fontSize: 12,
  },
  Pressed: {
    opacity: 0.65,
  },
});
