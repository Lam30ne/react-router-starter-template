#!/usr/bin/env python3
"""Morning Packet — daily SMS briefing for Adam Lehman.

Pulls data from Google Calendar, ClickUp, and Gmail, formats it through
Claude API, and sends it as an SMS via Twilio.

Usage:
    python packet.py
"""

import os
import sys
from datetime import datetime
from pathlib import Path

import yaml
from dotenv import load_dotenv

# Load .env for local development (no-op if file doesn't exist)
load_dotenv()

# Ensure the morning-packet directory is on the Python path so that
# `from auth.google_auth import ...` works regardless of where the
# script is invoked from.
sys.path.insert(0, str(Path(__file__).resolve().parent))


def load_config():
    config_path = Path(__file__).resolve().parent / "config.yaml"
    with open(config_path) as f:
        return yaml.safe_load(f)


def main():
    config = load_config()
    errors = []

    # --- Pull data from all three sources ---

    # Calendar
    calendar_events = []
    try:
        from sources.calendar import get_calendar_events

        calendar_events = get_calendar_events(config)
        print(f"Calendar: {len(calendar_events)} events")
    except Exception as e:
        print(f"⚠️ Calendar pull failed: {e}")
        errors.append("Calendar pull failed")

    # ClickUp
    clickup_tasks = []
    try:
        from sources.clickup import get_clickup_tasks

        clickup_tasks = get_clickup_tasks(config)
        print(f"ClickUp: {len(clickup_tasks)} tasks")
    except Exception as e:
        print(f"⚠️ ClickUp pull failed: {e}")
        errors.append("ClickUp pull failed")

    # Gmail
    gmail_messages = []
    try:
        from sources.gmail import get_gmail_messages

        gmail_messages = get_gmail_messages(config)
        print(f"Gmail: {len(gmail_messages)} messages")
    except Exception as e:
        msg = str(e)
        print(f"⚠️ Gmail pull failed: {e}")
        if "invalid_grant" in msg or "Token has been expired" in msg:
            errors.append("Gmail auth expired — re-run setup_google.py")
        else:
            errors.append("Gmail pull failed")

    # --- Format through Claude ---

    try:
        from formatter import format_packet

        packet_text = format_packet(calendar_events, clickup_tasks, gmail_messages, config)
    except Exception as e:
        print(f"⚠️ Formatter failed: {e}")
        packet_text = _emergency_fallback(calendar_events, clickup_tasks, gmail_messages)

    # Prepend warnings for any failed sources
    if errors:
        warning = " | ".join(f"⚠️ {e}" for e in errors)
        packet_text = warning + "\n\n" + packet_text

    # --- Send via SMS ---

    from sender import send_sms

    send_sms(packet_text, config)
    print(f"Morning packet sent at {datetime.now()}")


def _emergency_fallback(calendar_events, clickup_tasks, gmail_messages):
    """Last-resort formatting if Claude API is completely unavailable."""
    lines = [f"☀️ {datetime.now().strftime('%A, %B %d')}", ""]
    if calendar_events:
        lines.append("🗓 MEETINGS")
        for ev in calendar_events[:5]:
            lines.append(f"- {ev.get('start_time', '')} {ev.get('summary', '')}")
        lines.append("")
    if clickup_tasks:
        lines.append("🎯 TASKS")
        for t in clickup_tasks[:3]:
            lines.append(f"- {t.get('name', '')}")
        lines.append("")
    if gmail_messages:
        lines.append("📬 EMAIL")
        for m in gmail_messages[:3]:
            lines.append(f"- {m.get('from_name', '')}: {m.get('subject', '')}")
    return "\n".join(lines)


if __name__ == "__main__":
    main()
