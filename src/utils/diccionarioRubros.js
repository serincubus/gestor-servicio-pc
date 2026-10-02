// src/utils/diccionarioRubros.js
// src/utils/diccionarioRubros.js

const diccionarioRubros = {
    tecnico_pc: {
        tituloGrilla: "Equipos en el Taller",
        labelElemento: "Equipo / Dispositivo",
        placeholderElemento: "Ej: Notebook Asus i7 o Consola PS5",
        labelFalla: "Falla Reportada o Servicio",
        stockColumnaComponente: "Nombre del Componente",
        stockColumnaCategoria: "Categoría de Hardware",
        // ➕ TEXTOS DINÁMICOS PARA LA TARJETA DEL HOME:
        cardStockTitulo: "Catálogo de Repuestos",
        cardStockDesc: "Controlar stock físico de hardware, memorias, pantallas, componentes y precios de venta."
    },
    electricista: {
        tituloGrilla: "Obras y Servicios Activos",
        labelElemento: "Ubicación / Propiedad",
        placeholderElemento: "Ej: Residencia Calle Mitre 1420",
        labelFalla: "Trabajo / Diagnóstico Eléctrico",
        stockColumnaComponente: "Material / Insumo",
        stockColumnaCategoria: "Tipo de Material",
        // ➕ TEXTOS DINÁMICOS PARA LA TARJETA DEL HOME:
        cardStockTitulo: "Inventario de Materiales",
        cardStockDesc: "Gestionar stock de cables, térmicas, disyuntores, cajas de pase y costos de insumos de obra."
    },
    seguridad_monitoreo: {
        tituloGrilla: "Instalaciones y Proyectos",
        labelElemento: "Establecimiento / Cliente",
        placeholderElemento: "Ej: Fábrica Textil Norte",
        labelFalla: "Requerimiento Técnico / Distribución",
        stockColumnaComponente: "Equipo de Seguridad",
        stockColumnaCategoria: "Línea de Producto",
        // ➕ TEXTOS DINÁMICOS PARA LA TARJETA DEL HOME:
        cardStockTitulo: "Pañol de Equipos",
        cardStockDesc: "Administrar stock de cámaras domo, grabadoras DVR/NVR, sensores de alarmas y cableados UTP."
    }
};

module.exports = diccionarioRubros;
