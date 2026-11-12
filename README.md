# VulnShop Lab - versión corregida

Misma app que la versión vulnerable, con las correcciones aplicadas. Proyecto educativo.

| # | Vulnerabilidad original | Corrección |
|---|-------------------------|------------|
| 1-4, 19 | DOM XSS, XSS almacenado/reflejado, favoritos manipulables | Se construye el DOM con `textContent`; sin `innerHTML`. Datos de localStorage validados al leer (clave, longitud, URL de portada) |
| 5 | Open redirect | Se elimina el parámetro `next` |
| 6 | `eval()` | Eliminado |
| 7 | jQuery 1.12.4 obsoleto | jQuery eliminado (no hacía falta) |
| 8, 20 | Recursos externos sin SRI | Sin scripts ni fuentes externas; tipografías del sistema |
| 9 | Contenido mixto HTTP | Contador HTTP eliminado |
| 10 | `target=_blank` sin protección | `rel="noopener noreferrer"` |
| 11 | Credenciales y comentarios sensibles | Eliminados del código, comentarios y `README` |
| 12 | Contraseña por GET | Login sin envío de datos ni parámetros en la URL; `autocomplete` correcto |
| 13 | Control de acceso solo en cliente | `admin.html` eliminado; no se guarda token ni rol |
| 14 | Cookie sin flags | Cookie eliminada (no es necesaria) |
| 15 | Archivos sensibles expuestos | `backup/` eliminado; `robots.txt` neutro |
| 17-18 | Datos de API sin sanitizar / parámetro sin codificar | `textContent`, `clean()` y `encodeURIComponent` |
| 16 | Sin cabeceras de seguridad | CSP y `referrer` vía `<meta>` (sin `unsafe-inline`) |

## Riesgo residual (GitHub Pages)
- No se pueden fijar cabeceras HTTP: faltan `X-Frame-Options`/`frame-ancestors` (el `<meta>` CSP no los admite), `X-Content-Type-Options`, HSTS propio y control de caché.
- CORS `Access-Control-Allow-Origin: *` y cabeceras de tiempo los añade la plataforma.
- La autenticación real requiere un backend; este sitio es 100 % estático.
