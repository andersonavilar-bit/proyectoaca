# Brasa & Marea — sitio web del restaurante

Sitio **one-page estático** (HTML + CSS + JavaScript, sin build ni dependencias) para un restaurante de parrilla, mariscos y cocina del Caribe. Está pensado para convertir visitas en reservas y pedidos, cargar rápido en móvil y posicionar en búsquedas locales.

> ⚠️ **Contenido de demostración.** El nombre, la dirección, el teléfono, los horarios y las reseñas son ficticios y sirven de estructura. Reemplázalos por los datos reales antes de publicar (ver checklist abajo). No publiques reseñas inventadas.

---

## 1. Cómo verlo

Abre `index.html` con doble clic. Funciona sin servidor porque todas las rutas son relativas.

Para una experiencia más cercana a producción, usa un servidor local:

```powershell
# Si tienes Python
python -m http.server 8080

# Si tienes Node
npx serve .
```

Luego visita `http://localhost:8080`.

---

## 2. Estructura

```
sitio web/
├── index.html          Página principal (todo el contenido)
├── privacidad.html     Política de privacidad
├── styles.css          Todos los estilos (mobile-first)
├── script.js           Interacciones y configuración de horarios/WhatsApp
├── favicon.svg         Icono
├── robots.txt          Instrucciones para buscadores
├── sitemap.xml         Mapa del sitio
└── assets/
    └── img/            Fotos optimizadas en WebP (600 px y 1000 px)
```

**Secciones de la página:** hero con estado abierto/cerrado → franja de confianza → 4 platos destacados → carta completa con filtros → historia + misión y visión → galería con lightbox → reseñas → reservas con formulario y mapa → domicilio → FAQ → footer.

---

## 3. Personalización obligatoria

Busca y reemplaza estos valores en **todos los archivos** (incluye `index.html`, `script.js`, `privacidad.html`, `sitemap.xml`, `robots.txt`):

| Dato | Valor actual (demo) | Dónde |
|---|---|---|
| Nombre | `Brasa & Marea` / `Brasa &amp; Marea` | HTML, JSON-LD, JS |
| Dominio | `https://www.brasaymarea.com` | canonical, OG, sitemap, robots |
| Teléfono visible | `+57 300 123 4567` | HTML (`tel:+573001234567`) |
| WhatsApp | `573001234567` | enlaces `wa.me/...` y `CFG.whatsapp` en `script.js` |
| Correo | `reservas@brasaymarea.com` | HTML y privacidad |
| Dirección | `Cra. 1 #5-20, Bocagrande, Cartagena` | HTML, JSON-LD, mapa |
| Coordenadas | `10.3997, -75.5551` | JSON-LD (`geo`) |
| Redes | `instagram.com/brasaymarea`, etc. | HTML y JSON-LD |
| Precios y platos | carta de ejemplo | `index.html` |
| Reseñas | 3 reseñas ficticias | sección `#resenas` |

### Horarios (importante: están en dos sitios)

1. `script.js` → objeto `CFG.hours` (minutos desde medianoche; cierre después de medianoche = más de 1440).
2. `index.html` → tabla de horarios, footer y JSON-LD (`openingHoursSpecification`).

Actualiza ambos o el estado «Abierto ahora» no coincidirá con lo que ve el cliente. La zona horaria está fijada en `America/Bogota`.

### Cambiar el número de WhatsApp

- Enlaces: busca `573001234567` en `index.html`.
- Mensajes automáticos: `CFG.whatsapp` en `script.js`.
- Formato: código de país + número, sin `+`, sin espacios ni guiones.

---

## 4. Fotos

Las imágenes actuales son de **Unsplash** (licencia libre para uso comercial, sin atribución obligatoria; verifica los términos vigentes). Son fotos de stock: **reemplázalas por fotos reales del restaurante** para que la web transmita confianza.

