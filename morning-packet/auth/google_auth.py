"""Google OAuth2 helper for headless environments (GitHub Actions).

Builds credentials from a stored refresh token and returns authenticated
service objects for Gmail and Google Calendar APIs.
"""

import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
]


def get_credentials():
    """Build OAuth2 credentials from environment variables.

    Returns refreshed Credentials or raises if the token is invalid.
    """
    client_id = os.environ["GOOGLE_CLIENT_ID"]
    client_secret = os.environ["GOOGLE_CLIENT_SECRET"]
    refresh_token = os.environ["GOOGLE_REFRESH_TOKEN"]

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )

    creds.refresh(Request())
    return creds


def get_calendar_service():
    """Return an authenticated Google Calendar API v3 service."""
    return build("calendar", "v3", credentials=get_credentials())


def get_gmail_service():
    """Return an authenticated Gmail API v1 service."""
    return build("gmail", "v1", credentials=get_credentials())
