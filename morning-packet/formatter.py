"""Claude API formatter — turns raw data into an SMS-ready morning packet."""

import json
from datetime import datetime

import anthropic

SYSTEM_PROMPT = """You are Adam Lehman's morning briefing assistant. You produce a "morning packet" — a short daily briefing delivered via SMS. It must fit on one phone screen.

FORMAT (follow exactly, use plain text only):

☀️ [Day], [Month Day]

🗓 MEETINGS
[List only REAL meetings with other humans. STRIP any event matching these rules:
- Title contains: Focus time, Travel, Follow Up, Break, Lunch, Busy, Wrap Up, Canceled
- Title starts with emoji markers: ✍, 🚌, ☑, 🛡, ❇️
- Created by Reclaim
- Has only 1 attendee (self-only events)
- Status is cancelled or declined
For each real meeting: time — name (location if not a video call)]

🎯 YOUR 3
[Pick the 3 most important tasks. Priority logic:
1. Urgent priority first, then high, then normal
2. If a meeting today relates to a task, surface that task
3. If other tasks are blocked by this one, surface it
For each: one-line action + ClickUp URL]

🚩 FLAG (only if needed)
[Include ONLY if there's a financial alert, broken automation, or budget overage in the email data. If nothing, omit this section entirely.]

📬 EMAIL (only if needed)
[Include ONLY if there's a client reply on an active deal or something from Allie/Camila needing awareness. One sentence max per email. If nothing, omit entirely.]

RULES:
- Total output MUST be under 1400 characters
- Plain text only — no markdown, no bold, no headers
- URLs must be full (tappable in SMS)
- No executive summary, no commentary, no pleasantries
- If there are no flags or emails worth showing, those sections disappear completely"""


def format_packet(calendar_events, clickup_tasks, gmail_messages, config):
    """Format the morning packet via Claude API.

    Falls back to raw data if the API call fails.
    """
    today = datetime.now().strftime("%A, %B %d, %Y")

    user_message = f"""Today: {today}

CALENDAR EVENTS:
{json.dumps(calendar_events, indent=2, default=str)}

CLICKUP TASKS (Adam's Plate):
{json.dumps(clickup_tasks, indent=2, default=str)}

GMAIL MATCHES:
{json.dumps(gmail_messages, indent=2, default=str)}"""

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            temperature=0.3,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text
    except Exception as e:
        print(f"⚠️ Claude formatting failed: {e}")
        print("Falling back to raw data format.")
        return _raw_fallback(today, calendar_events, clickup_tasks, gmail_messages)


def _raw_fallback(today, calendar_events, clickup_tasks, gmail_messages):
    """Produce a bare-bones packet when Claude API is unavailable."""
    lines = [f"☀️ {today}", ""]

    lines.append("🗓 MEETINGS")
    if calendar_events:
        for ev in calendar_events[:6]:
            lines.append(f"- {ev.get('start_time', '?')} {ev.get('summary', '')}")
    else:
        lines.append("(none)")
    lines.append("")

    lines.append("🎯 TASKS")
    if clickup_tasks:
        for t in clickup_tasks[:3]:
            lines.append(f"- [{t.get('priority', '')}] {t.get('name', '')} {t.get('url', '')}")
    else:
        lines.append("(none)")
    lines.append("")

    if gmail_messages:
        lines.append("📬 EMAIL")
        for m in gmail_messages[:3]:
            lines.append(f"- {m.get('from_name', '')}: {m.get('subject', '')}")

    return "\n".join(lines)
