
# SHRTN — Shortener Dashboard Frontend (`url-shortener-front-shorter-redirector`)

Este módulo contiene la interfaz web principal del ecosistema SHRTN. Desarrollada como una Single Page Application (SPA) ligera en JavaScript vanilla, HTML5 y Tailwind CSS, esta vista actúa como el **centro de operaciones y panel del usuario**, permitiendo la generación de enlaces acortados y la gestión del catálogo de enlaces personales de manera interactiva.

---

## ⚡ Funcionalidades e Integración de Sesión

El cliente web implementa lógica asíncrona avanzada para comunicarse de forma segura con la arquitectura Serverless:

* **Estrategia Cross-Domain Authentication:** El módulo intercepta los tokens JWT emitidos por el dominio de autenticación (`AUTH_URL`) mediante parámetros URL seguros. Procesa, decodifica y persiste las credenciales en el `localStorage`, eliminando inmediatamente los rastros de la URL (`replaceState`) para mitigar vectores de vulnerabilidad.
* **Consumo de Endpoints Protegidos:** Adjunta de manera mandatoria el token recuperado bajo el esquema de seguridad `Authorization: Bearer <JWT>` en todas las llamadas fetch dirigidas hacia la API de creación (`/shorten`) y analíticas globales (`/stats`).
* **Sincronización de Estado:** Al crear un enlace exitosamente mediante un método HTTP `POST`, la interfaz actualiza de forma reactiva el árbol de componentes (Sidebar de enlaces históricos) consumiendo los nuevos recursos en segundo plano.
* **Gobernanza Inter-módulos:** Facilita la navegación contextual hacia el módulo de reportes (`STATS_FRONTEND_URL`), transfiriendo de forma segura los parámetros de identidad y los códigos de filtrado seleccionados.

---

## 📂 Estructura del Módulo

Organización y distribución de los archivos estáticos y configuraciones de infraestructura local:

```text
C:\CODE PROJECTS\URL-SHORTENER\MODULES\FRONTEND\URL-SHORTENER-FRONT-SHORTER-REDIRECTOR
│   .gitignore
│   README.md                 <-- (Este archivo)
│
├───src                       <-- ARTEFACTOS DEL CLIENTE WEB
│       app.js                <-- Controladores lógicos, consumo de APIs y mutación del DOM
│       index.html            <-- Estructura de la vista principal y layouts
│       package.json          <-- Dependencias de desarrollo / empaquetado del cliente
│       style.css             <-- Estilos y utilidades estéticas (Tailwind / Custom)
│
└───terraform                 <-- CAPA DE DISTRIBUCIÓN EDGE
        main.tf               <-- Creación del Bucket S3, políticas de hosting OAI y CloudFront CDN
        outputs.tf
        providers.tf
        terraform.tfstate
        terraform.tfstate.backup
        variables.tf

```

---

## 🌐 Arquitectura de Despliegue (Estáticos y CDN)

Dado que es un módulo de frontend puro, las recetas de `/terraform` omiten el uso de cómputo Lambda e implementan una arquitectura de distribución de contenido estático (Jamstack) optimizada para la nube:

* **Amazon S3 (Simple Storage Service):** Configurado como un bucket privado para alojar y resguardar en origen los archivos `index.html`, `app.js` y `style.css`.
* **Amazon CloudFront:** Actúa como la red de distribución de contenido (**CDN**) global. Intercepta las solicitudes de los clientes a través de Edge Locations, cachea el contenido del frontend para reducir la latencia al mínimo y restringe el acceso directo a S3 mediante un *Origin Access Control* (OAC) para máxima seguridad.

---

## ⚙️ Punteros de Integración (Constantes de API)

La lógica en `src/app.js` gestiona la interoperabilidad del ecosistema apuntando a los siguientes recursos ya aprovisionados:

| Constante | Propósito | URL de Destino |
| --- | --- | --- |
| `API_BASE_URL` | Gateway central para invocación de Lambdas (`shorten`, `stats`). | `https://jguawzn6ka.execute-api.us-east-1.amazonaws.com` |
| `STATS_FRONTEND_URL` | Endpoint CloudFront correspondiente al módulo web de reportes. | `https://d4mzuntmcbuga.cloudfront.net` |
| `AUTH_URL` | Endpoint CloudFront asignado a la vista de login y registro. | `https://d2ahv6rm0lok1j.cloudfront.net` |

---

## 🚀 Despliegue de la Interfaz

1. **Compilar / Preparar recursos:**
Asegúrate de configurar correctamente las URLs de las APIs en `app.js`. De ser necesario, ejecuta las tareas del paquete web:
```bash
cd src
npm install

```


2. **Aprovisionar la Infraestructura de Red:**
Ingresa a la subcarpeta de Terraform para levantar la arquitectura CloudFront/S3:
```bash
cd ../terraform
terraform init
terraform apply

```


3. **Carga de Archivos (Hosting):**
Una vez creado el bucket por Terraform, sube los archivos de la carpeta `/src` al contenedor S3 generado. Al finalizar, CloudFront expondrá la URL pública del Dashboard lista para ser utilizada en conjunto con el módulo de Autenticación.
