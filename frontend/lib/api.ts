import Constants from "expo-constants";
import { Platform } from "react-native";

// 백엔드 Flask 서버 포트 (app.py 의 port=5001 과 일치)
const BACKEND_PORT = 5001;

// 실행 환경별로 백엔드에 닿을 수 있는 base URL 을 결정합니다.
// - 웹: 같은 PC 의 localhost
// - 실기기 / 에뮬레이터(Expo Go): 개발 PC 의 LAN IP 를 Expo 호스트에서 추출
// - EXPO_PUBLIC_API_URL 환경변수가 있으면 그것을 최우선으로 사용
function ResolveBaseUrl(): string {
  const FromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (FromEnv) {
    return FromEnv;
  }

  if (Platform.OS === "web") {
    return `http://localhost:${BACKEND_PORT}`;
  }

  // Expo 개발 서버 호스트(예: "192.168.0.5:8081")에서 IP 부분만 떼어냅니다.
  const HostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost ??
    "";
  const Host = HostUri.split(":")[0];

  if (Host) {
    return `http://${Host}:${BACKEND_PORT}`;
  }

  // 안드로이드 에뮬레이터는 호스트 PC 를 10.0.2.2 로 가리킵니다.
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${BACKEND_PORT}`;
  }

  return `http://localhost:${BACKEND_PORT}`;
}

export const API_BASE_URL = ResolveBaseUrl();

export type DiaryQuestion = {
  _id: string;
  text: string;
};

export type DiaryAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type FollowupItem = {
  question: string;
  answer: string;
};

export type SavedFollowupTopic = {
  questionId: string;
  items: FollowupItem[];
};

export type QuestionDiary = {
  _id: string;
  title: string;
  content: string;
  topics: string[];
  answers: DiaryAnswer[];
  followups: SavedFollowupTopic[];
  createdAt: string;
  updatedAt: string;
};

// AI가 생성한 대주제별 꼬리질문
export type FollowupTopic = {
  questionId: string;
  question: string;
  answer: string;
  followups: string[];
};

export type FollowupsResponse = {
  diaryId: string;
  topics: FollowupTopic[];
};

export type TodayDiaryStatus = {
  written: boolean;
  count: number;
};

// 공통 fetch 래퍼. 백엔드 에러 형식({ success:false, message })의 message 를 그대로 던집니다.
async function Request<T>(Path: string, Options?: RequestInit): Promise<T> {
  const Response = await fetch(`${API_BASE_URL}${Path}`, {
    // 브라우저가 GET 응답을 캐싱해 같은 질문이 반복되는 것을 막습니다.
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...Options,
  });

  const Data = await Response.json().catch(() => null);

  if (!Response.ok) {
    const Message =
      (Data && typeof Data.message === "string" && Data.message) ||
      "요청에 실패했어요. 잠시 후 다시 시도해주세요.";
    throw new Error(Message);
  }

  return Data as T;
}

// 오늘의 질문 N개 받기 (작성 화면 진입 시)
export function FetchDailyQuestions(Count = 3): Promise<DiaryQuestion[]> {
  return Request<DiaryQuestion[]>(`/api/diary/questions?count=${Count}`);
}

// 질문 답변 제출 (일기 작성 저장)
export function SubmitDiaryAnswers(
  Answers: { questionId: string; answer: string }[],
): Promise<QuestionDiary> {
  return Request<QuestionDiary>("/api/diary/answers", {
    method: "POST",
    body: JSON.stringify({ answers: Answers }),
  });
}

// 작성된 질문 일기 목록 조회 (조회 화면)
export function FetchQuestionDiaries(): Promise<QuestionDiary[]> {
  return Request<QuestionDiary[]>("/api/diary/answers");
}

// 오늘 일기를 작성했는지 여부 (일기 탭 진입 시 완료 알림용)
export function FetchTodayDiaryStatus(): Promise<TodayDiaryStatus> {
  return Request<TodayDiaryStatus>("/api/diary/today");
}

// 저장된 일기를 바탕으로 AI 꼬리질문 생성
export function FetchFollowups(DiaryId: string): Promise<FollowupsResponse> {
  return Request<FollowupsResponse>(`/api/diary/answers/${DiaryId}/followups`);
}

// AI 꼬리질문 답변 저장
export function SaveFollowups(
  DiaryId: string,
  Followups: SavedFollowupTopic[],
): Promise<QuestionDiary> {
  return Request<QuestionDiary>(`/api/diary/answers/${DiaryId}/followups`, {
    method: "POST",
    body: JSON.stringify({ followups: Followups }),
  });
}

// 답변/꼬리질문을 바탕으로 AI가 하나의 일기를 작성·저장
export function ComposeDiary(DiaryId: string): Promise<QuestionDiary> {
  return Request<QuestionDiary>(`/api/diary/answers/${DiaryId}/compose`, {
    method: "POST",
  });
}
