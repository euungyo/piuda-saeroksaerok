import { ImageBackground, StyleSheet, Text, View } from "react-native";

// 인사 문구와 잎사귀 배경 이미지를 포함한 환영 배너를 표시합니다.
export default function WelcomeBanner() {
  return (
    <ImageBackground
      imageStyle={Styles.BackgroundImage}
      resizeMode="stretch"
      source={require("../../assets/images/home/welcome-banner-v3.png")}
      style={Styles.Container}
    >
      <View style={Styles.TextArea}>
        <Text style={Styles.Title}>안녕하세요!</Text>
        <View style={Styles.MessageRow}>
          <Text style={Styles.Message}>오늘도 좋은 하루 되세요</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

// 환영 배너의 크기, 배경 이미지, 문구 위치를 관리하는 스타일입니다.
const Styles = StyleSheet.create({
  Container: {
    borderColor: "#DCE7C2",
    borderRadius: 22,
    borderWidth: 1.2,
    height: 142,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  BackgroundImage: {
    borderRadius: 21,
  },
  TextArea: {
    justifyContent: "center",
    maxWidth: "62%",
  },
  Title: {
    color: "#111111",
    fontSize: 29,
    fontWeight: "900",
    marginBottom: 12,
  },
  MessageRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  Message: {
    color: "#2E2E2E",
    fontSize: 17,
    lineHeight: 24,
  },
});
