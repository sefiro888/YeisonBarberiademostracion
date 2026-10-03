# Yeison Barber Shop · demostración

Web de demostración para **Yeison Barber Shop**, barbería en Av. Marqués de Figueroa, 15 (Fene, A Coruña).

**Ver la web:** https://sefiro888.github.io/YeisonBarberiademostracion/

- Se abre en **Negro** (como la fachada) y el botón «Estilo» cambia a **Crema** (también `?tema=crema`).
- Letrero de neón OPEN/CLOSED y cuenta atrás según el horario real.
- Carta con «Arma tu cita», test «Encuentra tu corte», 39 trabajos reales, reels y 75 reseñas de Booksy.

## Desarrollo

- Las páginas se escriben en `src/pages/` y se generan con `node scripts/build.mjs`.
- Servidor local: `node scripts/serve.mjs 5181`.
- Capturas de revisión: `node scripts/shots.cjs <carpeta>` (requiere Playwright).

Fotos y textos: Booksy e Instagram del negocio. Desplazamiento suave: [Lenis](https://github.com/darkroomengineering/lenis) (MIT).
