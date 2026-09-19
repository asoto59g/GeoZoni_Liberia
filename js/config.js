window.APP_CONFIG = {
  appName: "Consulta POT Liberia 2026",
  portalUrl: "https://muniliberia.maps.arcgis.com",
  webMapId: "54adf7aa2c3f4225b4ef130496efb87c",
  defaultView: {
    center: [-85.45, 10.64],
    zoom: 11
  },
  report: {
    title: "Informe de consulta territorial",
    subtitle: "Pre-propuesta POT Liberia 2026",
    organization: "Municipalidad de Liberia",
    disclaimer: "Informe referencial generado a partir de capas publicas. No sustituye certificado oficial de uso de suelo ni criterio municipal."
  },
  links: {
    experience: "https://experience.arcgis.com/experience/d05df32829884eea9ed2c56486678e07",
    sharepoint: "https://mliberia-my.sharepoint.com/personal/zamoraar_muniliberia_go_cr/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fzamoraar%5Fmuniliberia%5Fgo%5Fcr%2FDocuments%2FPREPROPUESTA%2F01%5FRESUMEN%20POT&viewid=dfa47762%2Dc416%2D44c4%2D935a%2D975daef7316c&ga=1"
  },
  fieldLabels: {
    OBJECTID: "Objeto",
    AREA_HA: "Area (ha)",
    AREA_M: "Area (m2)",
    AREA_KM: "Area (km2)",
    TRANSECTO: "Transecto",
    ETIQUETA: "Etiqueta",
    ID: "ID",
    largo_manzana: "Largo maximo de manzana",
    ancho_manzana: "Ancho maximo de manzana",
    area_lote_min: "Area minima de lote",
    frente_lote_min: "Frente minimo de lote",
    cobertura_base: "Cobertura base",
    cobertura_incentivos: "Cobertura con incentivos",
    area_verde: "Area verde",
    altura_base: "Altura base",
    altura_incentivable: "Altura incentivable",
    altura_maxima: "Altura maxima",
    retiro_frontal: "Retiro frontal",
    retiro_lateral: "Retiro lateral",
    retiro_lateral_4pisos: "Retiro lateral 4 pisos",
    retiro_lateral_8pisos: "Retiro lateral 8 pisos",
    retiro_posterior: "Retiro posterior",
    retiros_ruta_nacional: "Retiro ruta nacional",
    estacionamiento_subterraneo: "Estacionamiento subterraneo",
    estacionamiento_fuera_lote: "Estacionamiento fuera del lote",
    estacionamiento_posterior: "Estacionamiento posterior",
    estacionamiento_posterior_patio: "Estacionamiento en patio posterior",
    estacionamiento_frontal: "Estacionamiento frontal",
    adosamiento_selectivo: "Adosamiento selectivo",
    retiro_parques_publicos: "Retiro a parques publicos",
    "retiro_vias_travesía": "Retiro a vias de travesia",
    Identificador: "Identificador catastral",
    Duplicado: "Duplicado",
    Horizontal: "Horizontal",
    Finca: "Finca",
    Plano: "Plano",
    Bloque: "Bloque",
    Predio: "Predio",
    Expediente: "Expediente",
    codigo: "Codigo",
    nombre: "Nombre",
    nom_objeto: "Objeto",
    nombre_asp: "Area silvestre protegida",
    cat_manejo: "Categoria de manejo",
    estatus: "Estatus",
    siglas_cat: "Siglas categoria",
    nombre_ac: "Area de conservacion",
    nombre_cb: "Corredor biologico",
    regmplan: "Regimen de manejo",
    DISTRITO: "Distrito",
    DESCRIPCIO: "Descripcion",
    DESCRIP: "Descripcion",
    PENDIENTE: "Pendiente",
    PENDIENTE_: "Rango de pendiente",
    IFA_VOLCAN: "IFA volcan",
    AERODROMO: "Aerodromo",
    Dato: "Dato",
    NOM_CONCES: "Concesion",
    CATASTRO: "Catastro",
    NOMBRE_FUE: "Fuente",
    NUMERO_POZ: "Numero pozo",
    NUMERO_TOM: "Numero toma",
    TIPO_FUENT: "Tipo de fuente",
    ESTADO_EXP: "Estado expediente",
    RAZON_SOCI: "Razon social",
    Sitio: "Sitio",
    Clave: "Clave",
    Region: "Region",
    Canton_ORI: "Canton",
    Tipo_Sitio: "Tipo de sitio",
    ETIQUETA_RESTRICCION: "Etiqueta"
  },
  parameterSections: [
    {
      title: "Dimensionamiento",
      fields: [
        { name: "largo_manzana", unit: "m" },
        { name: "ancho_manzana", unit: "m" },
        { name: "area_lote_min", unit: "m2" },
        { name: "frente_lote_min", unit: "m" }
      ]
    },
    {
      title: "Cobertura y altura",
      fields: [
        { name: "cobertura_base", unit: "%" },
        { name: "cobertura_incentivos", unit: "%" },
        { name: "area_verde", unit: "%" },
        { name: "altura_base", unit: "pisos" },
        { name: "altura_incentivable", unit: "pisos" },
        { name: "altura_maxima", unit: "pisos" }
      ]
    },
    {
      title: "Retiros",
      fields: [
        { name: "retiro_frontal", unit: "m" },
        { name: "retiro_lateral", unit: "m" },
        { name: "retiro_lateral_4pisos", unit: "m" },
        { name: "retiro_lateral_8pisos", unit: "m" },
        { name: "retiro_posterior", unit: "m" },
        { name: "retiros_ruta_nacional", unit: "m" },
        { name: "retiro_parques_publicos", unit: "m" },
        { name: "retiro_vias_travesía", unit: "m" }
      ]
    },
    {
      title: "Estacionamiento y adosamiento",
      fields: [
        { name: "estacionamiento_subterraneo" },
        { name: "estacionamiento_fuera_lote" },
        { name: "estacionamiento_posterior" },
        { name: "estacionamiento_posterior_patio" },
        { name: "estacionamiento_frontal" },
        { name: "adosamiento_selectivo" }
      ]
    }
  ],
  layers: {
    zoning: {
      role: "zoning",
      title: "Transectos (zonas)",
      url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/transectos_capa_unida_crtm05/FeatureServer/0",
      max: 4,
      fields: [
        "ETIQUETA",
        "TRANSECTO",
        "AREA_HA",
        "AREA_KM",
        "largo_manzana",
        "ancho_manzana",
        "area_lote_min",
        "frente_lote_min",
        "cobertura_base",
        "cobertura_incentivos",
        "area_verde",
        "altura_base",
        "altura_incentivable",
        "altura_maxima",
        "retiro_frontal",
        "retiro_lateral",
        "retiro_lateral_4pisos",
        "retiro_lateral_8pisos",
        "retiro_posterior",
        "retiros_ruta_nacional",
        "estacionamiento_subterraneo",
        "estacionamiento_fuera_lote",
        "estacionamiento_posterior",
        "estacionamiento_posterior_patio",
        "estacionamiento_frontal",
        "adosamiento_selectivo",
        "retiro_parques_publicos",
        "retiro_vias_travesía"
      ]
    },
    cadastre: {
      role: "cadastre",
      title: "Mapa Catastral Liberia",
      url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/MAPA_LIBERIA/FeatureServer/0",
      max: 5,
      fields: ["Identificador", "Finca", "Plano", "Predio", "Bloque", "Expediente", "Shape__Area"]
    },
    roads: {
      role: "roads",
      title: "Propuestas de vialidad POT 2026",
      url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/propuestas_vialidad_liberia_abril_2026/FeatureServer/0",
      queryDistance: 30,
      max: 8,
      fields: ["Name", "nombre", "tipo", "categoria", "descripcio", "Shape__Length"]
    },
    restrictions: [
      {
        title: "ABRE",
        category: "Areas protegidas",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/10",
        max: 5,
        fields: ["codigo", "nombre_asp", "cat_manejo", "estatus", "siglas_cat", "nombre_ac"]
      },
      {
        title: "Concesiones Papagayo",
        category: "Administracion especial",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/11",
        max: 5,
        fields: ["NOM_CONCES", "CATASTRO", "AREA_KM"]
      },
      {
        title: "Corredores biologicos",
        category: "Ambiente",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/31",
        max: 5,
        fields: ["codigo", "nombre_cb", "regmplan", "area_ha", "area_km2"]
      },
      {
        title: "Humedales Liberia",
        category: "Ambiente",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/16",
        max: 5,
        fields: ["nom_hum", "tipo_hum", "clase_hum", "nombre_ac", "regmplan", "area_ha"]
      },
      {
        title: "Bosque Liberia",
        category: "Ambiente",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/19",
        max: 5,
        fields: ["coduso", "catuso", "nombre"]
      },
      {
        title: "AP cuerpos de agua",
        category: "Proteccion hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/15",
        max: 5,
        fields: ["origen", "nombre", "nom_objeto", "codigo", "Area_km2"]
      },
      {
        title: "AP rios y quebradas urbanos",
        category: "Proteccion hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/17",
        max: 5,
        fields: ["nom_objeto", "origen", "codigo", "nombre", "orden", "Area_km"]
      },
      {
        title: "AP rios y quebradas rurales",
        category: "Proteccion hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/18",
        max: 5,
        fields: ["nom_objeto", "origen", "codigo", "nombre", "AREA_KM2"]
      },
      {
        title: "AP nacientes",
        category: "Proteccion hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/20",
        max: 5,
        fields: ["NOMBRE_FUE", "NUMERO_TOM", "TIPO_FUENT", "ESTADO_EXP", "DISTRITO"]
      },
      {
        title: "AP pozos",
        category: "Proteccion hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/21",
        max: 5,
        fields: ["NOMBRE_FUE", "NUMERO_POZ", "TIPO_FUENT", "ESTADO_EXP", "DISTRITO"]
      },
      {
        title: "AP sitios arqueologicos",
        category: "Patrimonio",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/24",
        max: 5,
        fields: ["Id_Sitio", "Sitio", "Clave", "Region", "Canton_ORI", "Tipo_Sitio", "ETIQUETA"]
      },
      {
        title: "Sitios arqueologicos cercanos",
        category: "Patrimonio",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/1",
        queryDistance: 100,
        max: 5,
        fields: ["Id_Sitio", "Sitio", "Clave", "Region", "Canton_ORI", "Tipo_Sitio", "ETIQUETA"]
      },
      {
        title: "Pendientes mayores 50",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/22",
        max: 5,
        fields: ["PENDIENTE", "PENDIENTE_", "DESCRIPCIO", "DISTRITO", "AREA_KM"]
      },
      {
        title: "Areas susceptibles a deslizamiento",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/25",
        max: 5,
        fields: ["PENDIENTE", "PENDIENTE_", "DESCRIPCIO", "TRANSECTO", "DISTRITO", "AREA_KM2"]
      },
      {
        title: "Areas potenciales de inundacion",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/26",
        max: 5,
        fields: ["Name", "FolderPath", "Snippet", "PopupInfo"]
      },
      {
        title: "Amenaza volcanica",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/30",
        max: 5,
        fields: ["CODIGO", "UNIDADES_G", "EDAD", "DESCRIPCIO", "DISTRITO", "IFA_VOLCAN", "DESCRIP"]
      },
      {
        title: "AP lahares",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/23",
        max: 5,
        fields: ["Id", "BUFF_DIST", "AREA_KM2"]
      },
      {
        title: "AP fallas cuaternario",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/13",
        max: 5,
        fields: ["ENTITY", "LEVEL_", "LAYER", "REFNAME", "AREA_KM2"]
      },
      {
        title: "Fallas cuaternario cercanas",
        category: "Riesgo",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/8",
        queryDistance: 50,
        max: 5,
        fields: ["ENTITY", "LEVEL_", "LAYER", "REFNAME"]
      },
      {
        title: "Area proyecto PAACUME",
        category: "Proyectos",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/27",
        max: 5,
        fields: ["id", "AREA_KM"]
      },
      {
        title: "Influencia directa PAACUME",
        category: "Proyectos",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/28",
        max: 5,
        fields: ["id", "Area_km"]
      },
      {
        title: "Influencia indirecta PAACUME",
        category: "Proyectos",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/29",
        max: 5,
        fields: ["id", "Area_km"]
      },
      {
        title: "Area influencia aeropuerto",
        category: "Infraestructura",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/6",
        queryDistance: 30,
        max: 5,
        fields: ["AERODROMO", "Dato", "Layer", "DocName"]
      },
      {
        title: "AP linea transmision electrica",
        category: "Infraestructura",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/12",
        max: 5,
        fields: ["origen", "codigo", "nom_objeto", "AREA_KM"]
      },
      {
        title: "Lineas transmision cercanas",
        category: "Infraestructura",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/7",
        queryDistance: 50,
        max: 5,
        fields: ["Voltaje", "Circuito", "SHAPE_STLe"]
      },
      {
        title: "Canal PAACUME cercano",
        category: "Infraestructura",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/5",
        queryDistance: 30,
        max: 5,
        fields: ["id", "area", "Shape__Length"]
      },
      {
        title: "Cuerpos de agua",
        category: "Referencia hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/14",
        max: 5,
        fields: ["origen", "nombre", "nom_objeto", "codigo", "area", "perimetro"]
      },
      {
        title: "Hidrografia cercana",
        category: "Referencia hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/4",
        queryDistance: 30,
        max: 5,
        fields: ["nom_objeto", "origen", "codigo", "nombre", "orden", "longitud"]
      },
      {
        title: "Nacientes cercanas",
        category: "Referencia hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/3",
        queryDistance: 100,
        max: 5,
        fields: ["NOMBRE_FUE", "NUMERO_TOM", "TIPO_FUENT", "ESTADO_EXP", "DISTRITO"]
      },
      {
        title: "Pozos cercanos",
        category: "Referencia hidrica",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/2",
        queryDistance: 100,
        max: 5,
        fields: ["NOMBRE_FUE", "NUMERO_POZ", "TIPO_FUENT", "ESTADO_EXP", "DISTRITO"]
      },
      {
        title: "Radios de accion",
        category: "Referencia",
        url: "https://services3.arcgis.com/KXJIq8AdiF19Wu1s/arcgis/rest/services/Mapa_WFL1/FeatureServer/34",
        queryDistance: 30,
        max: 5,
        fields: ["Name", "descriptio"]
      }
    ]
  }
};
