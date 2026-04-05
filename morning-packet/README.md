# Morning Packet

A daily SMS briefing sent to your phone at 8am ET every weekday. Pulls from Google Calendar, ClickUp, and Gmail, filters through configurable rules ("The Adam Filter"), formats via Claude API, and delivers via Twilio SMS.

No apps, no logins — just a text on your lock screen telling you what to do today.

## First-Time Setup

### 1. Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Gmail API** and **Google Calendar API**:
   - APIs & Services → Library → search "Gmail API" → Enable
   - APIs & Services → Library → search "Google Calendar API" → Enable
4. Create OAuth 2.0 credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Desktop app**
   - Download the JSON file and save it as `credentials.json` in the `morning-packet/` directory
5. Configure the OAuth consent screen:
   - Add your Google account as a test user
   - Scopes needed: `gmail.readonly` and `calendar.readonly`

### 2. Generate Google Refresh Token

```bash
cd morning-packet
pip install -r requirements.txt
python auth/setup_google.py
```

This opens a browser for Google authorization. After approving, it prints your refresh token. Copy it — you'll need it for GitHub secrets.

### 3. Twilio

1. Create an account at [twilio.com](https://www.twilio.com/)
2. Get a phone number (Messaging → Phone Numbers)
3. Note your Account SID, Auth Token, and the phone number

### 4. ClickUp API Key

1. Go to ClickUp → Settings → Apps
2. Generate a personal API token

### 5. Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an API key

### 6. GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions, and add:

| Secret | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From credentials.json |
| `GOOGLE_CLIENT_SECRET` | From credentials.json |
| `GOOGLE_REFRESH_TOKEN` | From step 2 above |
| `CLICKUP_API_KEY` | From step 4 |
| `ANTHROPIC_API_KEY` | From step 5 |
| `TWILIO_ACCOUNT_SID` | From step 3 |
| `TWILIO_AUTH_TOKEN` | From step 3 |
| `TWILIO_FROM_NUMBER` | Your Twilio number (+1XXXXXXXXXX) |
| `TWILIO_TO_NUMBER` | Your personal number (+1XXXXXXXXXX) |

### 7. Test

Push the code, then go to Actions → Morning Packet → Run workflow (manual trigger).

## Updating the Config

Edit `config.yaml` to change what appears in your briefing:

- **Add a new client contact**: Add their email to `gmail.allow_senders`
- **Remove a closed deal**: Delete the email from `gmail.allow_senders`
- **Ignore a noisy sender**: Add their domain to `gmail.ignore_senders`
- **Add an alert sender**: Add to `gmail.alert_senders` (only surfaces if subject matches `alert_subjects`)
- **Strip a calendar event**: Add the title pattern to `calendar.strip_patterns`

After editing, commit and push. Changes take effect the next morning.

## Local Testing

```bash
cd morning-packet
cp .env.example .env
# Fill in all values in .env
python packet.py
```

The script works identically locally — useful for testing format changes before pushing.

## Troubleshooting

**"Google auth expired"**
The refresh token has been revoked or the Google Cloud project was modified. Re-run `python auth/setup_google.py` locally and update the `GOOGLE_REFRESH_TOKEN` secret.

**Empty packet / missing sections**
Check GitHub Actions logs. Each source prints how many items it found. If a source returns 0 items, verify the API key and config values.

**SMS not arriving**
- Check Twilio logs at console.twilio.com → Monitor → Logs
- Verify `TWILIO_FROM_NUMBER` and `TWILIO_TO_NUMBER` are in E.164 format (+1XXXXXXXXXX)
- Ensure your Twilio account has sufficient balance

**Packet too long / truncated**
The formatter instructs Claude to stay under 1400 characters. If it still overflows, the sender truncates at the last complete line. Reduce `clickup.max_items` or tighten the Gmail filters to reduce input data.

**Wrong time / DST shift**
GitHub Actions cron runs in UTC. The workflow uses `0 12 * * 1-5` (12:00 UTC = 8am EDT). During EST (November–March), 8am ET = 13:00 UTC. Update the cron schedule seasonally, or add a second line for `0 13 * * 1-5`.
