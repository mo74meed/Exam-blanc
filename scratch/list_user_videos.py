import os
import json

telegram_dir = "C:\\Users\\moham\\Downloads\\Telegram Desktop"
print(f"Scanning directory: {telegram_dir}")

files_list = []
if os.path.exists(telegram_dir):
    for root, dirs, files in os.walk(telegram_dir):
        for f in files:
            if f.lower().endswith(('.mp4', '.mkv', '.avi')):
                rel_path = os.path.relpath(os.path.join(root, f), telegram_dir)
                files_list.append({
                    "name": f,
                    "rel_path": rel_path,
                    "size_mb": round(os.path.getsize(os.path.join(root, f)) / (1024 * 1024), 2)
                })

# Save to JSON
out_path = "scratch/user_videos.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(files_list, f, indent=4)

print(f"Found {len(files_list)} video files. Saved list to {out_path}")
