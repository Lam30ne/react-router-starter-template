"""Twilio SMS sender — delivers the morning packet."""

import os

from twilio.rest import Client


def send_sms(body, config):
    """Send the morning packet as an SMS via Twilio.

    Truncates to max_chars if needed. Prints the packet to stdout as a
    fallback so GitHub Actions logs always capture it.
    """
    max_chars = config.get("sms", {}).get("max_chars", 1400)

    if len(body) > max_chars:
        # Truncate at last complete line before the limit
        truncated = body[: max_chars - 1]
        last_newline = truncated.rfind("\n")
        if last_newline > 0:
            body = truncated[:last_newline] + "\n…"
        else:
            body = truncated + "…"

    # Always print to stdout (GitHub Actions log fallback)
    print("--- MORNING PACKET ---")
    print(body)
    print("--- END PACKET ---")

    try:
        client = Client(
            os.environ["TWILIO_ACCOUNT_SID"],
            os.environ["TWILIO_AUTH_TOKEN"],
        )
        message = client.messages.create(
            body=body,
            from_=os.environ["TWILIO_FROM_NUMBER"],
            to=os.environ["TWILIO_TO_NUMBER"],
        )
        print(f"SMS sent successfully. SID: {message.sid}")
    except Exception as e:
        print(f"⚠️ Twilio send failed: {e}")
        print("Packet was printed above — check GitHub Actions logs.")
        raise
