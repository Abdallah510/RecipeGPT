import json
from collections import defaultdict

grouped = defaultdict(list)

with open("Food.json", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        item = json.loads(line)  # parse each JSON object separately
        name = item.get("name")
        subgroup = item.get("food_group")
        if name and subgroup:
            grouped[subgroup].append(name)

# Convert to regular dict and save
grouped = dict(grouped)
with open("foods_grouped.json", "w", encoding="utf-8") as f:
    json.dump(grouped, f, indent=4, ensure_ascii=False)

print("✅ Saved as foods_grouped.json")
