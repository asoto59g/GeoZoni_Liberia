<p align="center">
  <img src="pot_github.gif" alt="Pot animation">
</p>
# GeoZoni Liberia

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-GeoZoni_Liberia-2ea44f?logo=github)](https://asoto59g.github.io/GeoZoni_Liberia/)
![HTML CSS JS](https://img.shields.io/badge/app-HTML%2FCSS%2FJS-007f78)
![ArcGIS](https://img.shields.io/badge/ArcGIS-Web%20Map-2c7ac3)
![GPS](https://img.shields.io/badge/GPS-compatible-5a5a5a)
![PDF](https://img.shields.io/badge/PDF-informe%20descargable-b30b00)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Aplicacion estatica para consultar un punto del canton de Liberia contra el Web Map publico de la pre-propuesta POT 2026 y generar un informe PDF descargable.

Link de app:   https://asoto59g.github.io/GeoZoni_Liberia/

Fuente de informacion: portal de la Municipalidad de Liberia, con corte al 18 de setiembre de 2026.

## Audiencia publica

Fecha audiencia publica: 05 noviembre 2026, 5:00 p.m.  
Lugar: Estadio Edgardo Baltodano Briceño.

## Que incluye

- Carga del Web Map publico `Mapa propuesta POT 2026`.
- Seleccion por clic en el mapa o por GPS del dispositivo.
- Consulta por punto de:
  - Transectos / zonas.
  - Parametros urbanisticos disponibles en la capa de transectos.
  - Restricciones y afectaciones del servicio `Mapa_WFL1`.
  - Predio catastral intersectado.
  - Vialidad propuesta cercana.
- Generacion de PDF en el navegador, sin backend.
- Matriz normativa editable en `data/normativa_transectos.json`.

## Fuentes normativas

La matriz `data/normativa_transectos.json` se genera desde documentos locales en `PREPROPUESTA/`:

- `PREPROPUESTA/01_RESUMEN POT/PR_Lib - Tabla usos POT.pdf`
- `PREPROPUESTA/03_PROPUESTAS/02. Reglamentos de Desarrollo Urbano/PR_Lib - 01_Reglamento de Zonificación y forma urbana.pdf`

El directorio `PREPROPUESTA/` no se sube al repo porque contiene fuentes pesadas. Para regenerar la matriz:

```powershell
python scripts/extract_normativa.py
```

## Ejecutar localmente

Desde la raiz del repo:

```powershell
python -m http.server 8080
```

Abra `http://localhost:8080`. El GPS funciona en `localhost` y en sitios HTTPS como GitHub Pages.

## Publicar en GitHub Pages

1. Suba estos archivos a la raiz del repositorio `asoto59g/GeoZoni_Liberia`.
2. En GitHub, vaya a `Settings` > `Pages`.
3. Seleccione `Deploy from a branch`.
4. Seleccione la rama `main` y carpeta `/root`.
5. Espere a que GitHub publique la URL.

Tambien puede publicarse desde esta carpeta con Git:

```powershell
git remote -v
git add .
git commit -m "Publicar visor GeoZoni Liberia"
git push -u origin main
```

## Archivos principales

- `index.html`: estructura de la aplicacion y librerias CDN.
- `styles.css`: interfaz responsiva.
- `js/config.js`: fuentes ArcGIS, campos, capas y etiquetas del informe.
- `js/app.js`: mapa, consultas espaciales, GPS, render de resultados y PDF.
- `data/normativa_transectos.json`: matriz editable de usos y normativa por zona.
- `scripts/extract_normativa.py`: genera la matriz normativa a partir de los PDFs locales.

## Notas tecnicas

- La app usa ArcGIS Maps SDK for JavaScript desde CDN.
- Las consultas se realizan directamente contra servicios ArcGIS REST publicos.
- El PDF se genera con `jsPDF` y `jspdf-autotable`.
- No almacena ubicacion ni resultados en servidor.

## Licencia

Este proyecto se publica bajo licencia MIT. Consulte `LICENSE`.

## Descargo

El informe es referencial y no sustituye certificado oficial de uso de suelo ni criterio de la Municipalidad de Liberia.
