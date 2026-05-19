import os
import json
import sys

# Carpeta con las imágenes y archivo JSON de salida
folder_path = "images"
output_json = "images.json"

# Extensiones tratadas como imagen (ignora .DS_Store, Thumbs.db, etc.)
valid_ext = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".bmp")

if not (os.path.exists(folder_path) and os.path.isdir(folder_path)):
    print(f"La carpeta no existe: {folder_path}")
    sys.exit(1)

# Lista ordenada y estable (diffs mínimos al regenerar en cada commit)
file_list = sorted(
    (
        f
        for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f))
        and f.lower().endswith(valid_ext)
    ),
    key=str.lower,
)

json_data = {"images": [f"../images/{file_name}" for file_name in file_list]}

with open(output_json, "w", encoding="utf-8") as json_file:
    json.dump(json_data, json_file, indent=4, ensure_ascii=False)
    json_file.write("\n")

print(f"{output_json} actualizado: {len(file_list)} imágenes")
