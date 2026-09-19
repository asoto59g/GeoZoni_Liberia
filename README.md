# GeoZoni Liberia

Aplicacion estatica para consultar un punto del canton de Liberia contra el Web Map publico de la pre-propuesta POT 2026 y generar un informe PDF descargable.

Repositorio: `https://github.com/asoto59g/GeoZoni_Liberia`

URL esperada en GitHub Pages: `https://asoto59g.github.io/GeoZoni_Liberia/`

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

## Limitacion importante

El portal SharePoint indicado solicita inicio de sesion desde este entorno. Por eso los usos permitidos, condicionados, no permitidos y articulos quedan como plantilla editable en `data/normativa_transectos.json`. Cuando tenga los documentos oficiales, complete esa matriz y la app los incluira automaticamente en pantalla y PDF.

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

## Notas tecnicas

- La app usa ArcGIS Maps SDK for JavaScript desde CDN.
- Las consultas se realizan directamente contra servicios ArcGIS REST publicos.
- El PDF se genera con `jsPDF` y `jspdf-autotable`.
- No almacena ubicacion ni resultados en servidor.

## Descargo

El informe es referencial y no sustituye certificado oficial de uso de suelo ni criterio de la Municipalidad de Liberia.
