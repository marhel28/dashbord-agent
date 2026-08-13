import os
from PIL import Image, ImageSequence

base_dir = r"E:\lombas\assets\file datas"
files = [
    "Chibi_cyber-girl_posing_in_video_202608112216.webp",
    "Cyber-girl_changing_poses_202608112224.webp"
]

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        img = Image.open(filepath)
        frames = []
        try:
            for frame in ImageSequence.Iterator(img):
                frames.append(frame.copy())
        except Exception as e:
            print(f"Error reading frames for {filename}: {e}")
        print(f"{filename}: total {len(frames)} frames, size: {img.size}")
