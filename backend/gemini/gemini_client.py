import time

from google import genai
from google.genai import types

from backend.config import GEMINI_API_KEY, GEMINI_MODEL


# 일시적 과부하(503/UNAVAILABLE) 등에 대한 재시도 설정
_MAX_RETRIES = 3
_RETRY_KEYWORDS = ("503", "unavailable", "overloaded", "high demand", "try again")

# 기본 모델이 계속 과부하일 때 폴백할 모델
_FALLBACK_MODELS = ("gemini-2.5-flash-lite",)


def _is_transient(error):
    message = str(error).lower()
    return any(keyword in message for keyword in _RETRY_KEYWORDS)


_client = None


def get_gemini():
    """Return a shared Gemini client (lazy singleton)."""
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def generate(contents, model=None):
    """Thin wrapper around generate_content. Quiz logic will build on this."""
    client = get_gemini()
    return client.models.generate_content(
        model=model or GEMINI_MODEL,
        contents=contents,
    )


def generate_json(contents, model=None):
    """JSON 모드로 생성하고 응답 텍스트(JSON 문자열)를 반환합니다.

    모델 과부하(503 등) 같은 일시적 오류는 짧은 백오프로 재시도합니다.
    """
    client = get_gemini()
    primary = model or GEMINI_MODEL

    # 기본 모델을 먼저, 계속 과부하면 폴백 모델을 순서대로 시도
    models_to_try = [primary] + [m for m in _FALLBACK_MODELS if m != primary]
    last_error = None

    for current_model in models_to_try:
        for attempt in range(_MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=current_model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                return response.text
            except Exception as error:
                last_error = error
                # 일시적 오류가 아니면(예: 인증 실패) 즉시 중단
                if not _is_transient(error):
                    raise
                if attempt < _MAX_RETRIES - 1:
                    time.sleep(1.0 * (attempt + 1))
        # 현재 모델이 재시도까지 모두 과부하 → 다음 폴백 모델로

    raise last_error


def ping():
    """Verify the API key works by listing available models. Raises if it does not."""
    client = get_gemini()
    next(iter(client.models.list()))
