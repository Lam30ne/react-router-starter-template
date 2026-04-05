#!/usr/bin/env python3
"""One-time OAuth2 setup script.

Run this locally (not on GitHub Actions) to authorize your Google account
and obtain a refresh token. You will need a credentials.json file from the
Google Cloud Console (OAuth 2.0 Client ID, type "Desktop app").

Usage:
    python auth/setup_google.py

After running, copy the printed refresh token into your GitHub repo secrets
as GOOGLE_REFRESH_TOKEN.
"""

import json
import sys
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
]


def main():
    creds_path = Path("credentials.json")

    if not creds_path.exists():
        print("ERROR: credentials.json not found in the current directory.")
        print()
        print("To create it:")
        print("  1. Go to https://console.cloud.google.com/apis/credentials")
        print("  2. Create an OAuth 2.0 Client ID (type: Desktop app)")
        print("  3. Download the JSON and save it as credentials.json here")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), SCOPES)
    creds = flow.run_local_server(port=0)

    print()
    print("=" * 60)
    print("  SUCCESS — Google OAuth2 authorization complete!")
    print("=" * 60)
    print()
    print("Your refresh token (copy this entire string):")
    print()
    print(creds.refresh_token)
    print()
    print("Next steps:")
    print("  1. Go to your GitHub repo → Settings → Secrets and variables → Actions")
    print("  2. Add a new secret: GOOGLE_REFRESH_TOKEN")
    print("  3. Paste the refresh token above as the value")
    print()

    # Also print client ID and secret for convenience
    with open(creds_path) as f:
        client_info = json.load(f)

    installed = client_info.get("installed", client_info.get("web", {}))
    print("You'll also need these as GitHub secrets:")
    print(f"  GOOGLE_CLIENT_ID     = {installed.get('client_id', '(check credentials.json)')}")
    print(f"  GOOGLE_CLIENT_SECRET = {installed.get('client_secret', '(check credentials.json)')}")
    print()


if __name__ == "__main__":
    main()
