import { type Href, useRouter } from "expo-router";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 하나의 홈 메뉴 카드가 전달받는 화면 정보와 디자인 값을 정의합니다.
type MenuCardProps = {
  // 카드 배경색입니다.
  BackgroundColor: string;
  // 카드 테두리 색상입니다.
  BorderColor: string;
  // 카드에 표시할 기능 설명입니다.
  Description: string;
  // 카드를 눌렀을 때 이동할 화면 경로입니다.
  HrefPath: Href;
  // 카드 하단에 표시할 이미지 파일입니다.
  IllustrationSource: ImageSourcePropType;
  // 카드 종류에 맞는 이미지 스타일을 선택하는 값입니다.
  IllustrationType: "diary" | "family" | "quiz";
  // 카드 제목입니다.
  Title: string;
  // 카드 제목의 글자 색상입니다.
  TitleColor: string;
};

// 전달받은 제목, 설명, 이미지, 이동 경로를 사용해 재사용 가능한 메뉴 카드를 만듭니다.
function MenuCard({
  BackgroundColor,
  BorderColor,
  Description,
  HrefPath,
  IllustrationSource,
  IllustrationType,
  Title,
  TitleColor,
}: MenuCardProps) {
  // 각 메뉴 카드에서 해당 기능 화면으로 이동시키는 라우터 객체입니다.
  const Router = useRouter();

  // 카드를 눌렀을 때 카드에 지정된 경로로 이동합니다.
  function HandleCardPress() {
    Router.push(HrefPath);
  }

  return (
    <Pressable
      accessibilityLabel={`${Title} 화면으로 이동`}
      accessibilityRole="button"
      onPress={HandleCardPress}
      style={({ pressed }) => [
        Styles.Card,
        {
          backgroundColor: BackgroundColor,
          borderColor: BorderColor,
        },
        pressed && Styles.Pressed,
      ]}
    >
      {IllustrationType === "quiz" && (
        <Image
          resizeMode="contain"
          source={require("../../assets/images/home/quiz-leaf.png")}
          style={Styles.QuizLeaf}
        />
      )}
      <View style={Styles.TransparentContent}>
        <Text style={[Styles.CardTitle, { color: TitleColor }]}>{Title}</Text>
        <Text style={Styles.CardDescription}>{Description}</Text>
      </View>
      <Image
        resizeMode="contain"
        source={IllustrationSource}
        style={[Styles.Illustration, Styles[`${IllustrationType}Illustration`]]}
      />
    </Pressable>
  );
}

// 일기, 퀴즈, 가족사진 메뉴 카드를 좌우 열 구조로 배치합니다.
export default function HomeMenuGrid() {
  return (
    <View style={Styles.Container}>
      <View style={Styles.LeftColumn}>
        <MenuCard
          BackgroundColor="#EFF5DF"
          BorderColor="#C9DDAA"
          Description={"오늘 있었던 일을\n기록해요"}
          HrefPath="/diary"
          IllustrationSource={require("../../assets/images/home/diary-cropped.png")}
          IllustrationType="diary"
          Title="일기"
          TitleColor="#275E2E"
        />
      </View>

      <View style={Styles.RightColumn}>
        <MenuCard
          BackgroundColor="#FFF2CD"
          BorderColor="#FFD56D"
          Description={"재미있는 퀴즈로\n기억을 튼튼하게!"}
          HrefPath="/quiz"
          IllustrationSource={require("../../assets/images/home/quiz-cropped.png")}
          IllustrationType="quiz"
          Title="퀴즈"
          TitleColor="#966000"
        />
        <MenuCard
          BackgroundColor="#F2E4F4"
          BorderColor="#D5B8E1"
          Description={"가족의 사진과 소식을\n확인해요"}
          HrefPath="/family"
          IllustrationSource={require("../../assets/images/home/family-cropped.png")}
          IllustrationType="family"
          Title="가족사진"
          TitleColor="#51327B"
        />
      </View>
    </View>
  );
}

// 메뉴 카드의 크기, 색상, 열 배치와 각 이미지 위치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  Container: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    minHeight: 0,
  },
  LeftColumn: {
    flex: 1,
  },
  RightColumn: {
    flex: 1.04,
    gap: 10,
  },
  Card: {
    borderRadius: 22,
    borderStyle: "solid",
    borderWidth: 1.6,
    elevation: 2,
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: 15,
    shadowColor: "#35522F",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  TransparentContent: {
    backgroundColor: "transparent",
  },
  CardTitle: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 12,
  },
  CardDescription: {
    color: "#343434",
    fontSize: 14,
    lineHeight: 21,
  },
  Illustration: {
    alignSelf: "center",
    width: "100%",
  },
  diaryIllustration: {
    height: 260,
    marginBottom: 22,
  },
  quizIllustration: {
    height: 126,
    marginBottom: -3,
  },
  familyIllustration: {
    height: 138,
    marginBottom: -15,
  },
  QuizLeaf: {
    height: 37,
    position: "absolute",
    right: 10,
    top: 8,
    width: 50,
    zIndex: 2,
  },
  Pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
});