| Archivo | Uso | Foto original |
|---|---|---|
| `hero-1400.webp` / `hero-800.webp` | Portada | Unsplash `photo-1555939594-58d7cb561ad1` |
| `terraza-*` | Galería | `photo-1559339352-11d035aa65de` |
| `comedor-*` | Galería | `photo-1517248135467-4c7edcad34c4` |
| `barra-*` | Galería | `photo-1514933651103-005eec06c04b` |
| `mesa-*` | Galería | `photo-1414235077428-338989a2e8c0` |
| `chef-*` | Historia y galería | `photo-1577106263724-2c8e03bfe9cf` |
| `plato-punta-*` | Destacado | `photo-1600891964092-4316c288032e` |
| `plato-costillas-*` | Destacado | `photo-1544025162-d76694265947` |
| `plato-paella-*` | Destacado | `photo-1534080564583-6be75777b70a` |
| `plato-cazuela-*` | Destacado | `photo-1559847844-5315695dadae` |
| `postre-*` | Galería | `photo-1551024506-0bccd828d307` |
| `mar-banner-*` | Domicilio | `photo-1534080564583-6be75777b70a` |
| `og-cover.jpg` | Vista previa en redes | Derivada del hero |

### Cómo preparar tus fotos

1. Fotografía con luz natural, platos recién servidos y el local sin clientes identificables (o con autorización).
2. Exporta en **WebP** en dos anchos: 600 px (móvil) y 1000 px (escritorio). Para el hero: 800 px y 1400 px.
3. Calidad 55–70 %. Cada foto de plato debería pesar **menos de 120 KB**.
4. Mantén la misma proporción que el archivo actual (4:3 en platos, 4:5 en el chef, 16:9 en el hero) para no romper el diseño.
5. Actualiza el `alt` de cada imagen con una descripción real.

