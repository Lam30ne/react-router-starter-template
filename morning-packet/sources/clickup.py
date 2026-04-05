"""ClickUp source — pulls tasks from Adam's Plate list."""

import os

import requests


PRIORITY_LABELS = {1: "urgent", 2: "high", 3: "normal", 4: "low"}


def get_clickup_tasks(config):
    """Fetch open tasks from the configured ClickUp list.

    Returns a list of dicts with keys: name, priority, url, description
    Sorted by priority (urgent first), then by date_created (newest first).
    """
    cu_config = config.get("clickup", {})
    list_id = cu_config.get("list_id")
    max_items = cu_config.get("max_items", 5)

    api_key = os.environ["CLICKUP_API_KEY"]

    resp = requests.get(
        f"https://api.clickup.com/api/v2/list/{list_id}/task",
        headers={"Authorization": api_key},
        params={
            "statuses[]": ["to do", "in progress"],
            "include_closed": "false",
        },
    )
    resp.raise_for_status()

    raw_tasks = resp.json().get("tasks", [])

    tasks = []
    for t in raw_tasks:
        priority_obj = t.get("priority")
        priority_num = int(priority_obj["orderindex"]) if priority_obj else 4
        tasks.append(
            {
                "name": t.get("name", ""),
                "priority": PRIORITY_LABELS.get(priority_num, "normal"),
                "priority_num": priority_num,
                "url": t.get("url", ""),
                "description": (t.get("description") or "")[:200],
                "date_created": t.get("date_created", "0"),
            }
        )

    # Sort: urgent first (lowest number), then newest first
    tasks.sort(key=lambda x: (x["priority_num"], -int(x["date_created"])))

    # Clean up internal fields before returning
    for t in tasks[:max_items]:
        t.pop("priority_num", None)
        t.pop("date_created", None)

    return tasks[:max_items]
