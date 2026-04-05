"""Google Calendar source — pulls today's events."""

from datetime import datetime, timedelta

import pytz

from auth.google_auth import get_calendar_service


def get_calendar_events(config):
    """Fetch today's calendar events (midnight to midnight, America/New_York).

    Returns a list of dicts with keys:
        summary, start_time, end_time, location, creator_email, num_attendees
    """
    tz = pytz.timezone(config["schedule"]["timezone"])
    now = datetime.now(tz)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    cal_config = config.get("calendar", {})
    calendar_id = cal_config.get("calendar_id", "primary")

    service = get_calendar_service()
    result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=start_of_day.isoformat(),
            timeMax=end_of_day.isoformat(),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )

    events = []
    for item in result.get("items", []):
        start = item.get("start", {})
        end = item.get("end", {})
        creator = item.get("creator", {})
        attendees = item.get("attendees", [])

        events.append(
            {
                "summary": item.get("summary", "(No title)"),
                "start_time": start.get("dateTime", start.get("date", "")),
                "end_time": end.get("dateTime", end.get("date", "")),
                "location": item.get("location", ""),
                "creator_email": creator.get("email", ""),
                "num_attendees": len(attendees),
            }
        )

    return events
