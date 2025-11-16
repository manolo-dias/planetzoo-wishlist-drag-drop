#!/usr/bin/env python3
import re
import json

# Ler o HTML
with open('wishlistpacks.html', 'r') as f:
    html_content = f.read()

# Encontrar todas as seções numeradas e suas imagens
blocks = {}
current_block = None

# Padrão para encontrar os números dos blocos
block_pattern = r'<p class="c9"><span[^>]*>(\d+)'
# Padrão para encontrar as imagens
image_pattern = r'src="images/(image\d+)\.(jpg|png)"'

lines = html_content.split('\n')
current_block_number = None

for i, line in enumerate(lines):
    # Verificar se é uma linha com número de bloco
    block_match = re.search(block_pattern, line)
    if block_match:
        current_block_number = int(block_match.group(1))
        blocks[current_block_number] = []
        continue
    
    # Se estamos em um bloco, procurar por imagens nas próximas linhas (até encontrar outro bloco)
    if current_block_number is not None:
        image_matches = re.findall(image_pattern, line)
        for image_name, ext in image_matches:
            if image_name not in blocks[current_block_number]:  # Evitar duplicatas no mesmo bloco
                blocks[current_block_number].append(image_name)

# Remover blocos vazios e ordenar
blocks = {k: v for k, v in blocks.items() if v}
blocks = dict(sorted(blocks.items()))

# Salvar o resultado
with open('blocks_structure.json', 'w') as f:
    json.dump(blocks, f, indent=2)

print("Blocos encontrados:")
for block_num, images in blocks.items():
    print(f"Bloco {block_num}: {len(images)} imagens")
    print(f"  Primeiras 5: {images[:5]}")

print(f"\nTotal de blocos: {len(blocks)}")
print(f"Total de imagens únicas em todos os blocos: {len(set(img for imgs in blocks.values() for img in imgs))}")