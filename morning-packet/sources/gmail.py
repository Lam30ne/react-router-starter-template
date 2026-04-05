"""Gmail source — pulls unread emails matching the Adam Filter."""

import base64

from auth.google_auth import get_gmail_service


def _build_query(config):
    """Build the Gmail search query dynamically from config.yaml."""
    gmail_config = config.get("gmail", {})
    allow_senders = gmail_config.get("allow_senders", [])
    alert_senders = gmail_config.get("alert_senders", [])
    alert_subjects = gmail_config.get("alert_subjects", [])

    parts = []

    # Regular allow_senders — always pass through
    for sender in allow_senders:
        parts.append(f"from:{sender}")

    # Alert senders — only pass through with matching subjects
    if alert_senders and alert_subjects:
        subject_clause = " OR ".join(alert_subjects)
        for sender in alert_senders:
            parts.append(f"(from:{sender} subject:({subject_clause}))")

    or_clause = " OR ".join(parts)
    query = f"is:unread newer_than:1d ({or_clause})"
    return query


def _matches_ignore(email_addr, ignore_senders):
    """Return True if the email address matches any ignore pattern."""
    addr_lower = email_addr.lower()
    for pattern in ignore_senders:
        if pattern.lower() in addr_lower:
            return True
    return False


def _parse_headers(headers):
    """Extract From, Subject, Date from message headers."""
    result = {}
    for h in headers:
        name = h["name"].lower()
        if name == "from":
            result["from"] = h["value"]
        elif name == "subject":
            result["subject"] = h["value"]
        elif name == "date":
            result["date"] = h["value"]
    return result


def _parse_from(from_str):
    """Split 'Display Name <email@example.com>' into name and email."""
    if "<" in from_str and ">" in from_str:
        name = from_str[: from_str.index("<")].strip().strip('"')
        email = from_str[from_str.index("<") + 1 : from_str.index(">")]
        return name, email
    return from_str, from_str


def get_gmail_messages(config):
    """Fetch unread emails matching the Adam Filter.

    Returns a list of dicts with keys:
        from_name, from_email, subject, snippet, date
    """
    gmail_config = config.get("gmail", {})
    max_results = gmail_config.get("max_results", 20)
    ignore_senders = gmail_config.get("ignore_senders", [])

    query = _build_query(config)
    service = get_gmail_service()

    result = (
        service.users()
        .messages()
        .list(userId="me", q=query, maxResults=max_results)
        .execute()
    )

    message_ids = result.get("messages", [])
    messages = []

    for msg_ref in message_ids:
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=msg_ref["id"], format="metadata",
                 metadataHeaders=["From", "Subject", "Date"])
            .execute()
        )

        headers = _parse_headers(msg.get("payload", {}).get("headers", []))
        from_name, from_email = _parse_from(headers.get("from", ""))

        # Post-filter: skip ignored senders
        if _matches_ignore(from_email, ignore_senders):
            continue

        messages.append(
            {
                "from_name": from_name,
                "from_email": from_email,
                "subject": headers.get("subject", "(No subject)"),
                "snippet": msg.get("snippet", ""),
                "date": headers.get("date", ""),
            }
        )

    return messages
