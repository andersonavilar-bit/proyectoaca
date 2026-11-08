/* ==========================================================================
   Brasa & Marea — interacciones
   Sin dependencias. Todo degrada sin JavaScript salvo el envío de la reserva.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------- Configuración ------------------------- */
  const CFG = {
    brand: 'Brasa & Marea',
    whatsapp: '573001234567',
    timeZone: 'America/Bogota',
    // Minutos desde medianoche. Cierre después de medianoche = más de 1440.
    hours: {
      0: { open: 11 * 60, close: 23 * 60 },        // Domingo
      1: { open: 11 * 60, close: 23 * 60 },        // Lunes
      2: { open: 11 * 60, close: 23 * 60 },        // Martes
      3: { open: 11 * 60, close: 23 * 60 },        // Miércoles
      4: { open: 11 * 60, close: 23 * 60 },        // Jueves
      5: { open: 11 * 60, close: 23 * 60 },        // Viernes
      6: { open: 11 * 60, close: 23 * 60 }         // Sábado
    },
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    mapEmbed: 'https://www.google.com/maps?q=Cra.%201%20%235-20%2C%20Bocagrande%2C%20Cartagena%2C%20Colombia&output=embed'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------- Fecha y hora en Bogotá ------------------------- */
  function bogotaNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: CFG.timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());

    const values = {};
    parts.forEach((p) => { values[p.type] = p.value; });

    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = days[values.weekday];
    const hour = parseInt(values.hour, 10) % 24;
    const minute = parseInt(values.minute, 10);

    return {
      day: Number.isInteger(day) ? day : new Date().getDay(),
      minutes: hour * 60 + minute
    };
  }

  function todayISO() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: CFG.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }

  function addDaysISO(iso, days) {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function formatTime(minutes) {
    const m = ((minutes % 1440) + 1440) % 1440;
    const h24 = Math.floor(m / 60);
    const mins = m % 60;
    const suffix = h24 >= 12 ? 'p. m.' : 'a. m.';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${String(mins).padStart(2, '0')} ${suffix}`;
  }

  function formatDateLong(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /* ------------------------- Estado abierto / cerrado ------------------------- */
  function getStatus() {
    const now = bogotaNow();
    const today = CFG.hours[now.day];

    if (now.minutes >= today.open && now.minutes < today.close) {
      return { open: true, close: today.close };
    }

    // Servicio de ayer que cruza la medianoche (viernes y sábado).
    const previousDay = (now.day + 6) % 7;
    const previous = CFG.hours[previousDay];
    if (previous.close > 1440 && now.minutes < previous.close - 1440) {
      return { open: true, close: previous.close };
    }

    if (now.minutes < today.open) {
      return { open: false, next: today.open, dayOffset: 0 };
    }

    for (let i = 1; i <= 7; i += 1) {
      const day = (now.day + i) % 7;
      return { open: false, next: CFG.hours[day].open, dayOffset: i };
    }

    return { open: false, next: today.open, dayOffset: 1 };
  }

  function paintStatus() {
    const status = getStatus();
    const nodes = $$('[data-status]');
    if (!nodes.length) return;

    let text;
    if (status.open) {
      text = `Abierto ahora · hasta las ${formatTime(status.close)}`;
    } else if (status.dayOffset === 0) {
      text = `Cerrado · abre hoy a las ${formatTime(status.next)}`;
    } else if (status.dayOffset === 1) {
      text = `Cerrado · abre mañana a las ${formatTime(status.next)}`;
    } else {
      const day = CFG.dayNames[(bogotaNow().day + status.dayOffset) % 7];
      text = `Cerrado · abre el ${day} a las ${formatTime(status.next)}`;
    }

    nodes.forEach((node) => {
      node.classList.toggle('status--open', status.open);
      node.classList.toggle('status--closed', !status.open);
      const label = $('.status__text', node);
      if (label) label.textContent = text;
    });
  }

  /* ------------------------- Header al hacer scroll ------------------------- */
  const header = $('#siteHeader');
  let scrollTicking = false;

  function onScroll() {
    if (!header || header.hasAttribute('data-static') || scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-stuck', window.scrollY > 40);
      scrollTicking = false;
    });
  }

  /* ------------------------- Navegación móvil ------------------------- */
  const nav = $('#siteNav');
  const navToggle = $('#navToggle');
  const navBackdrop = $('#navBackdrop');
  const main = $('#contenido');
  const footer = $('.footer');
  let backdropTimer = null;

  function openNav() {
    if (!nav || !navToggle || !navBackdrop) return;
    clearTimeout(backdropTimer);
    nav.classList.add('is-open');
    navBackdrop.hidden = false;
    requestAnimationFrame(() => navBackdrop.classList.add('is-visible'));
    document.body.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
    if (main) main.inert = true;
    if (footer) footer.inert = true;
    const firstLink = $('a', nav);
    if (firstLink) setTimeout(() => firstLink.focus(), 60);
  }

  function closeNav() {
    if (!nav || !navToggle || !navBackdrop) return;
    nav.classList.remove('is-open');
    navBackdrop.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    if (main) main.inert = false;
    if (footer) footer.inert = false;
    clearTimeout(backdropTimer);
    backdropTimer = setTimeout(() => { navBackdrop.hidden = true; }, 320);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) closeNav();
      else openNav();
    });
  }
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  if (nav) {
    $$('a', nav).forEach((link) => link.addEventListener('click', closeNav));
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      closeNav();
      if (navToggle) navToggle.focus();
    }
  });
  const desktopQuery = window.matchMedia('(min-width: 980px)');
  const onDesktop = (event) => { if (event.matches) closeNav(); };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onDesktop);
  else if (desktopQuery.addListener) desktopQuery.addListener(onDesktop);

  /* ------------------------- Filtros de la carta ------------------------- */
  const menuTabs = $$('.menu-tab');
  const menuGroups = $$('.menu-group');

  menuTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      menuTabs.forEach((other) => {
        const active = other === tab;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      menuGroups.forEach((group) => {
        group.hidden = filter !== 'all' && group.getAttribute('data-group') !== filter;
      });
    });
  });

  /* ------------------------- Formulario de reserva ------------------------- */
  const form = $('#reserveForm');

  if (form) {
    const nameInput = $('#res-name');
    const phoneInput = $('#res-phone');
    const guestsInput = $('#res-guests');
    const dateInput = $('#res-date');
    const timeInput = $('#res-time');
    const occasionInput = $('#res-occasion');
    const notesInput = $('#res-notes');
    const statusBox = $('#formStatus');

    const minDate = todayISO();
    dateInput.min = minDate;
    dateInput.max = addDaysISO(minDate, 90);

    const now = bogotaNow();
    const todayHours = CFG.hours[now.day];
    const lastSeatingToday = todayHours.close - 60;
    const initialDate = now.minutes > lastSeatingToday - 30 ? addDaysISO(minDate, 1) : minDate;
    dateInput.value = initialDate;

    function buildSlots(iso) {
      if (!timeInput) return;
      const previous = timeInput.value;
      const day = new Date(iso + 'T12:00:00').getDay();
      const schedule = CFG.hours[day];
      const last = schedule.close - 60;
      const isToday = iso === minDate;
      const current = bogotaNow();

      timeInput.innerHTML = '<option value="">Elige</option>';

      for (let minutes = schedule.open; minutes <= last; minutes += 30) {
        const option = document.createElement('option');
        option.value = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
        option.textContent = formatTime(minutes);
        if (isToday && current.minutes > minutes - 45) option.disabled = true;
        timeInput.appendChild(option);
      }

      if (previous && $$('option', timeInput).some((o) => o.value === previous && !o.disabled)) {
        timeInput.value = previous;
      }
    }

    buildSlots(initialDate);
    dateInput.addEventListener('change', () => {
      if (!dateInput.value) return;
      buildSlots(dateInput.value);
      clearError('date');
      clearError('time');
    });

    function setError(key, message) {
      const input = form.querySelector('[name="' + key + '"]');
      const error = document.getElementById('err-' + key);
      if (input) input.setAttribute('aria-invalid', 'true');
      if (error) {
        error.textContent = message;
        error.classList.add('is-visible');
      }
      return input;
    }

    function clearError(key) {
      const input = form.querySelector('[name="' + key + '"]');
      const error = document.getElementById('err-' + key);
      if (input) input.removeAttribute('aria-invalid');
      if (error) {
        error.textContent = '';
        error.classList.remove('is-visible');
      }
    }

    function validate() {
      const errors = [];
      ['name', 'phone', 'guests', 'date', 'time'].forEach(clearError);
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const guests = guestsInput.value;
      const date = dateInput.value;
      const time = timeInput.value;

      if (name.length < 2) {
        setError('name', 'Escribe tu nombre y apellido.');
        errors.push({ key: 'name', input: nameInput });
      }
      if (phone.replace(/\D/g, '').length < 7 || !/^[0-9+()\s-]{7,}$/.test(phone)) {
        setError('phone', 'Escribe un número de WhatsApp válido.');
        errors.push({ key: 'phone', input: phoneInput });
      }
      if (!guests) {
        setError('guests', 'Indica cuántas personas vienen.');
        errors.push({ key: 'guests', input: guestsInput });
      }
      if (!date || date < minDate) {
        setError('date', 'Elige una fecha a partir de hoy.');
        errors.push({ key: 'date', input: dateInput });
      }
      if (!time) {
        setError('time', 'Elige una hora para tu mesa.');
        errors.push({ key: 'time', input: timeInput });
      }

      return errors;
    }

    ['name', 'phone', 'guests', 'date', 'time'].forEach((key) => {
      const input = form.querySelector('[name="' + key + '"]');
      if (!input) return;
      const handler = () => clearError(key);
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!statusBox) return;

      const errors = validate();
      if (errors.length) {
        statusBox.className = 'form-status is-error';
        statusBox.textContent = 'Revisa los campos marcados para continuar.';
        if (errors[0].input) errors[0].input.focus();
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const guests = guestsInput.value;
      const date = dateInput.value;
      const time = timeInput.value;
      const occasion = occasionInput ? occasionInput.value : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      const lines = [
        `Hola, quiero reservar en ${CFG.brand}.`,
        `Nombre: ${name}`,
        `WhatsApp: ${phone}`,
        `Fecha: ${formatDateLong(date)}`,
        `Hora: ${formatTime(parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10))}`,
        `Personas: ${guests}`
      ];
      if (occasion) lines.push(`Ocasión: ${occasion}`);
      if (notes) lines.push(`Notas: ${notes}`);

      const url = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;

      statusBox.className = 'form-status is-ok';
      statusBox.textContent = 'Listo. Abrimos WhatsApp con tu solicitud. ';
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener';
      fallback.textContent = 'Si no se abrió, toca aquí.';
      fallback.style.color = 'inherit';
      fallback.style.textDecoration = 'underline';
      statusBox.appendChild(fallback);

      window.open(url, '_blank', 'noopener');
    });
  }

  /* ------------------------- Mapa diferido ------------------------- */
  const mapButton = $('[data-map]');
  if (mapButton) {
    mapButton.addEventListener('click', () => {
      const container = $('#map');
      if (!container) return;

      const iframe = document.createElement('iframe');
      iframe.src = CFG.mapEmbed;
      iframe.title = 'Mapa de Brasa & Marea, Cra. 1 #5-20, Bocagrande, Cartagena';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;

      container.innerHTML = '';
      container.appendChild(iframe);
    });
  }

  /* ------------------------- Galería / lightbox ------------------------- */
  const galleryItems = $$('.gallery__item');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');
  let galleryIndex = 0;

  function showSlide(index) {
    if (!galleryItems.length || !lightboxImg) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const trigger = galleryItems[galleryIndex];
    const thumb = $('img', trigger);

    lightboxImg.src = trigger.getAttribute('data-full') || (thumb ? thumb.src : '');
    lightboxImg.alt = thumb ? thumb.alt : '';
    if (lightboxCaption) {
      lightboxCaption.textContent = trigger.getAttribute('data-caption') || '';
    }

    if (lightbox && typeof lightbox.showModal === 'function' && !lightbox.open) {
      lightbox.showModal();
    }
  }

  if (lightbox) {
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => showSlide(index));
    });

    const closeBtn = $('[data-lightbox-close]', lightbox);
    const prevBtn = $('[data-lightbox-prev]', lightbox);
    const nextBtn = $('[data-lightbox-next]', lightbox);

    if (closeBtn) closeBtn.addEventListener('click', () => lightbox.close());
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(galleryIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(galleryIndex + 1));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(galleryIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(galleryIndex + 1);
      }
    });
  }

  /* ------------------------- Animaciones de entrada ------------------------- */
  const reveals = $$('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('reveal-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------- Año del footer ------------------------- */
  const year = new Date().getFullYear();
  $$('[data-year]').forEach((node) => { node.textContent = String(year); });

  /* ------------------------- Arranque ------------------------- */
  paintStatus();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mantiene el estado abierto/cerrado al día sin recargar.
  setInterval(paintStatus, 60 * 1000);
})();
