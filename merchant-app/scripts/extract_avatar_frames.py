import os
from PIL import Image, ImageSequence

source_dir = r"E:\lombas\assets\file datas"
target_dir = r"E:\lombas\frontend\merchant-app\public\agent-avatar"

os.makedirs(target_dir, exist_ok=True)

# File 1: Chibi_cyber-girl_posing_in_video_202608112216.webp (240 frames)
# We want ~30 frames for talking animation (e.g. step of 8) -> 30 frames
src_file_1 = os.path.join(source_dir, "Chibi_cyber-girl_posing_in_video_202608112216.webp")
out_dir_talking = os.path.join(target_dir, "talking")
os.makedirs(out_dir_talking, exist_ok=True)

img1 = Image.open(src_file_1)
all_frames1 = [frame.copy() for frame in ImageSequence.Iterator(img1)]
total1 = len(all_frames1)

# Step size to get ~30 high quality frames
step1 = max(1, total1 // 30)
count1 = 0
for i in range(0, total1, step1):
    if count1 >= 30:
        break
    frame = all_frames1[i].convert("RGB")
    # Resize to a crisp 360x640 for lightweight web animation
    frame_resized = frame.resize((360, 640), Image.Resampling.LANCZOS)
    out_path = os.path.join(out_dir_talking, f"frame_{count1:02d}.jpg")
    frame_resized.save(out_path, "JPEG", quality=85)
    count1 += 1

print(f"Extracted {count1} frames into {out_dir_talking}")

# File 2: Cyber-girl_changing_poses_202608112224.webp (192 frames)
# We want ~30 frames for idle animation (e.g. step of 6) -> 30 frames
src_file_2 = os.path.join(source_dir, "Cyber-girl_changing_poses_202608112224.webp")
out_dir_idle = os.path.join(target_dir, "idle")
os.makedirs(out_dir_idle, exist_ok=True)

img2 = Image.open(src_file_2)
all_frames2 = [frame.copy() for frame in ImageSequence.Iterator(img2)]
total2 = len(all_frames2)

step2 = max(1, total2 // 30)
count2 = 0
for i in range(0, total2, step2):
    if count2 >= 30:
        break
    frame = all_frames2[i].convert("RGB")
    frame_resized = frame.resize((360, 640), Image.Resampling.LANCZOS)
    out_path = os.path.join(out_dir_idle, f"frame_{count2:02d}.jpg")
    frame_resized.save(out_path, "JPEG", quality=85)
    count2 += 1

print(f"Extracted {count2} frames into {out_dir_idle}")
