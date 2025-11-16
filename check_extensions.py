#!/usr/bin/env python3
import os
import json

# Verificar quais extensões existem para cada imagem
extensions_map = {}

for i in range(1, 206):  # 1 a 205
    image_name = f"image{i}"
    jpg_path = f"images/{image_name}.jpg"
    png_path = f"images/{image_name}.png"
    
    if os.path.exists(jpg_path):
        extensions_map[image_name] = "jpg"
    elif os.path.exists(png_path):
        extensions_map[image_name] = "png"
    else:
        print(f"Warning: Neither {jpg_path} nor {png_path} found")

# Salvar o mapeamento
with open('extensions_map.json', 'w') as f:
    json.dump(extensions_map, f, indent=2)

print(f"Found extensions for {len(extensions_map)} images")
print("PNG files:", [k for k, v in extensions_map.items() if v == "png"])