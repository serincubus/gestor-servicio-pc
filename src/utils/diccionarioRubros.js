// src/utils/diccionarioRubros.js

const diccionarioRubros = {
    tecnico_pc: {
        tituloGrilla: "Equipos en el Taller",
        labelElemento: "Equipo / Dispositivo",
        placeholderElemento: "Ej: Notebook Asus i7 o Consola PS5",
        labelFalla: "Falla Reportada o Servicio",
        stockColumnaComponente: "Nombre del Componente",
        stockColumnaCategoria: "Categoría de Hardware",
        cardStockTitulo: "Catálogo de Repuestos",
        cardStockDesc: "Controlar stock físico de hardware, memorias, pantallas, componentes y precios de venta.",

        // 🏷️ Estados del ticket
        // - label: lo visible
        // - color: clase CSS del badge
        // - tipo:  "inicial" | "proceso" | "exito" | "cierre"
        estados: {
            Ingresado:     { label: "Ingresado",              color: "gris",     tipo: "inicial" },
            Diagnostico:   { label: "En diagnóstico",         color: "amarillo", tipo: "proceso" },
            Reparacion:    { label: "En reparación",          color: "naranja",  tipo: "proceso" },
            Listo:         { label: "Listo para entregar",    color: "verde",    tipo: "exito"   },
            Entregado:     { label: "Entregado",              color: "azul",     tipo: "exito"   },

            // 🔴 Cierres alternativos
            Cancelado:     { label: "Cancelado por el cliente", color: "rojo",    tipo: "cierre" },
            Rechazado:     { label: "Reparación rechazada",     color: "rojo",    tipo: "cierre" },
            SinReparacion: { label: "No tiene reparación",      color: "rojo",    tipo: "cierre" },
            Garantia:      { label: "Devuelto por garantía",    color: "violeta", tipo: "cierre" }
        },

        camposTicket: {
            equipo:     "Equipo (marca/modelo)",
            falla:      "Falla reportada",
            accesorios: "Accesorios entregados"
        },

        drawer: {
            tituloDetalle: "Detalle del equipo",
            sinAsignar:    "Sin técnico asignado"
        }
    },

    electricista: {
        tituloGrilla: "Obras y Servicios Activos",
        labelElemento: "Ubicación / Propiedad",
        placeholderElemento: "Ej: Residencia Calle Mitre 1420",
        labelFalla: "Trabajo / Diagnóstico Eléctrico",
        stockColumnaComponente: "Material / Insumo",
        stockColumnaCategoria: "Tipo de Material",
        cardStockTitulo: "Inventario de Materiales",
        cardStockDesc: "Gestionar stock de cables, térmicas, disyuntores, cajas de pase y costos de insumos de obra.",

        estados: {
            Ingresado:     { label: "Relevamiento inicial",     color: "gris",     tipo: "inicial" },
            Diagnostico:   { label: "Presupuestando",           color: "amarillo", tipo: "proceso" },
            Reparacion:    { label: "Instalación en curso",     color: "naranja",  tipo: "proceso" },
            Listo:         { label: "Trabajo finalizado",       color: "verde",    tipo: "exito"   },
            Entregado:     { label: "Conformado por cliente",   color: "azul",     tipo: "exito"   },

            Cancelado:     { label: "Obra cancelada",           color: "rojo",     tipo: "cierre"  },
            Rechazado:     { label: "Presupuesto no aprobado",  color: "rojo",     tipo: "cierre"  },
            SinReparacion: { label: "Sin solución técnica",     color: "rojo",     tipo: "cierre"  },
            Garantia:      { label: "Revisita por garantía",    color: "violeta",  tipo: "cierre"  }
        },

        camposTicket: {
            equipo:     "Domicilio / Tablero",
            falla:      "Descripción del trabajo",
            accesorios: "Materiales entregados"
        },

        drawer: {
            tituloDetalle: "Detalle del servicio",
            sinAsignar:    "Sin electricista asignado"
        }
    },

    seguridad_monitoreo: {
        tituloGrilla: "Instalaciones y Proyectos",
        labelElemento: "Establecimiento / Cliente",
        placeholderElemento: "Ej: Fábrica Textil Norte",
        labelFalla: "Requerimiento Técnico / Distribución",
        stockColumnaComponente: "Equipo de Seguridad",
        stockColumnaCategoria: "Línea de Producto",
        cardStockTitulo: "Pañol de Equipos",
        cardStockDesc: "Administrar stock de cámaras domo, grabadoras DVR/NVR, sensores de alarmas y cableados UTP.",

        estados: {
            Ingresado:     { label: "Sitio relevado",           color: "gris",     tipo: "inicial" },
            Diagnostico:   { label: "Diseño de instalación",    color: "amarillo", tipo: "proceso" },
            Reparacion:    { label: "Instalación en curso",     color: "naranja",  tipo: "proceso" },
            Listo:         { label: "Sistema operativo",        color: "verde",    tipo: "exito"   },
            Entregado:     { label: "Cliente capacitado",       color: "azul",     tipo: "exito"   },

            Cancelado:     { label: "Proyecto cancelado",       color: "rojo",     tipo: "cierre"  },
            Rechazado:     { label: "Instalación no aprobada",  color: "rojo",     tipo: "cierre"  },
            SinReparacion: { label: "Sitio no apto",            color: "rojo",     tipo: "cierre"  },
            Garantia:      { label: "Revisita técnica",         color: "violeta",  tipo: "cierre"  }
        },

        camposTicket: {
            equipo:     "Sitio / Dirección",
            falla:      "Requerimiento del cliente",
            accesorios: "Equipos entregados"
        },

        drawer: {
            tituloDetalle: "Detalle de la instalación",
            sinAsignar:    "Sin instalador asignado"
        }
    }
};

module.exports = diccionarioRubros;