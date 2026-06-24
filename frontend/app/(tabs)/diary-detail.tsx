import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { FetchQuestionDiary, type QuestionDiary } from "@/lib/api";

export default function DiaryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [diary, setDiary] = useState<QuestionDiary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const diaryId = Array.isArray(id) ? id[0] : id;

        if (!diaryId) {
            console.log("상세 화면으로 넘어온 id가 없습니다:", id);
            setLoading(false);
            return;
        }

        const fetchDiary = async () => {
            try {
                console.log("상세 요청 id:", diaryId);

                const data = await FetchQuestionDiary(diaryId);

                console.log("상세 응답 data:", data);

                setDiary(data);
            } catch (error) {
                console.error("일기 상세 조회 에러:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiary();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#759650" size="large" />
                <Text style={styles.loadingText}>일기를 불러오는 중이에요...</Text>
            </View>
        );
    }

    if (!diary) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>일기를 불러오지 못했어요.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>돌아가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← 돌아가기</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{diary.title?.trim() || "오늘의 일기"}</Text>

            <Text style={styles.date}>
                {new Date(diary.createdAt).toLocaleDateString("ko-KR")}
            </Text>

            {diary.topics?.length > 0 && (
                <View style={styles.topicContainer}>
                    {diary.topics.map((topic, index) => (
                        <Text key={`${topic}-${index}`} style={styles.topic}>
                            #{topic}
                        </Text>
                    ))}
                </View>
            )}

            {diary.content?.trim() ? (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>완성된 일기</Text>
                    <Text style={styles.content}>{diary.content}</Text>
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>작성한 답변</Text>

                    {diary.answers?.length > 0 ? (
                        diary.answers.map((item) => (
                            <View key={item.questionId} style={styles.answerBox}>
                                <Text style={styles.question}>{item.question}</Text>
                                <Text style={styles.answer}>{item.answer}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>작성한 답변이 없어요.</Text>
                    )}
                </View>
            )}

            {diary.followups?.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>꼬리질문 답변</Text>

                    {diary.followups.map((topic) =>
                        topic.items?.map((item, index) => (
                            <View key={`${topic.questionId}-${index}`} style={styles.answerBox}>
                                <Text style={styles.question}>{item.question}</Text>
                                <Text style={styles.answer}>{item.answer || "답변 없음"}</Text>
                            </View>
                        )),
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F5EF",
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F5EF",
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#666",
    },
    errorText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 16,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: "#6B8E6E",
        fontWeight: "600",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: "#888",
        marginBottom: 16,
    },
    topicContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    topic: {
        backgroundColor: "#E2EBDD",
        color: "#4F7352",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        fontSize: 13,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 12,
    },
    content: {
        fontSize: 17,
        lineHeight: 28,
        color: "#333",
    },
    answerBox: {
        marginBottom: 16,
    },
    question: {
        fontSize: 15,
        fontWeight: "700",
        color: "#555",
        marginBottom: 6,
    },
    answer: {
        fontSize: 16,
        lineHeight: 24,
        color: "#333",
    },
    emptyText: {
        fontSize: 15,
        color: "#888",
    },
});