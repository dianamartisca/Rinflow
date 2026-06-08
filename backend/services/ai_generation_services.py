import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


def generate_job_responsibilities(role):
    role = (role or "").strip()
    if not role:
        raise ValueError("role is required")

    api_key = os.getenv("LLAMA_API_KEY")
    if not api_key:
        raise ValueError("LLAMA_API_KEY is not configured")

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.4,
        "max_tokens": 900,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You generate concise job-description content for an employee onboarding workflow. "
                    "The employee is already hired and the content will be used for his Job Description document. "
                    "Don't include years of experience or educational requirements since the employee is already hired. "
                    "Return only editable plain text, separated by commas, without any formatting. "
                    "Focus on key responsibilities, requirements, and tools used for the role. "
                ),
            },
            {
                "role": "user",
                "content": f"Create job responsibilities, requirements, and tools used for this role: {role}",
            },
        ],
    }

    request = Request(
        GROQ_CHAT_COMPLETIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Rinflow/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        response_body = error.read().decode("utf-8")
        message = response_body or str(error)
        try:
            payload = json.loads(response_body)
            message = payload.get("error", {}).get("message") or payload.get("message") or message
        except json.JSONDecodeError:
            if "error code: 1010" in response_body.lower():
                message = "Groq rejected the request. Check that the API key is valid and the server can access api.groq.com."
        raise ValueError(f"AI generation failed: {message}") from error
    except URLError as error:
        raise ValueError(f"AI generation failed: {error.reason}") from error

    content = (
        result.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    if not content:
        raise ValueError("AI generation returned an empty response")

    return {"content": content}
