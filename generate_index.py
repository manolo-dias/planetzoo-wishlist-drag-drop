#!/usr/bin/env python3
import json

# Ler a ordem original das imagens
with open('original_order.txt', 'r') as f:
    images = [line.strip() for line in f.readlines()]

# Criar o JSON com a estrutura simples de array
index_data = []

for i, image in enumerate(images):
    index_data.append(image)

# Salvar o novo index.json
with open('index.json', 'w') as f:
    json.dump(index_data, f, indent=2)

print(f"Created index.json with {len(index_data)} images")
print("First 10 images:", index_data[:10])