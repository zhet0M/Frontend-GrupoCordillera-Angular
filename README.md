
# 🏔️ Grupo Cordillera - Frontend

&lt;div align="center"&gt;
  &lt;p&gt;
    &lt;strong&gt;Backend empresarial basado en microservicios para la gestión integral de Grupo Cordillera.&lt;/strong&gt;
  &lt;/p&gt;
  &lt;p&gt;
    &lt;img alt="Java 17" src="https://img.shields.io/badge/Java-17-007396?style=for-the-badge&amp;logo=oracle"&gt;
    &lt;img alt="Spring Boot 4.0.6" src="https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F?style=for-the-badge&amp;logo=spring"&gt;
    &lt;img alt="PostgreSQL 15" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&amp;logo=postgresql"&gt;
    &lt;img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&amp;logo=docker&amp;logoColor=white"&gt;
  &lt;/p&gt;
&lt;/div&gt;

---

## 📋 Descripción

El **Frontend Grupo Cordillera** es la interfaz de usuario de la Plataforma de Monitoreo Ejecutivo del Grupo Cordillera. Esta aplicación Angular proporciona un dashboard interactivo y moderno para el monitoreo y gestión de operaciones empresariales, incluyendo módulos de resumen general, usuarios, ventas, inventario, finanzas, clientes, KPIs y alertas.

La plataforma permite a los usuarios ejecutivos acceder a métricas clave, reportes en tiempo real y herramientas de gestión a través de una interfaz adaptativa y fácil de usar.

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 🔐 **Autenticación Segura** | Sistema de login/registro con guards de ruta y tokens JWT |
| 🎯 **Dashboard Ejecutivo** | Vista centralizada de métricas, KPIs y alertas en tiempo real |
| 📱 **Interfaz Responsiva** | Diseño adaptativo para dispositivos móviles, tabletas y desktop |
| 🎨 **Material Design** | Componentes de Angular Material para una experiencia de usuario consistente |
| 🌙 **Tema Oscuro/Claro** | Cambio de tema dinámico según preferencia del usuario |
| 🔔 **Panel de Notificaciones** | Alertas operativas con badge de no leídas |
| 📊 **KPIs y Reportes** | Gráficas y métricas clave para la toma de decisiones |
| 👥 **Gestión de Usuarios** | Administración de usuarios y roles |
| 🛒 **Módulos Completos** | Ventas, inventario, finanzas, clientes y reportes |

---

## 🛠️ Tecnologías Utilizadas

### Framework y Librerías
- **Angular 21.2.0** 🔴 - Framework principal
- **Angular Material 21.2.10** 🟢 - Componentes UI
- **TypeScript 5.9.2** 🔵 - Lenguaje tipado
- **RxJS 7.8.0** 🟡 - Programación reactiva
- **Prettier 3.8.1** 📝 - Formateador de código

### Testing
- **Vitest 4.0.8** 🧪 - Framework de testing moderno

---

## 📋 Pre-requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) ⬢
- **npm** (viene incluido con Node.js) 📦
- **Angular CLI** (versión 21 o superior) 🔴

Si no tienes el Angular CLI, instálalo globalmente:

```bash
npm install -g @angular/cli
```

---

## 🚀 Instalación

1. Navega al directorio del proyecto:

```bash
cd Frontend-GrupoCordillera-Angular
```

2. Instala las dependencias:

```bash
npm install
```

---

## 🎯 Uso

### 1. Servidor de Desarrollo

Para iniciar el servidor de desarrollo local con hot reload:

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en **http://localhost:4200/**.

### 2. Construcción para Producción

Para compilar la aplicación para producción:

```bash
npm run build
# o
ng build
```

Los archivos compilados se almacenarán en el directorio `dist/`.

---

## 🧪 Testing

### Ejecutar Pruebas Unitarias

Para ejecutar las pruebas con Vitest:

```bash
npm test
# o
ng test
```

### Generar Reporte de Cobertura

Para generar el reporte de cobertura de código:

```bash
npm run test:coverage
```

---

## 📂 Estructura del Proyecto

```
Frontend-GrupoCordillera-Angular/
├── public/                     # Recursos públicos (íconos, favicon)
├── src/
│   ├── app/
│   │   ├── core/               # Servicios core
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── alerts/         # Alertas
│   │   │   ├── clients/        # Clientes
│   │   │   ├── finances/       # Finanzas
│   │   │   ├── inventory/      # Inventario
│   │   │   ├── kpis/           # KPIs
│   │   │   ├── sales/          # Ventas
│   │   │   ├── theme/          # Tema (oscuro/claro)
│   │   │   └── users/          # Usuarios
│   │   ├── pages/              # Componentes de página
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── landing/        # Página de inicio
│   │   │   ├── login/          # Página de login
│   │   │   └── register/       # Página de registro
│   │   ├── app.config.ts       # Configuración de la aplicación
│   │   ├── app.routes.ts       # Rutas de la aplicación
│   │   └── app.ts              # Componente principal
│   ├── styles.css              # Estilos globales
│   └── index.html              # Template principal
├── package.json                # Dependencies y scripts
├── angular.json                # Configuración de Angular
└── README.md                   # Este archivo
```

---

## 🔗 Integración con el Backend

Esta aplicación frontend se conecta con el **API Gateway** del Grupo Cordillera, que actúa como punto de entrada unificado para todos los microservicios backend.

### Microservicios Backend Conectados

| Microservicio | Puerto Local | Descripción |
|---------------|--------------|-------------|
| `api-gateway` | 8080 | Punto de entrada y proxy |
| `authentication` | 8081 | Autenticación y usuarios |
| `ventas` | 8082 | Gestión de ventas |
| `inventario` | 8083 | Control de inventario |
| `finanzas` | 8084 | Control financiero |
| `clientes` | 8085 | Gestión de clientes |
| `kpis` | 8086 | Cálculo de KPIs |
| `alertas` | 8087 | Alertas operativas |
| `reportes` | 8088 | Reportes PDF |

Asegúrate de que los servicios backend estén ejecutándose para una funcionalidad completa.

---

## 👥 Equipo

Proyecto desarrollado por **Matías Medina**.



