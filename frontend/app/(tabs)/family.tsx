import ComingSoonScreen from "@/components/common/ComingSoonScreen";

// 가족사진 기능이 구현되기 전까지 가족사진 안내 화면을 표시합니다.
export default function FamilyScreen() {
  return (
    <ComingSoonScreen
      Description="가족의 사진과 따뜻한 소식을 확인하는 화면이 들어올 예정입니다."
      Emoji="👨‍👩‍👧‍👦"
      Title="가족사진"
    />
  );
}
