// src/utils/diccionarioRubros.js

const diccionarioRubros = {
    tecnico_pc: {
        tituloGrilla: "Equipos en el Taller",
        labelElemento: "Equipo / Dispositivo",
        placeholderElemento: "Ej: Notebook Asus i7 o Consola PS5",
        labelFalla: "Falla Reportada o Servicio",
        stockColumnaComponente: "Nombre del Componente",
        stockColumnaCategoria: "Categoría de Hardware",
        categoriasStock: ["Almacenamiento", "Memorias RAM", "Placas de Video", "Fuentes", "Repuestos Varios"]
    },
    electricista: {
        tituloGrilla: "Obras y Servicios Activos",
        labelElemento: "Ubicación / Propiedad",
        placeholderElemento: "Ej: Residencia Calle Mitre 1420 o Local Comercial",
        labelFalla: "Trabajo / Diagnóstico Eléctrico",
        stockColumnaComponente: "Material / Insumo",
        stockColumnaCategoria: "Tipo de Material",
        categoriasStock: ["Cables y Conductores", "Térmicas y Disyuntores", "Cajas y Canalizaciones", "Iluminación", "Herramientas/Consumibles"]
    },
    seguridad_monitoreo: {
        tituloGrilla: "Instalaciones y Proyectos",
        labelElemento: "Establecimiento / Cliente",
        placeholderElemento: "Ej: Fábrica Textil Norte o Consorcio Alvear",
        labelFalla: "Requerimiento Técnico / Distribución",
        stockColumnaComponente: "Equipo de Seguridad",
        stockColumnaCategoria: "Línea de Producto",
        categoriasStock: ["Cámaras Domo/CCTV", "Grabadores DVR/NVR", "Discos Rígidos Solicitados", "Cableado UTP/Fuentes", "Sensores y Alarmas"]
    }
};

module.exports = diccionarioRubros;
