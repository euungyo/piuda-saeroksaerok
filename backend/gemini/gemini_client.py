from google import genai

from backend.config import GEMINI_API_KEY, GEMINI_MODEL


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


def ping():
    """Verify the API key works by listing available models. Raises if it does not."""
    client = get_gemini()
    next(iter(client.models.list()))
