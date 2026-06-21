import { StyleSheet, Text, View } from "react-native";

// 아직 구현 중인 화면에 전달할 제목, 설명, 이모지 값을 정의합니다.
type ComingSoonScreenProps = {
  // 화면에 표시할 기능 안내 문구입니다.
  Description: string;
  // 기능을 표현하는 대표 이모지입니다.
  Emoji: string;
  // 화면의 기능 이름입니다.
  Title: string;
};

// 아직 기능이 구현되지 않은 화면에서 공통 안내 내용을 표시합니다.
export default function ComingSoonScreen({
  Description,
  Emoji,
  Title,
}: ComingSoonScreenProps) {
  return (
    <View style={Styles.Container}>
      <Text style={Styles.Emoji}>{Emoji}</Text>
      <Text style={Styles.Title}>{Title}</Text>
      <Text style={Styles.Description}>{Description}</Text>
    </View>
  );
}

// 공통 안내 화면의 아이콘과 문구 배치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  Container: {
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  Emoji: {
    fontSize: 72,
    marginBottom: 18,
  },
  Title: {
    color: "#285F31",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 12,
  },
  Description: {
    color: "#555555",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
  },
});
