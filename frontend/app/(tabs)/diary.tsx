import ComingSoonScreen from "@/components/common/ComingSoonScreen";

// 일기 기능이 구현되기 전까지 일기 안내 화면을 표시합니다.
export default function DiaryScreen() {
  return (
    <ComingSoonScreen
      Description="오늘 있었던 일을 편안하게 기록하는 화면이 들어올 예정입니다."
      Emoji="📖"
      Title="일기"
    />
  );
}