En Windows puedes usar [Squoosh](https://squoosh.app) (web) o ImageMagick:

```powershell
magick foto.jpg -resize 1000x -quality 62 assets/img/plato-nuevo-1000.webp
```

---

## 5. Cómo funcionan las reservas

El formulario **no necesita servidor**: valida los datos, arma un mensaje y abre WhatsApp con la solicitud lista para enviar. El cliente recibe confirmación manual del restaurante.

Ventajas: cero costo, cero mantenimiento y el canal que más se usa en Colombia.

Limitaciones: no muestra disponibilidad real ni confirma automáticamente.

Si más adelante quieres reservas con disponibilidad en tiempo real, opciones habituales:

- **CoverManager**, **OpenTable**, **SevenRooms** o **Resy** (integración con widget/iframe).
- **Google Reserve** (requiere proveedor asociado y cumplir requisitos).
- **Formspree** o **Netlify Forms** si prefieres recibir la solicitud por correo en lugar de WhatsApp.
- **Calendly** o **Cal.com** para eventos privados con agenda.

El punto de integración está en el evento `submit` de `#reserveForm` dentro de `script.js`.

Los enlaces de Rappi e iFood apuntan a las home pages: cámbialos por las URLs reales del restaurante.

---

## 6. SEO local — checklist

El código ya incluye: `title` y `description` orientados a búsqueda local, Open Graph, datos estructurados `Restaurant` y `FAQPage`, `robots.txt`, `sitemap.xml`, encabezados jerárquicos y textos con intención local («Bocagrande», «Cartagena», «Caribe»).

Lo que falta hacer fuera del código:

- [ ] Crear/verificar el **Perfil de Empresa en Google** con la misma dirección, teléfono y horarios (es el factor nº 1 para «restaurante cerca de mí»).
- [ ] Subir 10–20 fotos reales a Google Business Profile y responder reseñas.
- [ ] Mantener el **NAP** (nombre, dirección, teléfono) idéntico en web, Google, TripAdvisor, Rappi, iFood y redes.
- [ ] Registrar el dominio en **Google Search Console** y enviar `sitemap.xml`.
- [ ] Actualizar `canonical`, `og:url` y `sitemap.xml` con el dominio definitivo.
- [ ] Pedir reseñas a clientes reales (nunca comprarlas ni inventarlas).
- [ ] Publicar contenido local: platos de temporada, eventos, terraza pet friendly.
- [ ] Revisar métricas de **Core Web Vitals** en PageSpeed Insights tras publicar.

Palabras clave objetivo de ejemplo: *restaurante de mariscos en Cartagena*, *parrilla en Bocagrande*, *reservar mesa Cartagena*, *comida típica cartagenera*, *restaurante para grupos Cartagena*.

---

## 7. Rendimiento

Decisiones tomadas para cargar rápido:

- Sin fuentes externas (pila de fuentes del sistema), sin frameworks ni jQuery.
- Imágenes en **WebP** con `srcset` (600/1000 px) y `loading="lazy"` salvo el hero, que va con `preload` y `fetchpriority="high"`.
- El **mapa de Google solo se carga al hacer clic**, evitando cientos de KB de terceros.
- El widget de Instagram no está incrustado (los widgets de Instagram son pesados); en su lugar hay galería propia y enlace al perfil.
- El formulario no hace peticiones de red: abre WhatsApp.
- `content-visibility` no se usa para no romper el scroll nativo; el coste de pintado es bajo.

Peso aproximado de la primera carga: **hero (~233 KB) + HTML/CSS/JS (~80 KB)**, es decir, menos de 350 KB antes de hacer scroll.

Para comprobar: abre DevTools → Lighthouse → móvil. Objetivos: LCP < 2,5 s, CLS < 0,1, INP < 200 ms.

---

## 8. Accesibilidad

- Navegación completa por teclado, `skip-link`, foco visible y menú móvil con `aria-expanded`, bloqueo de scroll y cierre con `Esc`.
- Formulario con `label` asociados, mensajes de error anunciados (`aria-live`) y foco en el primer campo inválido.
- Contraste revisado en textos principales; las etiquetas de la carta no dependen solo del color (llevan texto).
- Animaciones desactivadas con `prefers-reduced-motion`.
- Galería en `<dialog>` nativo (foco atrapado por el navegador).

Pendiente recomendado: probar con lector de pantalla (NVDA/VoiceOver) y añadir textos alternativos definitivos con las fotos reales.

---

## 9. Publicación

Opciones sin costo inicial:

1. **Netlify Drop** — arrastra la carpeta completa a [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Vercel** — `vercel` o importar el repositorio.
3. **GitHub Pages** — subir el contenido a la rama `main` y activar Pages.

Después:

- Conecta el dominio y activa **HTTPS**.
- Actualiza todas las URLs absolutas (`canonical`, OG, sitemap, robots).
- Verifica que `https://tudominio.com/robots.txt` y `/sitemap.xml` respondan.
- Prueba el formulario desde un teléfono real (WhatsApp debe abrir con el mensaje).
- Configura correo `reservas@tudominio.com` o cambia el correo mostrado.

---

## 10. Contenido demo y aspectos legales

- **Reseñas:** las tres de la sección `#resenas` son ficticias. Sustitúyelas por reseñas reales verificables o elimina la sección.
- **Cifras:** «4,8 en Google» y «380 reseñas» son de ejemplo. Ajústalas a la realidad.
- **Misión y visión:** son textos de ejemplo alineados con el concepto del restaurante. Revísalos con el equipo y ajústalos a la estrategia real antes de publicar.
- **Dirección y teléfono:** ficticios.
- **Política de privacidad:** es una base razonable para Colombia (Ley 1581 de 2012), pero conviene que un abogado la revise según el tratamiento real de datos.
- **Fotos:** si usas las de Unsplash, conserva el registro de licencias. Con fotos propias, asegúrate de tener derechos sobre las personas retratadas.
- **Alérgenos:** la carta incluye etiquetas orientativas; la información de alérgenos debe validarse con cocina y, según el país, puede requerir declaración oficial.

---

## 11. Siguientes pasos sugeridos

1. Reemplazar datos, fotos y reseñas por los reales.
2. Probar en móvil: reserva, llamada, WhatsApp, mapa y galería.
3. Crear el Perfil de Empresa en Google y enlazarlo.
4. Publicar y medir con Search Console + analítica ligera (Plausible/Umami) con aviso de cookies si aplica.
5. Si el volumen de reservas crece, migrar el formulario a una plataforma con disponibilidad en tiempo real.
