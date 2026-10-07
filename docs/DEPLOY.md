# Deploy e instalación

## GitHub Pages (automático)

El workflow `.github/workflows/deploy.yml` compila y publica en GitHub Pages en
cada push a `main`.

Pasos la primera vez:

1. Sube el repositorio a GitHub.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Haz push a `main`. El workflow genera `dist/` y lo publica.
4. La app queda en `https://<usuario>.github.io/map-app-foryoudelivery/`.

> Si cambias el nombre del repositorio, actualiza `base` en `vite.config.ts`.

## Instalar en Android (Chrome)

1. Abre la URL de GitHub Pages en Chrome.
2. Menú ⋮ → **Añadir a pantalla de inicio** / **Instalar aplicación**.
3. Se abre a pantalla completa, con su icono, sin barra del navegador.

La PWA debe servirse por **HTTPS** para que Chrome ofrezca la instalación; GitHub
Pages ya lo hace.

## Desarrollo local

```bash
npm install
npm run dev
```

En localhost la PWA también es instalable. Para probar el build de producción con
el `base` correcto:

```bash
npm run build
npm run preview
```

`vite preview` sirve en `http://localhost:4173/map-app-foryoudelivery/`.

## Publicar en Play Store (opcional)

No es necesario para uso personal. Si se quiere distribuir:

1. Empaquetar la URL como **TWA** con [PWABuilder](https://www.pwabuilder.com) o
   `@bubblewrap/cli`.
2. Cuenta de desarrollador de Google (pago único de 25 USD).
3. Subir el `.aab` a Play Console.

La PWA debe estar publicada en HTTPS y configurarse `assetlinks.json` para la
verificación del dominio.
