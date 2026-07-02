import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_DESCRIPTION_LENGTH = 200;
const API_BASE_URL = "http://172.30.136.59:5001";

export default function FamilyUploadScreen() {
  const Router = useRouter();
  const [Description, SetDescription] = useState("");
  const [SelectedImageUri, SetSelectedImageUri] = useState<string | null>(null);
  const [Uploading, SetUploading] = useState(false);

  function HandleBackPress() {
    Router.back();
  }

  async function HandleSelectPhotosPress() {
    const Permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!Permission.granted) {
      Alert.alert("권한 필요", "사진을 선택하려면 앨범 접근 권한이 필요해요.");
      return;
    }

    const Result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (Result.canceled) {
      return;
    }

    SetSelectedImageUri(Result.assets[0].uri);
  }

  async function HandleSharePress() {
    if (!SelectedImageUri) {
      Alert.alert("사진 선택", "공유할 사진을 먼저 선택해주세요.");
      return;
    }

    const TrimmedDescription = Description.trim();

    if (!TrimmedDescription) {
      Alert.alert("사진 설명", "사진 설명을 입력해주세요.");
      return;
    }

    const Form = new FormData();

    Form.append("image", {
      uri: SelectedImageUri,
      name: "family-photo.jpg",
      type: "image/jpeg",
    } as any);

    Form.append("content", TrimmedDescription);
    Form.append("user_id", "1");
    Form.append("family_id", "1");

    try {
      SetUploading(true);

      const Response = await fetch(`${API_BASE_URL}/api/photos`, {
        method: "POST",
        body: Form,
      });

      const Data = await Response.json();

      if (!Response.ok) {
        throw new Error(Data.message ?? "사진 등록에 실패했어요.");
      }

      Alert.alert("등록 완료", "가족 사진이 공유되었어요.");
      SetDescription("");
      SetSelectedImageUri(null);
      Router.back();
    } catch (Error_) {
      Alert.alert(
        "등록 실패",
        Error_ instanceof Error ? Error_.message : "사진 등록에 실패했어요.",
      );
    } finally {
      SetUploading(false);
    }
  }

  function HandleResetPress() {
    SetDescription("");
    SetSelectedImageUri(null);
  }

  return (
    <SafeAreaView style={Styles.SafeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={Styles.KeyboardArea}
      >
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
              <Text style={Styles.HeaderTitle}>가족사진 올리기</Text>
              <View style={Styles.SubtitleRow}>
                <Text style={Styles.HeaderSubtitle}>
                  사진과 소식을 가족에게 전해주세요
                </Text>
                <MaterialCommunityIcons color="#91A969" name="sprout" size={18} />
              </View>
            </View>

            <View style={Styles.HeaderButton} />
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

          <Pressable
            accessibilityLabel="공유할 사진 선택"
            accessibilityRole="button"
            onPress={HandleSelectPhotosPress}
            style={({ pressed }) => [
              Styles.PhotoPicker,
              pressed && Styles.Pressed,
            ]}
          >
            <View style={Styles.CameraIconBackground}>
              <MaterialCommunityIcons
                color="#718D53"
                name="camera-plus"
                size={55}
              />
            </View>

            <Text style={Styles.PhotoPickerTitle}>사진을 선택해주세요</Text>
            <Text style={Styles.PhotoPickerDescription}>
              한 장 선택 가능해요
            </Text>

            <View style={Styles.EmptyPhotoArea}>
              {SelectedImageUri ? (
                <Image
                  source={{ uri: SelectedImageUri }}
                  style={Styles.SelectedImage}
                />
              ) : (
                <Text style={Styles.EmptyPhotoText}>
                  선택한 사진이 여기에 표시돼요
                </Text>
              )}
            </View>
          </Pressable>

          <View style={Styles.DescriptionCard}>
            <View style={Styles.DescriptionTitleRow}>
              <MaterialCommunityIcons color="#8DAA65" name="sprout" size={22} />
              <Text style={Styles.DescriptionTitle}>사진 설명</Text>
            </View>

            <View style={Styles.InputWrap}>
              <TextInput
                accessibilityLabel="가족사진 설명"
                maxLength={MAX_DESCRIPTION_LENGTH}
                multiline
                onChangeText={SetDescription}
                placeholder="가족에게 사진 설명을 남겨보세요"
                placeholderTextColor="#A5A59E"
                style={Styles.DescriptionInput}
                textAlignVertical="top"
                value={Description}
              />
              <Text style={Styles.CharacterCount}>
                {Description.length} / {MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>
          </View>

          <View style={Styles.ButtonArea}>
            <Pressable
              accessibilityLabel="선택한 사진을 가족에게 공유"
              accessibilityRole="button"
              disabled={Uploading}
              onPress={HandleSharePress}
              style={({ pressed }) => [
                Styles.ShareButton,
                Uploading && Styles.DisabledButton,
                pressed && Styles.Pressed,
              ]}
            >
              <Text style={Styles.ShareButtonText}>
                {Uploading ? "공유하는 중..." : "가족에게 공유하기"}
              </Text>
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="send-outline"
                size={20}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="선택 내용 초기화"
              accessibilityRole="button"
              disabled={Uploading}
              onPress={HandleResetPress}
              style={({ pressed }) => [
                Styles.ResetButton,
                Uploading && Styles.DisabledResetButton,
                pressed && Styles.Pressed,
              ]}
            >
              <Text style={Styles.ResetButtonText}>다시 선택</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  SafeArea: {
    backgroundColor: "#FFFDF8",
    flex: 1,
  },
  KeyboardArea: {
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
    minHeight: 83,
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
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1,
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
  TopRightLeaves: {
    position: "absolute",
    right: -12,
    top: 61,
    transform: [{ rotate: "205deg" }],
    zIndex: 2,
  },
  TopLeafSecond: {
    marginLeft: 17,
    marginTop: -14,
    transform: [{ rotate: "35deg" }],
  },
  PhotoPicker: {
    alignItems: "center",
    borderColor: "#DADCCB",
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1.3,
    minHeight: 275,
    padding: 18,
  },
  CameraIconBackground: {
    alignItems: "center",
    backgroundColor: "#F0F3E3",
    borderRadius: 43,
    height: 86,
    justifyContent: "center",
    width: 86,
  },
  PhotoPickerTitle: {
    color: "#353B2F",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },
  PhotoPickerDescription: {
    color: "#7E7D76",
    fontSize: 12,
    marginTop: 4,
  },
  EmptyPhotoArea: {
    alignItems: "center",
    backgroundColor: "#FAFAF5",
    borderColor: "#E7E6DC",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 120,
    overflow: "hidden",
    width: "100%",
  },
  EmptyPhotoText: {
    color: "#AAA99F",
    fontSize: 12,
  },
  SelectedImage: {
    height: "100%",
    width: "100%",
  },
  DescriptionCard: {
    backgroundColor: "#FFFEFB",
    borderColor: "#F0EEE5",
    borderRadius: 17,
    borderWidth: 1,
    elevation: 2,
    marginTop: 14,
    padding: 13,
    shadowColor: "#817A60",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  DescriptionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 9,
  },
  DescriptionTitle: {
    color: "#3D4038",
    fontSize: 16,
    fontWeight: "900",
  },
  InputWrap: {
    borderColor: "#90A678",
    borderRadius: 12,
    borderWidth: 1.2,
    minHeight: 102,
    padding: 11,
  },
  DescriptionInput: {
    color: "#44443F",
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    minHeight: 63,
    padding: 0,
  },
  CharacterCount: {
    color: "#A1A097",
    fontSize: 10,
    textAlign: "right",
  },
  ButtonArea: {
    gap: 9,
    marginTop: 14,
  },
  ShareButton: {
    alignItems: "center",
    backgroundColor: "#718F51",
    borderRadius: 12,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 48,
  },
  ShareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  ResetButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#78925F",
    borderRadius: 12,
    borderWidth: 1.3,
    justifyContent: "center",
    minHeight: 45,
  },
  ResetButtonText: {
    color: "#5D7547",
    fontSize: 16,
    fontWeight: "900",
  },
  DisabledButton: {
    opacity: 0.6,
  },
  DisabledResetButton: {
    opacity: 0.5,
  },
  Pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
});