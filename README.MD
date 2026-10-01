# 🚀 Sistema SaaS de Gestión para Servicios Técnicos Multi-Rubro

Una solución web Fullstack bajo el modelo **SaaS (Software as a Service) Multi-Tenant (Multi-Inquilino)**. La plataforma está diseñada para que cualquier taller o comercio de soporte técnico (informática, mecánica, electrodomésticos, etc.) pueda registrarse, aislar sus datos de forma segura y parametrizar la interfaz dinámicamente según sus necesidades de negocio.

🚀 **Link del proyecto en producción:** [¡Mirá el SaaS en vivo acá!](https://gestor-servicio-pc.onrender.com/users/login)

---

## 🛠️ Tecnologías Utilizadas

El proyecto implementa una arquitectura moderna, escalable y optimizada con Inteligencia Artificial para acelerar el desarrollo backend y la consistencia de datos:

- **Backend:** Node.js & Express.js (Arquitectura modular con Middlewares dedicados al aislamiento y seguridad de inquilinatos).
- **Frontend:** EJS (Embedded JavaScript templates) para el renderizado condicional dinámico en el servidor y CSS3 personalizado para la tematización de la interfaz.
- **Base de Datos:** MySQL (Diseño relacional multi-tenant gestionado localmente con MySQL Workbench).
- **Cloud & DevOps:** Persistencia de datos en **Clever Cloud** (MySQL distribuido) e infraestructura cloud en **Render.com** con automatización de Despliegue Continuo (CI/CD).
- **Control de Versiones:** Git & GitHub.

---

## 🌟 Características Avanzadas (Arquitectura SaaS)

- **Arquitectura Multi-Tenant (Shared Schema):** Utiliza una estructura centralizada basada en una entidad principal llamada `Comercio`. Los datos de todos los clientes y órdenes conviven de forma eficiente pero estrictamente aislados mediante identificadores únicos de inquilinato.
- **Aislamiento de Datos Seguro (Row-Level Isolation):** Implementación de Middlewares en Express que interceptan cada petición HTTP, verifican el estado de la sesión (`req.session`) y restringen las consultas SQL para evitar fugas de información (*Data Leakage*) entre distintos comercios.
- **Interfaz Paramétrica y Dinámica:** Renderizado condicional mediante plantillas EJS que adaptan las etiquetas, tablas y formularios según el rubro del comercio logueado (ej: campos específicos para informática vs. mecánica automotriz).
- **Panel de Control Administrativo (Control Panel):** Módulo CRUD independiente para la creación, monitoreo y gestión de nuevos comercios e inquilinos en la plataforma.
- **Autenticación Robusta:** Registro y login de usuarios administradores por comercio con hashing seguro de contraseñas mediante **Bcrypt**.

---

## 🚀 Instalación y Configuración Local

Si querés clonar este proyecto y ejecutarlo en tu entorno local, seguí estos pasos:

1. **Cloná el repositorio:**
   ```bash
   git clone https://github.com/serincubus/gestor-servicio-pc.git
   cd gestor-servicio-pc
   ```

2. **Instalá las dependencias:**
   ```bash
   npm install
   ```

3. **Configurá las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto para proteger las credenciales críticas de infraestructura:
   ```env
   PORT=3000
   DB_HOST=tu_host_de_mysql
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nombre_base_datos
   ```

4. **Iniciá la aplicación:**
   ```bash
   npm start
   ```
   Luego, abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 👨‍💻 Autor
- **GitHub:** [@serincubus](https://github.com/serincubus)
