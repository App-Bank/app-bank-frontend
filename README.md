# 🏦 AURA NEO-BANKING — Frontend

Aplicación web bancaria moderna (**Single Page Application**) desarrollada con JavaScript Vanilla (ES6+), HTML5 semántico y CSS3 con diseño *mobile-first* adaptable a escritorio. Diseñada con una estética oscura (*dark theme*), efectos aurora y componentes modulares.

---

## 🚀 Características Principales

* **Autenticación Segura (JWT)**: Login con validación, almacenamiento seguro de sesión (`sessionStorage`) y redirección automática con protección de rutas.
* **Dashboard / Vista Principal**:
  * Visualización de balance disponible con formato dinámico de decimales.
  * Ocultación y revelación segura del IBAN con botón de acción.
  * Métricas del mes (Ingresos, Gastos y Posición Global).
  * Lista de últimos movimientos registrados.
* **Transferencias Bancarias**:
  * Búsqueda y validación automática del IBAN destino en tiempo real con distintivo visual.
  * Autocompletado del nombre del titular destinatario mediante API.
  * Atajos de importes rápidos (+20 €, +50 €, +100 €).
  * Control y validación de saldo suficiente y prevención de transferencias a la propia cuenta.
  * Resumen de confirmación previo al envío con casilla de verificación obligatoria.
  * Pantalla de confirmación con diseño en tarjetas (importe destacado a 58px e IBAN completo sin recortes).
* **Historial de Movimientos**:
  * Buscador en tiempo real (por concepto, título o cuenta) con retardo (*debounce*).
  * Filtros interactivos por periodo (**Todos, Diario, Semanal, Mensual**) y por tipo (**Ingresos, Gastos**).
  * Agrupación automática por fechas (*Hoy*, *Ayer*, o fecha completa).
  * Modal detallado de transacción con importe, titular/IBAN, concepto, estado y fecha/hora formateada.
* **Diseño Responsivo Completo**: Optimizado para dispositivos móviles y adaptado dinámicamente a pantallas de escritorio (rejilla de 2 columnas en confirmación y transferencias).
* **Seguridad Reforzada**: Política de seguridad de contenido (**Content Security Policy - CSP**), prevención de inyección XSS con helper de escape global (`escapeHtml`) y cierre de sesión automático ante tokens expirados (HTTP 401).

---

## 🛠️ Tecnologías Utilizadas

* **HTML5**: Estructura semántica, accesibilidad ARIA y metadatos de seguridad.
* **CSS3**: Variables CSS (Design Tokens), Flexbox, CSS Grid, filtros de desenfoque (*backdrop-filter*), soporte para modo oscuro (`color-scheme: dark`) y corrección de *autofill* de navegadores Chromium.
* **JavaScript (Vanilla ES6+)**: Arquitectura modular orientada a vistas y servicios sin dependencias de frameworks externos.
* **Axios (v1.20.0)**: Cliente HTTP para comunicación asíncrona con el backend e interceptores de peticiones y respuestas.

---

## 📂 Estructura del Proyecto

```text
app-bank-frontend/
├── index.html                     # Punto de entrada HTML y definición del contenedor SPA
├── package.json                   # Configuración del proyecto y scripts
├── public/
│   └── favicon.png                # Icono de la aplicación
├── css/
│   ├── main.css                   # Hoja de estilos principal que importa los módulos
│   ├── styles.css                 # Variables globales de color, tipografía y resets
│   ├── bottom-nav.css             # Estilos de la barra de navegación inferior
│   ├── login.css / login-desktop.css        # Estilos móviles y de escritorio para Login
│   ├── home.css / home-desktop.css          # Estilos móviles y de escritorio para Dashboard
│   ├── transfer.css / transfer-desktop.css  # Estilos móviles y de escritorio para Transferencias y Confirmación
│   └── history.css / history-desktop.css    # Estilos móviles y de escritorio para Historial
└── js/
    ├── main.js                    # Cargador maestro de módulos scripts
    ├── app.js                     # Estado global (AppState), helpers de formato y arranque
    ├── router.js                  # Enrutador cliente SPA con títulos dinámicos y control de sesión
    ├── components/
    │   └── bottomNav.js           # Componente reutilizable de navegación inferior
    ├── controllers/
    │   └── loginController.js     # Controlador del formulario de autenticación
    ├── services/
    │   ├── api.js                 # Cliente API HTTP (Axios) y métodos contra el backend
    │   └── transactionService.js  # Normalización, caché y agrupación de transacciones
    ├── views/
    │   ├── loginView.js           # Vista de inicio de sesión
    │   ├── homeView.js            # Vista del dashboard del cliente
    │   ├── transferView.js        # Vista del formulario de transferencia
    │   ├── confirView.js          # Vista de confirmación de transferencia enviada
    │   └── historyView.js         # Vista de historial y búsqueda de transacciones
    └── vendor/
        └── axios.min.js           # Librería Axios embebida
```

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
* Tener en ejecución el backend en `http://127.0.0.1:8000`.

### 1. Clonar el repositorio
```bash
git clone https://github.com/App-Bank/app-bank-frontend.git
cd app-bank-frontend
```

### 2. Iniciar el servidor local de desarrollo
Puedes arrancarlo directamente usando el script configurado en `package.json`:
```bash
npm start
```
*(Utiliza `npx serve .` para servir los ficheros estáticos de forma local).*

Alternativamente, puedes abrir `index.html` con cualquier servidor estático (como la extensión **Live Server** de VS Code) o con Python:
```bash
python -m http.server 3000
```

La aplicación estará disponible en: **`http://localhost:3000`** (o el puerto asignado por `serve`).

---

## 🔑 Cuentas de Prueba Disponibles

El backend incluye datos de prueba precargados para iniciar sesión:

| Usuario | Email | Contraseña | IBAN Asociado | Saldo Inicial |
| :--- | :--- | :--- | :--- | :--- |
| **User Uno** | `user1@banco.com` | `test1234` | `ES9121000418450200051332` | 1.000,00 € |
| **User Dos** | `user2@banco.com` | `test1234` | `ES9121000418450200051333` | 500,00 € |

---

## 🔗 Rutas del Enrutador SPA

* `#/login` — Pantalla de inicio de sesión.
* `#/dashboard` — Vista principal con resumen de cuentas y métricas.
* `#/transfer` — Formulario de emisión de transferencias.
* `#/confirm` — Pantalla de confirmación y resumen del estado de la transferencia.
* `#/history` — Histórico de movimientos con buscador y filtros avanzados.
