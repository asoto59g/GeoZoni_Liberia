from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
USES_PDF = ROOT / "PREPROPUESTA" / "01_RESUMEN POT" / "PR_Lib - Tabla usos POT.pdf"
ZONING_PDF = (
    ROOT
    / "PREPROPUESTA"
    / "03_PROPUESTAS"
    / "02. Reglamentos de Desarrollo Urbano"
    / "PR_Lib - 01_Reglamento de Zonificación y forma urbana.pdf"
)
OUTPUT = ROOT / "data" / "normativa_transectos.json"

ZONE_COLUMNS = {
    "R1": 8,
    "R2": 9,
    "R3": 10,
    "R4": 11,
    "T3": 12,
    "T4": 13,
    "T5": 14,
    "T6": 15,
    "ZE1": 16,
    "ZE2": 17,
    "ZE3": 18,
    "ZE4": 19,
}

ZONE_ARTICLES = {
    "R1": {"article": "Artículo 19", "extra_articles": ["Artículo 20"], "title": "Transecto R1 - Litoral"},
    "R2": {"article": "Artículo 21", "extra_articles": ["Artículo 22"], "title": "Transecto R2 - Montañoso"},
    "R3": {"article": "Artículo 23", "extra_articles": [], "title": "Transecto R3 - Cuenca Baja"},
    "R4": {"article": "Artículo 24", "extra_articles": [], "title": "Transecto R4 - Transición"},
    "T3": {"article": "Artículo 25", "extra_articles": [], "title": "Transecto T3 - Suburbano"},
    "T4": {"article": "Artículo 26", "extra_articles": [], "title": "Transecto T4 - Urbano general"},
    "T5": {"article": "Artículo 27", "extra_articles": [], "title": "Transecto T5 - Centro Urbano"},
    "T6": {"article": "Artículo 28", "extra_articles": ["Artículo 29"], "title": "Transecto T6 - Núcleo Urbano"},
    "ZE1": {"article": "Artículo 30", "extra_articles": [], "title": "Transecto ZE1 - Distrito Histórico"},
    "ZE2": {"article": "Artículo 31", "extra_articles": [], "title": "Transecto ZE2 - Institucional"},
    "ZE3": {"article": "Artículo 32", "extra_articles": [], "title": "Transecto ZE3 - Académico"},
    "ZE4": {"article": "Artículo 33", "extra_articles": [], "title": "Transecto ZE4 - Aeroportuario"},
}

ALIASES = {
    "R1 Zona de Conservación y Turismo Costero": "R1",
    "R1 Zona Litoral": "R1",
    "R2 Zona Agroforestal y Turismo de Montaña": "R2",
    "R3 Zona de Producción Agrícola e Integración Comunitaria": "R3",
    "R4 Zona de Manejo Agroecológico y Sustentable": "R4",
    "T3 Zona Suburbana": "T3",
    "T4 Zona Urbana": "T4",
    "T5 Zona Centro Urbano": "T5",
    "T6 Zona Núcleo Urbano": "T6",
    "Zona Especial Histórica": "ZE1",
    "ZE1 Zona Especial Histórica": "ZE1",
    "Zona Especial  Institucional": "ZE2",
    "Zona Especial Institucional": "ZE2",
    "ZE2 Zona Especial Institucional": "ZE2",
    "Zona Especial Académica": "ZE3",
    "ZE3 Zona Especial Académica": "ZE3",
    "Zona Especial Aeroportuaria": "ZE4",
    "ZE4 Zona Especial Aeroportuaria": "ZE4",
}


def clean(value: object) -> str:
    text = "" if value is None else str(value)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_decision(value: object) -> str:
    text = clean(value).upper()
    if text == "SI":
        return "permitido"
    if text == "NO":
        return "no_permitido"
    return "sin_dato"


def has_conditions(use: dict) -> bool:
    for field in ("area_m2", "vialidad", "condicion_adicional", "condicion_aeropuerto"):
        value = clean(use.get(field, ""))
        if value and value not in {"-", "libre"}:
            return True
    return False


