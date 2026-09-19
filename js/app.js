(() => {
  const config = window.APP_CONFIG;
  const dom = {};
  let view;
  let markerLayer;
  let reportLayers = [];
  let latestReport = null;
  let normativeMatrix = {};

  const valueCodes = {
    P: "Permitido",
    NP: "No permitido",
    NA: "No aplica"
  };

  require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/widgets/BasemapToggle",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/geometry/Point",
    "esri/geometry/support/webMercatorUtils"
  ], (
    WebMap,
    MapView,
    FeatureLayer,
    GraphicsLayer,
    Graphic,
    Home,
    ScaleBar,
    BasemapToggle,
    LayerList,
    Legend,
    Expand,
    Point,
    webMercatorUtils
  ) => {
    cacheDom();
    setupIcons();
    setupButtons(Point, webMercatorUtils);
    loadNormativeMatrix();

    const webmap = new WebMap({
      portalItem: {
        id: config.webMapId,
        portal: { url: config.portalUrl }
      }
    });

    markerLayer = new GraphicsLayer({
      title: "Punto consultado",
      listMode: "hide"
    });
    webmap.add(markerLayer);

    view = new MapView({
      container: "viewDiv",
      map: webmap,
      center: config.defaultView.center,
      zoom: config.defaultView.zoom,
      constraints: {
        snapToZoom: false
      }
    });

    reportLayers = createReportLayers(FeatureLayer);
    setupMapWidgets(Home, ScaleBar, BasemapToggle, LayerList, Legend, Expand);

    view.when(() => {
      setStatus("Seleccione un punto", "Use el mapa o el GPS del dispositivo para generar el informe.", "ready");
      view.on("click", (event) => analyzePoint(event.mapPoint, "map-click", webMercatorUtils, Graphic));
    }).catch((error) => {
      setStatus("No se pudo cargar el mapa", getErrorMessage(error), "error");
    });

    async function analyzePoint(mapPoint, source, mercatorUtils, GraphicClass) {
      if (!mapPoint) return;

      setBusy(true, "Consultando capas...");
      latestReport = null;
      dom.pdfButton.disabled = true;
      drawMarker(mapPoint, GraphicClass);

      const pointInfo = getPointInfo(mapPoint, mercatorUtils);
      const report = {
        source,
        generatedAt: new Date(),
        point: pointInfo,
        zone: [],
        cadastre: [],
        roads: [],
        restrictions: [],
        errors: []
      };

      setStatus("Consultando punto", `${formatCoord(pointInfo.lat)}, ${formatCoord(pointInfo.lon)}`, "ready");
      safeGoTo(mapPoint);

      const tasks = reportLayers.map((item) => queryLayer(item, mapPoint));
      const settled = await Promise.allSettled(tasks);

      settled.forEach((entry, index) => {
        const layerConfig = reportLayers[index];
        if (entry.status === "rejected") {
          report.errors.push({
            title: layerConfig.title,
            message: getErrorMessage(entry.reason)
          });
          return;
        }

        const result = entry.value;
        if (!result.features.length) return;

        if (layerConfig.role === "zoning") report.zone.push(result);
        if (layerConfig.role === "cadastre") report.cadastre.push(result);
        if (layerConfig.role === "roads") report.roads.push(result);
        if (layerConfig.role === "restriction") report.restrictions.push(result);
      });

      latestReport = report;
      renderReport(report);
      dom.pdfButton.disabled = false;
      setBusy(false);
    }

    async function queryLayer(layerConfig, geometry) {
      await layerConfig.layer.load();
      const query = layerConfig.layer.createQuery();
      query.geometry = geometry;
      query.spatialRelationship = layerConfig.spatialRelationship || "intersects";
      query.outFields = ["*"];
      query.returnGeometry = false;
      query.num = layerConfig.max || 10;

      if (layerConfig.queryDistance) {
        query.distance = layerConfig.queryDistance;
        query.units = "meters";
      }

      const response = await layerConfig.layer.queryFeatures(query);
      return {
        ...layerConfig,
        features: response.features || []
      };
    }

    async function downloadPdf() {
      if (!latestReport) return;

      setBusy(true, "Generando PDF...");
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        let y = margin;

        doc.setProperties({
          title: `${config.report.title} - POT Liberia`,
          subject: config.report.subtitle,
          author: config.report.organization,
          creator: config.appName
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(config.report.title, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(config.report.subtitle, margin, y);
        y += 5;
        doc.text(`Generado: ${formatDate(latestReport.generatedAt)}`, margin, y);
        y += 7;

        const pointRows = [
          ["Latitud", formatCoord(latestReport.point.lat)],
          ["Longitud", formatCoord(latestReport.point.lon)],
          ["Origen", latestReport.source === "gps" ? "GPS del dispositivo" : "Clic en mapa"]
        ];
        y = addTable(doc, y, ["Dato", "Valor"], pointRows, margin, pageWidth);

        try {
          const shot = await view.takeScreenshot({ width: 1200, height: 680, format: "png" });
          y = ensurePage(doc, y, pageHeight, margin, 80);
          doc.addImage(shot.dataUrl, "PNG", margin, y, pageWidth - margin * 2, 72);
          y += 80;
        } catch (error) {
          y = addNote(doc, y, `No fue posible insertar captura del mapa: ${getErrorMessage(error)}`, margin, pageHeight);
        }

        y = addZoneToPdf(doc, latestReport, y, margin, pageWidth, pageHeight);
        y = addLayerGroupToPdf(doc, "Restricciones y afectaciones espaciales", latestReport.restrictions, y, margin, pageWidth, pageHeight);
        y = addLayerGroupToPdf(doc, "Predio catastral intersectado", latestReport.cadastre, y, margin, pageWidth, pageHeight);
        y = addLayerGroupToPdf(doc, "Vialidad propuesta cercana", latestReport.roads, y, margin, pageWidth, pageHeight);

        if (latestReport.errors.length) {
          y = addSectionTitle(doc, "Capas sin respuesta", y, margin, pageHeight);
          y = addTable(
            doc,
            y,
            ["Capa", "Error"],
            latestReport.errors.map((item) => [item.title, item.message]),
            margin,
            pageWidth
          );
        }

        y = addNote(doc, y, config.report.disclaimer, margin, pageHeight);
        const fileName = `informe-pot-liberia-${formatCoord(latestReport.point.lat)}-${formatCoord(latestReport.point.lon)}.pdf`.replaceAll(" ", "");
        doc.save(fileName);
      } finally {
        setBusy(false);
      }
    }

    dom.pdfButton.addEventListener("click", downloadPdf);

    function setupButtons(PointClass, mercatorUtils) {
      dom.gpsButton.addEventListener("click", () => {
        if (!navigator.geolocation) {
          setStatus("GPS no disponible", "El navegador no expone geolocalizacion.", "error");
          return;
        }

        setBusy(true, "Esperando GPS...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const point = new PointClass({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
              spatialReference: { wkid: 4326 }
            });
            const mapPoint = mercatorUtils.geographicToWebMercator(point);
            setBusy(false);
            analyzePoint(mapPoint, "gps", mercatorUtils, Graphic);
          },
          (error) => {
            setBusy(false);
            setStatus("GPS sin respuesta", error.message || "No fue posible obtener la ubicacion.", "error");
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
      });

      dom.clearButton.addEventListener("click", () => {
        markerLayer.removeAll();
        latestReport = null;
        dom.pdfButton.disabled = true;
        dom.reportContent.className = "report-content empty-state";
        dom.reportContent.innerHTML = "<p>El resultado incluira zona/transecto, parametros urbanisticos, restricciones espaciales, predio intersectado y vialidad cercana cuando exista informacion publica disponible.</p>";
        setStatus("Seleccione un punto", "Use el mapa o el GPS del dispositivo para generar el informe.", "ready");
      });
    }
  });

  function cacheDom() {
    [
      "gpsButton",
      "clearButton",
      "pdfButton",
      "statusBox",
      "statusTitle",
      "statusText",
      "reportContent",
      "busyOverlay",
      "busyText"
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });
  }

  function setupIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function createReportLayers(FeatureLayer) {
    const layers = [];
    const add = (item, role) => {
      layers.push({
        ...item,
        role,
        layer: new FeatureLayer({
          url: item.url,
          title: item.title,
          outFields: ["*"],
          listMode: "hide"
        })
      });
    };

    add(config.layers.zoning, "zoning");
    add(config.layers.cadastre, "cadastre");
    add(config.layers.roads, "roads");
    config.layers.restrictions.forEach((item) => add(item, "restriction"));
    return layers;
  }

  function setupMapWidgets(Home, ScaleBar, BasemapToggle, LayerList, Legend, Expand) {
    view.ui.add(new Home({ view }), "top-left");
    view.ui.add(new ScaleBar({ view, unit: "metric" }), "bottom-left");
    view.ui.add(new BasemapToggle({ view, nextBasemap: "satellite" }), "top-right");

    const layerList = new LayerList({ view });
    const legend = new Legend({ view });
    view.ui.add(new Expand({ view, content: layerList, expandIcon: "layers", group: "top-right" }), "top-right");
    view.ui.add(new Expand({ view, content: legend, expandIcon: "legend", group: "top-right" }), "top-right");
  }

  async function loadNormativeMatrix() {
    try {
      const response = await fetch("./data/normativa_transectos.json", { cache: "no-store" });
      normativeMatrix = await response.json();
    } catch (error) {
      normativeMatrix = {
        nota: `No se pudo cargar data/normativa_transectos.json: ${getErrorMessage(error)}`,
        zonas: {}
      };
    }
  }

  function drawMarker(point, GraphicClass) {
    markerLayer.removeAll();
    markerLayer.add(new GraphicClass({
      geometry: point,
      symbol: {
        type: "simple-marker",
        style: "circle",
        size: 13,
        color: [0, 127, 120, 0.95],
        outline: {
          color: [255, 255, 255, 1],
          width: 2
        }
      }
    }));
  }

  function safeGoTo(point) {
    if (!view) return;
    const zoom = Math.max(view.zoom || config.defaultView.zoom, 15);
    view.goTo({ target: point, zoom }, { duration: 500 }).catch(() => {});
  }

  function getPointInfo(point, mercatorUtils) {
    const sr = point.spatialReference || {};
    let geographic = point;
    if (sr.isWebMercator || sr.wkid === 102100 || sr.wkid === 3857 || sr.latestWkid === 3857) {
      geographic = mercatorUtils.webMercatorToGeographic(point);
    }

    return {
      lat: geographic.latitude ?? geographic.y,
      lon: geographic.longitude ?? geographic.x,
      x: point.x,
      y: point.y,
      wkid: sr.latestWkid || sr.wkid || "desconocido"
    };
  }

  function renderReport(report) {
    const zoneResult = report.zone[0];
    const zoneFeature = zoneResult?.features?.[0];
    const zoneAttrs = zoneFeature?.attributes || {};
    const zoneName = zoneAttrs.ETIQUETA || zoneAttrs.TRANSECTO || "Sin zona detectada";
    const restrictionCount = report.restrictions.reduce((sum, item) => sum + item.features.length, 0);

    setStatus(
      zoneFeature ? zoneName : "Fuera de zona",
      `${restrictionCount} restriccion(es) o afectacion(es) intersectadas`,
      restrictionCount ? "warning" : "ready"
    );

    const blocks = [
      renderPointBlock(report),
      renderZoneBlock(zoneAttrs),
      renderRestrictionsBlock(report.restrictions),
      renderLayerBlock("Predio catastral intersectado", report.cadastre, "No se encontro predio catastral para el punto."),
      renderLayerBlock("Vialidad propuesta cercana", report.roads, "No se encontro vialidad propuesta dentro del radio de consulta."),
      renderErrors(report.errors)
    ].filter(Boolean);

    dom.reportContent.className = "report-content";
    dom.reportContent.innerHTML = blocks.join("");
  }

  function renderPointBlock(report) {
    return `
      <section class="report-block">
        <h2>Punto consultado</h2>
        <div class="meta-grid">
          ${metric("Latitud", formatCoord(report.point.lat))}
          ${metric("Longitud", formatCoord(report.point.lon))}
          ${metric("Fuente", report.source === "gps" ? "GPS del dispositivo" : "Clic en mapa")}
          ${metric("Fecha", formatDate(report.generatedAt))}
        </div>
      </section>
    `;
  }

  function renderZoneBlock(attrs) {
    if (!attrs || !Object.keys(attrs).length) {
      return `
        <section class="report-block">
          <h2>Zona / transecto</h2>
          <p class="note">No se encontro interseccion con la capa Transectos (zonas).</p>
        </section>
      `;
    }

    const zoneName = attrs.ETIQUETA || attrs.TRANSECTO;
    const norm = getNormativeEntry(attrs);
    const sectionHtml = config.parameterSections.map((section) => {
      const rows = section.fields
        .map((field) => parameterMetric(field, attrs))
        .filter(Boolean)
        .join("");
      if (!rows) return "";
      return `<h3>${escapeHtml(section.title)}</h3><div class="parameter-grid">${rows}</div>`;
    }).join("");

    return `
      <section class="report-block">
        <h2>Zona / transecto</h2>
        <div class="tag-row">
          <span class="tag">${escapeHtml(zoneName || "Sin etiqueta")}</span>
          ${attrs.TRANSECTO && attrs.TRANSECTO !== zoneName ? `<span class="tag">${escapeHtml(attrs.TRANSECTO)}</span>` : ""}
        </div>
        <div class="meta-grid" style="margin-top: 10px;">
          ${metric("Area zona", formatWithUnit(attrs.AREA_HA, "ha"))}
          ${metric("Codigo", attrs.ID ?? "Sin dato")}
        </div>
        ${sectionHtml}
        ${renderNormative(norm)}
      </section>
    `;
  }

  function renderNormative(norm) {
    const permitted = getUseItems(norm.usos_permitidos);
    const conditional = getUseItems(norm.usos_condicionados);
    const prohibited = getUseItems(norm.usos_no_permitidos);
    const articles = listText(norm.articulos);

    return `
      <h3>Usos y normativa</h3>
      <p class="note">${escapeHtml(norm.resumen || normativeMatrix.nota || "Matriz normativa pendiente de cargar.")}</p>
      <div class="meta-grid" style="margin-top: 8px;">
        ${metric("Usos permitidos", permitted.length ? `${permitted.length} actividad(es)` : "Pendiente")}
        ${metric("Permitidos con condicion", conditional.length ? `${conditional.length} actividad(es)` : "Sin dato")}
        ${metric("No permitidos", prohibited.length ? `${prohibited.length} actividad(es)` : "Pendiente")}
        ${metric("Articulos", articles || "Pendiente")}
      </div>
      ${renderUseDetails("Usos permitidos", permitted, true)}
      ${renderUseDetails("Permitidos con condicion", conditional, false)}
      ${renderUseDetails("Usos no permitidos", prohibited, false)}
      ${norm.observaciones ? `<p class="note">${escapeHtml(norm.observaciones)}</p>` : ""}
    `;
  }

  function renderUseDetails(title, items, open) {
    if (!items.length) return "";
    return `
      <details class="use-details" ${open ? "open" : ""}>
        <summary>${escapeHtml(title)} (${items.length})</summary>
        <ul class="use-list">
          ${items.map((item) => `<li>${escapeHtml(formatUseItem(item))}</li>`).join("")}
        </ul>
      </details>
    `;
  }

  function renderRestrictionsBlock(groups) {
    const total = groups.reduce((sum, item) => sum + item.features.length, 0);
    if (!total) {
      return `
        <section class="report-block">
          <h2>Restricciones y afectaciones espaciales</h2>
          <p class="note">No se encontraron intersecciones en las capas de restricciones consultadas.</p>
        </section>
      `;
    }
    return renderLayerBlock("Restricciones y afectaciones espaciales", groups, "");
  }

  function renderLayerBlock(title, groups, emptyText) {
    const nonEmpty = groups.filter((item) => item.features.length);
    if (!nonEmpty.length) {
      if (!emptyText) return "";
      return `
        <section class="report-block">
          <h2>${escapeHtml(title)}</h2>
          <p class="note">${escapeHtml(emptyText)}</p>
        </section>
      `;
    }

    const items = nonEmpty.map((group) => {
      const features = group.features.map((feature, index) => `
        <div class="result-item">
          <p class="result-title">
            <span>${escapeHtml(group.title)}</span>
            <small>${group.category ? escapeHtml(group.category) : `#${index + 1}`}</small>
          </p>
          ${renderAttributes(feature.attributes, group.fields)}
          ${group.queryDistance ? `<p class="note">Consulta por proximidad: ${group.queryDistance} m.</p>` : ""}
        </div>
      `).join("");
      return features;
    }).join("");

    return `
      <section class="report-block">
        <h2>${escapeHtml(title)}</h2>
        ${items}
      </section>
    `;
  }

  function renderErrors(errors) {
    if (!errors.length) return "";
    const items = errors.map((item) => `
      <div class="result-item">
        <p class="result-title"><span>${escapeHtml(item.title)}</span><small>Error</small></p>
        <p class="note">${escapeHtml(item.message)}</p>
      </div>
    `).join("");
    return `
      <section class="report-block">
        <h2>Capas sin respuesta</h2>
        ${items}
      </section>
    `;
  }

  function renderAttributes(attrs, preferredFields = []) {
    const rows = getAttributeRows(attrs, preferredFields);
    if (!rows.length) return `<p class="note">Sin atributos descriptivos.</p>`;
    return `
      <dl class="attribute-list">
        ${rows.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}
      </dl>
    `;
  }

  function getAttributeRows(attrs, preferredFields = []) {
    const rows = [];
    const used = new Set();
    const candidates = preferredFields.length ? preferredFields : Object.keys(attrs);
    candidates.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(attrs, field)) return;
      const value = cleanValue(attrs[field], field);
      if (value === "") return;
      rows.push([labelFor(field), value]);
      used.add(field);
    });

    if (!rows.length) {
      Object.entries(attrs).forEach(([field, raw]) => {
        if (used.has(field) || isSystemField(field)) return;
        const value = cleanValue(raw, field);
        if (value !== "") rows.push([labelFor(field), value]);
      });
    }
    return rows.slice(0, 12);
  }

  function getNormativeEntry(attrs) {
    const zones = normativeMatrix.zonas || {};
    const aliases = normativeMatrix.aliases || {};
    const keys = [attrs.ETIQUETA, attrs.TRANSECTO].filter(Boolean);
    for (const key of keys) {
      if (zones[key]) return zones[key];
      if (aliases[key] && zones[aliases[key]]) return zones[aliases[key]];
      const normalized = normalizeKey(key);
      const aliasKey = Object.keys(aliases).find((item) => normalizeKey(item) === normalized);
      if (aliasKey && zones[aliases[aliasKey]]) return zones[aliases[aliasKey]];
      const foundKey = Object.keys(zones).find((item) => normalizeKey(item) === normalized);
      if (foundKey) return zones[foundKey];
      const codeMatch = String(key).match(/\b(R[1-4]|T[3-6]|ZE[1-4])\b/i);
      if (codeMatch && zones[codeMatch[1].toUpperCase()]) return zones[codeMatch[1].toUpperCase()];
    }

    return {
      resumen: normativeMatrix.nota || "Matriz normativa pendiente de cargar.",
      usos_permitidos: [],
      usos_condicionados: [],
      usos_no_permitidos: [],
      articulos: [],
      observaciones: ""
    };
  }

  function metric(label, value) {
    return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? "Sin dato")}</strong></div>`;
  }

  function parameterMetric(field, attrs) {
    const value = cleanValue(attrs[field.name], field.name);
    if (value === "") return "";
    return metric(labelFor(field.name), field.unit ? `${value} ${field.unit}` : value);
  }

  function setStatus(title, text, mode = "ready") {
    dom.statusTitle.textContent = title;
    dom.statusText.textContent = text;
    dom.statusBox.classList.toggle("warning", mode === "warning");
    dom.statusBox.classList.toggle("error", mode === "error");
  }

  function setBusy(isBusy, text = "Consultando capas...") {
    dom.busyOverlay.hidden = !isBusy;
    dom.busyText.textContent = text;
  }

  function cleanValue(raw, field) {
    if (raw === null || raw === undefined || raw === "") return "";
    if (typeof raw === "number") return formatNumber(raw);
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      return valueCodes[trimmed] || trimmed;
    }
    if (raw instanceof Date) return formatDate(raw);
    return String(raw);
  }

  function formatWithUnit(raw, unit) {
    const value = cleanValue(raw);
    return value === "" ? "Sin dato" : `${value} ${unit}`;
  }

  function labelFor(field) {
    return config.fieldLabels[field] || field.replaceAll("_", " ");
  }

  function isSystemField(field) {
    return /^(OBJECTID|FID|OID_|Shape|Shape__|GlobalID|layer|path|icon|timestamp|begin_|end_|drawOrder|visibility|altitude)/i.test(field);
  }

  function listText(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item) => typeof item === "string" ? item : formatUseItem(item)).join("; ");
  }

  function getUseItems(items) {
    return Array.isArray(items) ? items : [];
  }

  function formatUseItem(item) {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return "";

    const code = item.codigo ? `${item.codigo} ` : "";
    const activity = item.actividad || "Actividad sin nombre";
    const conditions = [];
    if (item.area_m2) conditions.push(`area: ${item.area_m2}`);
    if (item.vialidad && item.vialidad !== "-") conditions.push(`vialidad: ${item.vialidad}`);
    if (item.condicion_adicional && item.condicion_adicional !== "-") conditions.push(item.condicion_adicional);
    if (item.condicion_aeropuerto && item.condicion_aeropuerto !== "-") conditions.push(`aeropuerto: ${item.condicion_aeropuerto}`);
    return `${code}${activity}${conditions.length ? ` (${conditions.join("; ")})` : ""}`;
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return String(value);
    const maximumFractionDigits = Math.abs(value) >= 100 ? 2 : 6;
    return new Intl.NumberFormat("es-CR", { maximumFractionDigits }).format(value);
  }

  function formatCoord(value) {
    if (!Number.isFinite(value)) return "Sin dato";
    return new Intl.NumberFormat("es-CR", {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    }).format(value);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-CR", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getErrorMessage(error) {
    if (!error) return "Error desconocido";
    return error.message || error.details?.messages?.join("; ") || String(error);
  }

  function addZoneToPdf(doc, report, y, margin, pageWidth, pageHeight) {
    const zoneAttrs = report.zone[0]?.features?.[0]?.attributes;
    y = addSectionTitle(doc, "Zona / transecto", y, margin, pageHeight);
    if (!zoneAttrs) return addNote(doc, y, "No se encontro interseccion con la capa Transectos (zonas).", margin, pageHeight);

    const norm = getNormativeEntry(zoneAttrs);
    y = addTable(doc, y, ["Dato", "Valor"], [
      ["Etiqueta", zoneAttrs.ETIQUETA || "Sin dato"],
      ["Transecto", zoneAttrs.TRANSECTO || "Sin dato"],
      ["Area", formatWithUnit(zoneAttrs.AREA_HA, "ha")]
    ], margin, pageWidth);

    const parameterRows = [];
    config.parameterSections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = cleanValue(zoneAttrs[field.name], field.name);
        if (value !== "") parameterRows.push([section.title, labelFor(field.name), field.unit ? `${value} ${field.unit}` : value]);
      });
    });
    y = addTable(doc, y, ["Grupo", "Parametro", "Valor"], parameterRows, margin, pageWidth);

    y = addSectionTitle(doc, "Usos y normativa", y, margin, pageHeight);
    y = addTable(doc, y, ["Categoria", "Detalle"], [
      ["Resumen", norm.resumen || normativeMatrix.nota || "Pendiente"],
      ["Usos permitidos", `${getUseItems(norm.usos_permitidos).length} actividad(es)`],
      ["Permitidos con condicion", `${getUseItems(norm.usos_condicionados).length} actividad(es)`],
      ["Usos no permitidos", `${getUseItems(norm.usos_no_permitidos).length} actividad(es)`],
      ["Articulos", listText(norm.articulos) || "Pendiente"],
      ["Observaciones", norm.observaciones || ""]
    ], margin, pageWidth);

    y = addUseTableToPdf(doc, "Usos permitidos", getUseItems(norm.usos_permitidos), y, margin, pageWidth, pageHeight);
    y = addUseTableToPdf(doc, "Permitidos con condicion", getUseItems(norm.usos_condicionados), y, margin, pageWidth, pageHeight);
    y = addUseTableToPdf(doc, "Usos no permitidos", getUseItems(norm.usos_no_permitidos), y, margin, pageWidth, pageHeight);

    return y;
  }

  function addUseTableToPdf(doc, title, items, y, margin, pageWidth, pageHeight) {
    if (!items.length) return y;
    y = addSectionTitle(doc, title, y, margin, pageHeight);
    const rows = items.map((item) => [
      item.codigo || "",
      item.actividad || "",
      item.categoria || "",
      [item.area_m2 ? `Area: ${item.area_m2}` : "", item.vialidad ? `Vialidad: ${item.vialidad}` : "", item.condicion_adicional || "", item.condicion_aeropuerto ? `Aeropuerto: ${item.condicion_aeropuerto}` : ""]
        .filter(Boolean)
        .join("\n")
    ]);
    return addTable(doc, y, ["Codigo", "Actividad", "Categoria", "Condiciones"], rows, margin, pageWidth);
  }

  function addLayerGroupToPdf(doc, title, groups, y, margin, pageWidth, pageHeight) {
    const nonEmpty = groups.filter((item) => item.features.length);
    y = addSectionTitle(doc, title, y, margin, pageHeight);
    if (!nonEmpty.length) return addNote(doc, y, "Sin resultados.", margin, pageHeight);

    const rows = [];
    nonEmpty.forEach((group) => {
      group.features.forEach((feature) => {
        const detail = getAttributeRows(feature.attributes, group.fields)
          .map(([label, value]) => `${label}: ${value}`)
          .join("\n");
        rows.push([group.category || "", group.title, detail || "Sin atributos descriptivos"]);
      });
    });

    return addTable(doc, y, ["Categoria", "Capa", "Detalle"], rows, margin, pageWidth);
  }

  function addSectionTitle(doc, title, y, margin, pageHeight) {
    y = ensurePage(doc, y, pageHeight, margin, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    return y + 5;
  }

  function addTable(doc, y, head, body, margin, pageWidth) {
    if (!body.length) return y;
    doc.autoTable({
      startY: y,
      head: [head],
      body,
      theme: "grid",
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "top"
      },
      headStyles: {
        fillColor: [0, 127, 120],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [247, 247, 242]
      }
    });
    return doc.lastAutoTable.finalY + 6;
  }

  function addNote(doc, y, text, margin, pageHeight) {
    y = ensurePage(doc, y, pageHeight, margin, 12);
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, margin, y);
    return y + lines.length * 4 + 4;
  }

  function ensurePage(doc, y, pageHeight, margin, reserve = 0) {
    if (y + reserve <= pageHeight - margin) return y;
    doc.addPage();
    return margin;
  }
})();
