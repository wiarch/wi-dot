# WI Dot

**Gestión y sincronización cifrada de dotfiles y entornos Linux.**

WI Dot permite respaldar y restaurar archivos de configuración de Linux entre entornos. El cliente CLI cifra los archivos localmente antes de enviarlos al servidor, mientras que el backend almacena los blobs cifrados y administra entornos, versiones e historial.

El proyecto combina una API Laravel, un cliente de línea de comandos en TypeScript y un dashboard web en React.

> **Estado del proyecto:** prototipo funcional en evolución. La API y el CLI contienen flujos reales de configuración, subida y restauración. El dashboard React utiliza actualmente datos simulados y todavía no está conectado al API para mostrar información real.

## Funcionalidades implementadas

- Gestión de entornos asociados a una cuenta.
- API protegida mediante Laravel Sanctum.
- CLI con comandos `init`, `push` y `pull`.
- Cifrado local AES-256-GCM con claves derivadas mediante PBKDF2-SHA256 (600.000 iteraciones).
- El servidor almacena payloads cifrados sin recibir la passphrase ni el contenido en claro.
- Verificación de integridad del payload cifrado mediante SHA-256.
- Detección de cambios mediante hash del contenido calculado en el cliente.
- Historial de versiones cuando un dotfile existente se actualiza.
- Escritura local atómica en el flujo de restauración.
- Dashboard React con explorador de archivos y vista de diferencias usando datos de demostración.

## Componentes

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Backend/API | PHP 8.3+, Laravel 13, Sanctum | Cuentas, entornos, API y almacenamiento cifrado |
| CLI | Node.js, TypeScript | Cifrar, subir, descargar y restaurar dotfiles |
| Criptografía | Node.js Crypto, AES-256-GCM, PBKDF2-SHA256 | Cifrado y verificación local |
| Dashboard | React 19, TypeScript, Vite, Tailwind CSS | Interfaz de exploración y comparación; actualmente usa mocks |

## Arquitectura de seguridad

El cifrado se realiza en el cliente antes de transmitir los archivos:

1. El CLI lee el archivo local.
2. Genera salt e IV aleatorios.
3. Deriva una clave con PBKDF2-SHA256.
4. Cifra el contenido mediante AES-256-GCM.
5. Envía el payload cifrado y hashes al backend.
6. El servidor valida la estructura y la integridad del blob, y lo almacena sin descifrarlo.

El hash del contenido en claro se conserva como metadata para detectar cambios; por tanto, el servidor puede observar rutas, nombres, tamaños aproximados, hashes y actividad de sincronización. **Zero-Knowledge no significa que toda la metadata esté oculta.**

Consulta [docs/SECURITY.md](docs/SECURITY.md) antes de utilizar datos importantes. La restauración desde el servidor necesita todavía controles adicionales de confinamiento de rutas y protección frente a enlaces simbólicos.

## Requisitos

### Backend
- PHP 8.3 o superior.
- Composer.
- Una base de datos soportada por Laravel.
- Node.js y npm para compilar el dashboard.

### CLI
- Node.js 22 o superior recomendado.
- npm.

## Instalación del backend

```bash
git clone https://github.com/wiarch/wi-dot.git
cd wi-dot
composer install
cp .env.example .env
php artisan key:generate
```

Configura la base de datos en `.env` y ejecuta:

```bash
php artisan migrate
npm install
npm run build
php artisan serve
```

El API queda disponible bajo `/api`. Los endpoints requieren autenticación `auth:sanctum` mediante Bearer token.

## Instalación del CLI

```bash
cd cli
npm install
npm run build
npm link
```

Configura el cliente:

```bash
widot init
```

El asistente solicita URL del servidor, UUID del entorno, token API y passphrase criptográfica. La configuración se guarda en `~/.config/widot/config.json` con permisos restrictivos (600). La passphrase se conserva localmente en ese archivo; todavía no se integra con el llavero seguro del sistema operativo.

### Subir archivos

```bash
widot push ~/.config/hypr/
```

### Restaurar archivos

```bash
widot pull
```

Selecciona rutas concretas y revisa su contenido antes de subirlo. No respaldes carpetas completas del usuario sin revisar previamente si contienen claves privadas, tokens, credenciales o archivos sensibles.

**Precaución:** hasta completar el endurecimiento de rutas del cliente, utiliza `pull` únicamente contra un servidor de confianza y conserva una copia de seguridad local de los archivos que puedan ser reemplazados.

## Desarrollo

Backend:

```bash
composer run dev
php artisan test
vendor/bin/pint --test
```

Dashboard:

```bash
npm run dev
npm run build
```

CLI:

```bash
cd cli
npm run dev
npm run typecheck
npm run build
```

## Documentación

- [PRODUCT.md](docs/PRODUCT.md): visión, usuarios y alcance.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): componentes, API y flujo de sincronización.
- [SECURITY.md](docs/SECURITY.md): modelo de amenazas, cifrado y riesgos pendientes.
- [ROADMAP.md](docs/ROADMAP.md): prioridades y fases.
- [CONTRIBUTING.md](CONTRIBUTING.md): guía de contribución.
- [CLAUDE.md](CLAUDE.md): instrucciones para asistentes de programación.
- [PROMPT.md](PROMPT.md): prompt maestro de desarrollo.

## Licencia

La licencia debe quedar definida explícitamente para el producto. Revisa el archivo de licencia del repositorio antes de redistribuir o incorporar WI Dot en otros proyectos.