def extract_uses() -> dict[str, dict[str, list[dict]]]:
    if not USES_PDF.exists():
        raise FileNotFoundError(f"No existe {USES_PDF}")

    by_zone: dict[str, dict[str, list[dict]]] = {
        zone: {"permitidos": [], "condicionados": [], "no_permitidos": [], "sin_dato": []}
        for zone in ZONE_COLUMNS
    }

    doc = fitz.open(USES_PDF)
    current_category = ""

    for page in doc:
        for table in page.find_tables().tables:
            for row in table.extract()[2:]:
                if len(row) < 20:
                    continue
                code = clean(row[1])
                if not re.match(r"^\d{2}\.\d{2}", code):
                    continue

                category_cell = clean(row[0])
                if category_cell:
                    current_category = category_cell

                use_base = {
                    "codigo": code,
                    "categoria": current_category,
                    "actividad": clean(row[2]),
                    "descripcion": clean(row[3]),
                    "area_m2": clean(row[4]),
                    "vialidad": clean(row[5]),
                    "condicion_adicional": clean(row[6]),
                    "condicion_aeropuerto": clean(row[7]),
                }

                for zone, col_index in ZONE_COLUMNS.items():
                    decision = normalize_decision(row[col_index])
                    item = dict(use_base)
                    item["decision"] = decision
                    if decision == "permitido":
                        by_zone[zone]["permitidos"].append(item)
                        if has_conditions(item):
                            by_zone[zone]["condicionados"].append(item)
                    elif decision == "no_permitido":
                        by_zone[zone]["no_permitidos"].append(item)
                    else:
                        by_zone[zone]["sin_dato"].append(item)

    return by_zone


def extract_descriptions() -> dict[str, str]:
    if not ZONING_PDF.exists():
        raise FileNotFoundError(f"No existe {ZONING_PDF}")

    doc = fitz.open(ZONING_PDF)
    text = "\n".join(page.get_text("text") for page in doc)
    descriptions = {}

    article_numbers = {
        "R1": (19, 20),
        "R2": (21, 22),
        "R3": (23, 24),
        "R4": (24, 25),
        "T3": (25, 26),
        "T4": (26, 27),
        "T5": (27, 28),
        "T6": (28, 29),
        "ZE1": (30, 31),
        "ZE2": (31, 32),
        "ZE3": (32, 33),
        "ZE4": (33, 34),
    }

    for zone, (start_article, end_article) in article_numbers.items():
        pattern = rf"Artículo {start_article}\.\s*(.*?)(?=Artículo {end_article}\.)"
        match = re.search(pattern, text, flags=re.S)
        section = match.group(1) if match else ""
        desc_match = re.search(r"Descripción:\s*(.*?)\s+Usos\s+Ver tablas", section, flags=re.S)
        descriptions[zone] = clean(desc_match.group(1) if desc_match else section[:900])

    return descriptions


def build_matrix() -> dict:
    uses = extract_uses()
    descriptions = extract_descriptions()
    zones = {}

    for zone in ZONE_COLUMNS:
        article_info = ZONE_ARTICLES[zone]
        permitted = uses[zone]["permitidos"]
        conditional = uses[zone]["condicionados"]
        prohibited = uses[zone]["no_permitidos"]

        zones[zone] = {
            "codigo_zona": zone,
            "nombre": article_info["title"],
            "resumen": descriptions.get(zone, ""),
            "usos_permitidos": permitted,
            "usos_condicionados": conditional,
            "usos_no_permitidos": prohibited,
            "articulos": [article_info["article"], *article_info["extra_articles"], "Artículo 34", "Artículo 35"],
            "conteo_usos": {
                "permitidos": len(permitted),
                "condicionados": len(conditional),
                "no_permitidos": len(prohibited),
            },
            "observaciones": (
                "Los usos permitidos y no permitidos provienen del Anexo Tabla de Usos. "
                "Las condiciones de área, vialidad, aeropuerto y requisitos adicionales deben verificarse junto con los demás reglamentos del POT."
            ),
        }

    return {
        "version": "1.0",
        "estado": "extraido_de_pdfs_locales",
        "fecha_extraccion": "2026-09-19",
        "fuentes": [
            "PREPROPUESTA/01_RESUMEN POT/PR_Lib - Tabla usos POT.pdf",
            "PREPROPUESTA/03_PROPUESTAS/02. Reglamentos de Desarrollo Urbano/PR_Lib - 01_Reglamento de Zonificación y forma urbana.pdf",
        ],
        "nota": (
            "Matriz generada desde documentos locales de la PREPROPUESTA. "
            "El informe es referencial y debe contrastarse con los documentos oficiales vigentes."
        ),
        "aliases": ALIASES,
        "zonas": zones,
    }


def main() -> None:
    matrix = build_matrix()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(matrix, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escrito {OUTPUT}")
    for zone, data in matrix["zonas"].items():
        counts = data["conteo_usos"]
        print(
            f"{zone}: {counts['permitidos']} permitidos, "
            f"{counts['condicionados']} condicionados, {counts['no_permitidos']} no permitidos"
        )


if __name__ == "__main__":
    main()
