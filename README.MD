# 💻 Gestor de Servicio Técnico de PC

Una aplicación web Fullstack diseñada para la gestión, control y seguimiento de órdenes de servicio en talleres de soporte técnico de computadoras. Permite administrar clientes, equipos ingresados, diagnósticos y estados de reparación de forma centralizada y eficiente.

🚀 **Link del proyecto en producción:** [¡Mirá la app en vivo acá!](https://gestor-servicio-pc.onrender.com/users/login)

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue desarrollado utilizando un stack moderno, escalable y optimizado con Inteligencia Artificial para acelerar el proceso de desarrollo:

- **Backend:** Node.js & Express.js (Arquitectura robusta para el manejo de rutas y lógica de negocio).
- **Frontend:** EJS (Embedded JavaScript templates) para el renderizado dinámico en el servidor y CSS3 personalizado para la interfaz de usuario.
- **Base de Datos:** MySQL (Diseño relacional gestionado localmente con MySQL Workbench).
- **Cloud & DevOps:** Despliegue de base de datos en la nube mediante **Clever Cloud** e infraestructura de aplicación en **Render.com** con integración de despliegue continuo (CI/CD).
- **Control de Versiones:** Git & GitHub.

---

## 🌟 Características Principales (Features)

- **Gestión de Órdenes:** Ingreso, actualización y seguimiento del estado de reparación de las PCs (ej: Pendiente, En Diagnóstico, Reparado, Entregado).
- **Control de Clientes y Equipos:** Registro detallado de los datos de contacto del cliente y especificaciones del equipo (Marca, modelo, componentes, falla reportada).
- **Arquitectura en la Nube:** Persistencia de datos segura en Clever Cloud, garantizando alta disponibilidad.
- **Desarrollo Agilizado con IA:** Implementación de mejores prácticas de código, refactorización y optimización de consultas SQL asistido por Inteligencia Artificial.

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
   Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de MySQL (local o Clever Cloud):
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
