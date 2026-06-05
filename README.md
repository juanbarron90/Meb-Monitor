# MEB Monitor — PWA

Monitor biométrico del Modelo de Equilibrio de Barron.

## Cómo publicar en Vercel (paso a paso)

### Paso 1 — Sube este proyecto a GitHub

1. Ve a github.com e inicia sesión
2. Clic en el botón verde **"New"** (esquina superior izquierda)
3. Nombre del repositorio: `meb-monitor`
4. Déjalo en **Public**
5. Clic en **"Create repository"**
6. En la página siguiente verás un bloque de código. Ignóralo por ahora.
7. Clic en el link **"uploading an existing file"**
8. Arrastra TODOS los archivos y carpetas de este ZIP a la ventana
9. Scroll abajo → clic **"Commit changes"**

### Paso 2 — Crea tu cuenta en Vercel

1. Ve a vercel.com
2. Clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (usa la misma cuenta)
4. Autoriza el acceso

### Paso 3 — Conecta tu repositorio

1. En el dashboard de Vercel, clic **"Add New Project"**
2. Busca `meb-monitor` en la lista
3. Clic **"Import"**
4. En la pantalla de configuración:
   - Framework Preset: **Create React App** (se detecta solo)
   - Deja todo lo demás igual
5. Clic **"Deploy"**
6. Espera ~2 minutos → Vercel te da una URL como `meb-monitor.vercel.app`

### Paso 4 — Instala en tu iPhone

1. Abre **Safari** en tu iPhone (debe ser Safari, no Chrome)
2. Ve a tu URL de Vercel
3. Toca el botón **Compartir** (el cuadrado con flecha hacia arriba)
4. Scroll en el menú → toca **"Añadir a pantalla de inicio"**
5. Ponle el nombre "MEB" → toca **"Añadir"**
6. Aparece el ícono en tu pantalla de inicio como una app normal

## Estructura del proyecto

```
meb-pwa/
├── public/
│   ├── index.html       ← HTML con meta tags PWA para iOS
│   ├── manifest.json    ← Le dice al iPhone cómo instalarse
│   ├── sw.js            ← Service worker (funciona sin internet)
│   └── icons/
│       ├── icon-192.png ← Ícono de la app
│       └── icon-512.png ← Ícono grande
└── src/
    ├── index.js         ← Punto de entrada React
    └── App.js           ← Toda la lógica MEB
```

## Limitaciones de la versión PWA vs app nativa iOS

| Función | PWA (esta versión) | App nativa iOS (futura) |
|---|---|---|
| Check-in por preguntas | ✅ | ✅ |
| Motor de cálculo H | ✅ | ✅ |
| Efecto Suelo guiado | ✅ | ✅ |
| Historial de sesiones | ✅ (solo en sesión) | ✅ (persistente) |
| HRV desde Apple Watch | ❌ | ✅ |
| Notificaciones push | Limitado en iOS | ✅ |
| Funciona sin internet | ✅ (tras primera carga) | ✅ |
