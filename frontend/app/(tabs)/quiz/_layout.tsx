import { Stack } from "expo-router";

// quiz 폴더 내 화면(index, play, today)을 하나의 스택으로 묶습니다.
export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="play" />
      <Stack.Screen name="today" />
    </Stack>
  );
}
