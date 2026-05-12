# Frontend Cordillera

## Descripción del Proyecto

Frontend Cordillera es la interfaz de usuario para la **Plataforma de Monitoreo Ejecutivo del Grupo Cordillera**. Esta aplicación Angular proporciona un dashboard interactivo para el monitoreo y gestión de operaciones empresariales, incluyendo módulos de clientes, finanzas, inventario y ventas.

La plataforma permite a los usuarios ejecutivos acceder a métricas clave, reportes en tiempo real y herramientas de gestión a través de una interfaz moderna y responsiva.

## Características Principales

- **Autenticación y Autorización**: Sistema de login/registro con guards de ruta
- **Dashboard Ejecutivo**: Vista centralizada de métricas y KPIs
- **Interfaz Responsiva**: Diseño adaptativo para dispositivos móviles y desktop
- **Material Design**: Componentes de Angular Material para una experiencia consistente
- **Navegación Segura**: Guards que protegen rutas según el estado de autenticación

## Tecnologías Utilizadas

- **Angular 21**: Framework principal para el desarrollo de la aplicación
- **Angular Material**: Biblioteca de componentes UI
- **TypeScript**: Lenguaje de programación tipado
- **RxJS**: Programación reactiva para manejo de datos asíncronos
- **Vitest**: Framework de testing moderno
- **Prettier**: Formateador de código

## Prerrequisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **Angular CLI** (versión 21 o superior)

```bash
npm install -g @angular/cli
```

## Instalación

1. Clona el repositorio o navega al directorio del proyecto:

```bash
cd frontend-cordillera
```

2. Instala las dependencias:

```bash
npm install
```

## Uso

### Servidor de Desarrollo

Para iniciar el servidor de desarrollo local:

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. Los cambios en el código se reflejarán automáticamente gracias al hot reload.

### Construcción para Producción

Para construir la aplicación para producción:

```bash
npm run build
# o
ng build
```

Los archivos compilados se almacenarán en el directorio `dist/`.

### Testing

Para ejecutar las pruebas unitarias:

```bash
npm test
# o
ng test
```

Las pruebas utilizan Vitest como runner.

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/           # Servicios core (auth, guards, etc.)
│   ├── pages/          # Componentes de páginas principales
│   │   ├── dashboard/  # Dashboard ejecutivo
│   │   ├── landing/    # Página de inicio
│   │   ├── login/      # Página de login
│   │   └── register/   # Página de registro
│   ├── shared/         # Componentes compartidos
│   └── app.routes.ts   # Configuración de rutas
├── assets/             # Recursos estáticos
├── styles.css          # Estilos globales
└── index.html          # Template principal
```

## API Backend

Esta aplicación frontend se conecta con los servicios backend del Grupo Cordillera:

- **API Gateway**: Punto de entrada unificado
- **Authentication Service**: Gestión de autenticación
- **Clientes Service**: Gestión de clientes
- **Finanzas Service**: Gestión financiera
- **Inventario Service**: Control de inventario
- **Ventas Service**: Gestión de ventas

Asegúrate de que los servicios backend estén ejecutándose para una funcionalidad completa.


## Licencia

Este proyecto es propiedad del Grupo Cordillera. Todos los derechos reservados.

```bash
ng e2e
```

