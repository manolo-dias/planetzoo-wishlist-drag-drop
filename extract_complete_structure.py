#!/usr/bin/env python3
import re
import json
from bs4 import BeautifulSoup

# Ler o HTML original
with open('wishlistpacks.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# Estrutura final
structure = {}
current_section = None
current_subsection = None

# Encontrar todas as seções principais
text_content = soup.get_text()
lines = text_content.split('\n')

# Seções identificadas
sections = ['ANIMAIS', 'NATUREZA', 'CONSTRUÇÃO', 'JOGO BASE', 'COLEÇÃO', 'TOTAL OFICIAL', 'COMBOS DE PACK']

# Padrões de imagens
image_pattern = r'src="images/(image\d+)\.(jpg|png)"'
all_images = re.findall(image_pattern, html_content)

# Padrões de números (blocos)
number_pattern = r'<span[^>]*>(\d+)</span>'
numbers = re.findall(number_pattern, html_content)

# Extrair imagens na ordem
unique_images = []
seen = set()
for img_name, ext in all_images:
    if img_name not in seen:
        unique_images.append(img_name)
        seen.add(img_name)

print(f"Total de imagens únicas encontradas: {len(unique_images)}")
print(f"Números encontrados: {numbers}")

# Criar estrutura baseada na ordem visual
structure = {
    "sections": [
        {
            "title": "ANIMAIS",
            "subtitle": "pontos",
            "type": "images",
            "blocks": [
                {
                    "id": "7",
                    "title": "7",
                    "images": unique_images[0:7] if len(unique_images) >= 7 else unique_images[:len(unique_images)]
                },
                {
                    "id": "15", 
                    "title": "15",
                    "images": unique_images[7:22] if len(unique_images) >= 22 else unique_images[7:]
                },
                {
                    "id": "2",
                    "title": "2", 
                    "images": unique_images[22:24] if len(unique_images) >= 24 else []
                },
                {
                    "id": "35",
                    "title": "35",
                    "images": unique_images[24:59] if len(unique_images) >= 59 else []
                },
                {
                    "id": "18",
                    "title": "18", 
                    "images": unique_images[59:77] if len(unique_images) >= 77 else []
                },
                {
                    "id": "3",
                    "title": "3",
                    "images": unique_images[77:80] if len(unique_images) >= 80 else []
                },
                {
                    "id": "20",
                    "title": "20",
                    "images": unique_images[80:100] if len(unique_images) >= 100 else []
                },
                {
                    "id": "24",
                    "title": "24",
                    "images": unique_images[100:124] if len(unique_images) >= 124 else []
                },
                {
                    "id": "17",
                    "title": "17",
                    "images": unique_images[124:141] if len(unique_images) >= 141 else []
                },
                {
                    "id": "25",
                    "title": "25",
                    "images": unique_images[141:166] if len(unique_images) >= 166 else []
                },
                {
                    "id": "29",
                    "title": "29",
                    "images": unique_images[166:195] if len(unique_images) >= 195 else []
                },
                {
                    "id": "15_2",
                    "title": "15",
                    "images": unique_images[195:205] if len(unique_images) >= 205 else []
                }
            ]
        },
        {
            "title": "NATUREZA",
            "type": "text",
            "items": [
                "Aquatic Park Pack (8)🏆",
                "Conservation Pack (13)🏆", 
                "Africa Pack (9)🏆",
                "Australia Pack (9)🏆",
                "Twilight Animal Pack (8)🏆",
                "Oceania Pack (10)🏆",
                "Tropical Pack (8)🏆",
                "Zookeepers Animal Pack (8)🏆",
                "South America Animal Pack (9)🏆"
            ],
            "not_included": [
                "Grasslands Animal Pack",
                "Wetlands Animal Pack", 
                "North America Animal Pack",
                "Eurasia Animal Pack",
                "Americas Animal Pack",
                "Arid Animal Pack",
                "Southeast Asia Animal Pack",
                "Arctic Pack",
                "Asia Animal Pack",
                "Zookeepers Animal Pack"
            ]
        },
        {
            "title": "CONSTRUÇÃO", 
            "type": "text",
            "items": [
                "Europe Animal Pack🏆",
                "Aquatic Park Pack🏆",
                "Arctic Pack🏆",
                "Australia Pack🏆",
                "Twilight Animal Pack🏆",
                "Oceania Pack🏆",
                "Tropical Pack🏆",
                "Zookeepers Animal Pack🏆",
                "Africa Pack🏆",
                "South America Animal Pack🏆",
                "Conservation Pack🏆",
                "Asia Animal Pack🏆",
                "Americas Animal Pack🏆"
            ]
        },
        {
            "title": "TOTAL OFICIAL",
            "subtitle": "(92/210)",
            "type": "images",
            "blocks": [
                {
                    "id": "27",
                    "title": "27¹",
                    "images": unique_images[:27] if len(unique_images) >= 27 else unique_images
                },
                {
                    "id": "39", 
                    "title": "39¹³",
                    "images": unique_images[27:66] if len(unique_images) >= 66 else []
                },
                {
                    "id": "47",
                    "title": "47³", 
                    "images": unique_images[66:113] if len(unique_images) >= 113 else []
                },
                {
                    "id": "18_total",
                    "title": "18²",
                    "images": unique_images[113:131] if len(unique_images) >= 131 else []
                }
            ]
        }
    ]
}

# Salvar estrutura
with open('complete_structure.json', 'w', encoding='utf-8') as f:
    json.dump(structure, f, indent=2, ensure_ascii=False)

print("Estrutura completa extraída para complete_structure.json")
print(f"Seções: {len(structure['sections'])}")