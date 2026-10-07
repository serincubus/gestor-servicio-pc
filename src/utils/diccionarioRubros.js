// src/utils/diccionarioRubros.js

const diccionarioRubros = {
    tecnico_pc: {
        tituloGrilla: "Equipos en el Taller",
        labelElemento: "Equipo / Dispositivo",
        placeholderElemento: "Ej: Notebook Asus i7 o Consola PS5",
        labelFalla: "Falla Reportada o Servicio",
        labelAccesorios: "Accesorios Entregados",
        labelManoObra: "🛠️ Mano de Obra Taller ($)",
        msgSaldado: "¡Equipo totalmente saldado! No registra deuda.",
        labelPresupuestoCatalogo: "Presupuestar Hardware del Catálogo",
        sinStockMensaje: "No hay repuestos registrados en el catálogo.",
        msgPendiente: "Pago Pendiente: Le resta abonar",
        stockColumnaComponente: "Nombre del Componente",
        stockColumnaCategoria: "Categoría de Hardware",
        cardStockTitulo: "Catálogo de Repuestos",
        cardStockDesc: "Controlar stock físico de hardware, memorias, pantallas, componentes y precios de venta.",
        iconoCategoria: "📦",

        // 🏷️ Estados del ticket
        // - label: lo visible
        // - color: clase CSS del badge
        // - tipo:  "inicial" | "proceso" | "exito" | "cierre"
        estados: {
    Ingresado:     { label: "Ingresado",              color: "gris",     tipo: "inicial", icono: "📥" },
    Diagnostico:   { label: "En diagnóstico",         color: "amarillo", tipo: "proceso", icono: "🔍" },
    Reparacion:    { label: "En reparación",          color: "naranja",  tipo: "proceso", icono: "🛠️" },
    Listo:         { label: "Listo para entregar",    color: "verde",    tipo: "exito",   icono: "✅" },
    Entregado:     { label: "Entregado",              color: "azul",     tipo: "exito",   icono: "📦" },

    Cancelado:     { label: "Cancelado por el cliente", color: "rojo",   tipo: "cierre",  icono: "❌" },
    Rechazado:     { label: "Reparación rechazada",     color: "rojo",   tipo: "cierre",  icono: "🚫" },
    SinReparacion: { label: "No tiene reparación",      color: "rojo",   tipo: "cierre",  icono: "⛔" },
    Garantia:      { label: "Devuelto por garantía",    color: "violeta", tipo: "cierre", icono: "🔁" }
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
        labelAccesorios: "Materiales Entregados",
        labelManoObra: "⚡ Mano de Obra Eléctrica ($)",
        labelPresupuestoCatalogo: "Presupuestar Materiales del Catálogo",
        sinStockMensaje: "No hay materiales registrados en el catálogo.",
        msgSaldado: "¡Obra totalmente saldada! No registra deuda.",
        msgPendiente: "Pago Pendiente de la obra: Le resta abonar",
        stockColumnaComponente: "Material / Insumo",
        stockColumnaCategoria: "Tipo de Material",
        cardStockTitulo: "Inventario de Materiales",
        cardStockDesc: "Gestionar stock de cables, térmicas, disyuntores, cajas de pase y costos de insumos de obra.",
        iconoCategoria: "🔌" ,

        estados: {
            Ingresado:     { label: "Relevamiento inicial",     color: "gris",     tipo: "inicial", icono: "📋"  },
            Diagnostico:   { label: "Presupuestando",           color: "amarillo", tipo: "proceso", icono: "📐" },
            Reparacion:    { label: "Instalación en curso",     color: "naranja",  tipo: "proceso", icono: "⚡" },
            Listo:         { label: "Trabajo finalizado",       color: "verde",    tipo: "exito",  icono: "✅"  },
            Entregado:     { label: "Conformado por cliente",   color: "azul",     tipo: "exito",  icono: "🏠"   },

            Cancelado:     { label: "Obra cancelada",           color: "rojo",     tipo: "cierre", icono: "❌"   },
            Rechazado:     { label: "Presupuesto no aprobado",  color: "rojo",     tipo: "cierre", icono: "🚫"  },
            SinReparacion: { label: "Sin solución técnica",     color: "rojo",     tipo: "cierre", icono: "⛔"   },
            Garantia:      { label: "Revisita por garantía",    color: "violeta",  tipo: "cierre",  icono: "🔁"  }
        },

       drawer: {
            tituloDetalle: "Detalle del servicio",
            sinAsignar:    "Sin electricista asignado"
        }
    },

        electromecanico: {
        tituloGrilla: "Máquinas y Equipos en Servicio",
        labelElemento: "Máquina / Equipo Industrial",
        placeholderElemento: "Ej: Motor trifásico 5HP o Bomba centrífuga",
        labelFalla: "Falla Mecánica / Eléctrica Reportada",
        labelAccesorios: "Piezas y Repuestos Entregados",
        labelManoObra: "⚙️ Mano de Obra Electromecánica ($)",
        labelPresupuestoCatalogo: "Presupuestar Repuestos del Catálogo",
        sinStockMensaje: "No hay repuestos registrados en el catálogo.",
        msgSaldado: "¡Equipo totalmente saldado! No registra deuda.",
        msgPendiente: "Pago Pendiente del servicio: Le resta abonar",
        stockColumnaComponente: "Repuesto / Componente",
        stockColumnaCategoria: "Tipo de Repuesto",
        cardStockTitulo: "Depósito de Repuestos",
        cardStockDesc: "Administrar stock de rulemanes, contactores, correas, bobinados, motores y componentes eléctricos.",
        iconoCategoria: "⚙️",

        // 🏷️ Estados del ticket
        estados: {
            Ingresado:     { label: "Equipo recibido",            color: "gris",     tipo: "inicial", icono: "📥" },
            Diagnostico:   { label: "En diagnóstico técnico",     color: "amarillo", tipo: "proceso", icono: "🔍" },
            Reparacion:    { label: "En reparación / armado",     color: "naranja",  tipo: "proceso", icono: "🔧" },
            Listo:         { label: "Listo para despacho",        color: "verde",    tipo: "exito",   icono: "✅" },
            Entregado:     { label: "Entregado y probado",        color: "azul",     tipo: "exito",   icono: "📦" },

            Cancelado:     { label: "Servicio cancelado",         color: "rojo",     tipo: "cierre",  icono: "❌" },
            Rechazado:     { label: "Presupuesto no aprobado",    color: "rojo",     tipo: "cierre",  icono: "🚫" },
            SinReparacion: { label: "Irreparable / fuera de servicio", color: "rojo", tipo: "cierre", icono: "⛔" },
            Garantia:      { label: "Reingreso por garantía",     color: "violeta",  tipo: "cierre",  icono: "🔁" }
        },

        drawer: {
            tituloDetalle: "Detalle del equipo electromecánico",
            sinAsignar:    "Sin técnico electromecánico asignado"
        }
    },

    seguridad_monitoreo: {
        tituloGrilla: "Instalaciones y Proyectos",
        labelElemento: "Establecimiento / Cliente",
        placeholderElemento: "Ej: Fábrica Textil Norte",
        labelFalla: "Requerimiento Técnico / Distribución",
        labelAccesorios: "Equipos Entregados",
        labelManoObra: "📷 Mano de Obra de Instalación ($)",
        labelPresupuestoCatalogo: "Presupuestar Equipos del Catálogo",
        sinStockMensaje: "No hay equipos registrados en el catálogo.",
        msgSaldado: "¡Instalación totalmente saldada! No registra deuda.",
        msgPendiente: "Pago Pendiente: Le resta abonar",
        stockColumnaComponente: "Equipo de Seguridad",
        stockColumnaCategoria: "Línea de Producto",
        cardStockTitulo: "Pañol de Equipos",
        cardStockDesc: "Administrar stock de cámaras domo, grabadoras DVR/NVR, sensores de alarmas y cableados UTP.",
        iconoCategoria: "🎥",
        


        estados: {
            Ingresado:     { label: "Sitio relevado",           color: "gris",     tipo: "inicial",  icono: "📋" },
            Diagnostico:   { label: "Diseño de instalación",    color: "amarillo", tipo: "proceso" , icono: "📐" },
            Reparacion:    { label: "Instalación en curso",     color: "naranja",  tipo: "proceso", icono: "🛠️" },
            Listo:         { label: "Sistema operativo",        color: "verde",    tipo: "exito" , icono: "✅" },
            Entregado:     { label: "Cliente capacitado",       color: "azul",     tipo: "exito", icono: "🎓"  },

            Cancelado:     { label: "Proyecto cancelado",       color: "rojo",     tipo: "cierre", icono: "❌"  },
            Rechazado:     { label: "Instalación no aprobada",  color: "rojo",     tipo: "cierre",  icono: "🚫" },
            SinReparacion: { label: "Sitio no apto",            color: "rojo",     tipo: "cierre",  icono: "⛔" },
            Garantia:      { label: "Revisita técnica",         color: "violeta",  tipo: "cierre", icono: "🔁"  }
        },

        drawer: {
            tituloDetalle: "Detalle de la instalación",
            sinAsignar:    "Sin instalador asignado"
        }
    }
};

module.exports = diccionarioRubros;