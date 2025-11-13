// transition.js - Solución para el problema de scroll

// Función para precargar la página de destino
function precargarPagina(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      callback(xhr.responseText);
    } else {
      window.location.href = url; // Fallback si hay error
    }
  };
  xhr.onerror = function() {
    window.location.href = url; // Fallback si hay error
  };
  xhr.send();
}

// Función para crear el overlay y contenedor de transición si no existen
function crearElementosTransicion() {
  // Verificar si ya existen
  if (document.querySelector('.overlay-transicion')) {
    return document.querySelector('.overlay-transicion').parentElement;
  }
  
  // Crear contenedor principal
  const container = document.createElement('div');
  container.className = 'transicion-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9997;
    pointer-events: none;
  `;
  
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay-transicion';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
    background-color: rgb(18, 18, 18);
    opacity: 0;
  `;
  
  // Crear contenedor de imagen
  const contenedor = document.createElement('div');
  contenedor.className = 'contenedor-transicion';
  contenedor.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;
  
  // Crear imagen
  const imagen = document.createElement('img');
  imagen.className = 'imagen-transicion';
  imagen.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.1);
  `;
  
  // Si hay una imagen guardada, usarla
  if (sessionStorage.getItem('imagenProyecto')) {
    imagen.src = sessionStorage.getItem('imagenProyecto');
  }
  
  // Ensamblar elementos
  contenedor.appendChild(imagen);
  container.appendChild(overlay);
  container.appendChild(contenedor);
  document.body.appendChild(container);
  
  return container;
}

// Función para animar la entrada a la página de destino
function animarEntradaTransicion() {
  const posicionRect = sessionStorage.getItem('posicionRect');
  const rect = posicionRect ? JSON.parse(posicionRect) : null;
  
  if (!sessionStorage.getItem('transicionActiva') || !rect) return;
  
  // Crear elementos si no existen
  const container = crearElementosTransicion();
  const overlay = container.querySelector('.overlay-transicion');
  const contenedor = container.querySelector('.contenedor-transicion');
  const imagen = container.querySelector('.imagen-transicion');
  
  // Configurar posición inicial basada en la posición guardada
  gsap.set(container, { autoAlpha: 1 });
  gsap.set(overlay, { autoAlpha: 0.8 });
  gsap.set(contenedor, {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    autoAlpha: 1
  });
  gsap.set(imagen, { scale: 1.1 });
  
  // Ocultar el contenido principal hasta que termine la transición
  gsap.set('main', { autoAlpha: 0 });
  
  // Animar la entrada
  const tl = gsap.timeline({
    onComplete: function() {
      // Mostrar el contenido principal
      gsap.to('main', {
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.inOut"
      });
      
      // Eliminar elementos de transición
      setTimeout(() => {
        if (container) container.remove();
      }, 500);
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('transicionActiva');
      sessionStorage.removeItem('imagenProyecto');
      sessionStorage.removeItem('posicionRect');
    }
  });
  
  tl.to(contenedor, {
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
    duration: 0.6,
    ease: "power2.inOut"
  })
  .to(imagen, {
    scale: 1,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.6")
  .to(contenedor, {
    autoAlpha: 0,
    duration: 0.5
  }, "-=0.3")
  .to(overlay, {
    autoAlpha: 0,
    duration: 0.5
  }, "-=0.5");
}

// Función para configurar los enlaces de navegación
function configurarEnlacesNavegacion() {
  // Seleccionar todos los enlaces internos
  const enlaces = document.querySelectorAll('a[href^="./"], a[href^="../"], a[href^="/"], a[href^="p"]');
  
  enlaces.forEach(enlace => {
    // Ignorar enlaces externos o anclas
    const href = enlace.getAttribute('href');
    if (href.startsWith('http') || href.startsWith('#') || href.includes('mailto:')) {
      return;
    }
    
    // No aplicar a los enlaces de proyectos en la página de proyectos
    if (window.location.pathname.includes('proyectos.html') && enlace.closest('.proyecto-link')) {
      return;
    }
    
    enlace.addEventListener('click', function(e) {
      e.preventDefault();
      
      const destino = this.getAttribute('href');
      
      // Animar la salida
      const tl = gsap.timeline({
        onComplete: function() {
          window.location.href = destino;
        }
      });
      
      tl.to('main', {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
    });
  });
}

// Función para limpiar elementos de transición
function limpiarElementosTransicion() {
  // Eliminar contenedor de transición si existe
  const container = document.querySelector('.transicion-container');
  if (container) container.remove();
  
  // Ocultar elementos de proyecto expandido
  const proyectoExpandido = document.querySelector('.proyecto-expandido');
  const overlay = document.querySelector('.overlay');
  
  if (proyectoExpandido) {
    gsap.set(proyectoExpandido, { autoAlpha: 0, visibility: 'hidden' });
  }
  
  if (overlay) {
    gsap.set(overlay, { autoAlpha: 0 });
  }
  
  // Asegurar que el contenido principal sea visible
  gsap.set('main', { autoAlpha: 1 });
  
  // Restaurar el scroll
  document.body.style.overflow = '';
}

// Función para inicializar la página
function inicializarPagina() {
  // Si venimos de una transición normal, animar la entrada
  if (sessionStorage.getItem('transicionActiva')) {
    window.requestAnimationFrame(() => {
      animarEntradaTransicion();
    });
  }
  
  // Configurar enlaces de navegación
  configurarEnlacesNavegacion();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPagina);
} else {
  inicializarPagina();
}

// Escuchar evento pageshow para detectar navegación desde caché
window.addEventListener('pageshow', function(event) {
  // Si la página se carga desde caché (navegación hacia atrás)
  if (event.persisted) {
    // Limpiar cualquier estado de transición
    sessionStorage.removeItem('transicionActiva');
    sessionStorage.removeItem('imagenProyecto');
    sessionStorage.removeItem('posicionRect');
    
    // Limpiar elementos y restaurar el scroll
    limpiarElementosTransicion();
    
    // Importante: restaurar el scroll
    document.body.style.overflow = '';
  }
});
