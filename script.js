document.addEventListener('DOMContentLoaded', () => {
  
  // --- HEADER SCROLL EFFECT ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- MOBILE MENU TOGGLE ---
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      // Hamburger animation
      const spans = mobileMenuBtn.querySelectorAll('span');
      spans[0].style.transform = navMenu.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
      spans[1].style.opacity = navMenu.classList.contains('open') ? '0' : '1';
      spans[2].style.transform = navMenu.classList.contains('open') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // --- FAQ ACCORDION ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const headerBtn = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');

    headerBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close other open items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-body').style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = null;
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // --- PORTFOLIO CATEGORY FILTERS ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from other buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        // Soft animation transition
        item.style.transition = 'all 0.4s ease';
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.92)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // --- INTERACTIVE CALCULATOR LOGIC ---
  
  // Data definitions for materials
  const materialData = {
    fdm: [
      { id: 'pla', name: 'PLA Estándar', desc: 'Biodegradable, ideal para figuras y prototipos estéticos.', pricePerGram: 0.18 },
      { id: 'abs', name: 'ABS Técnico', desc: 'Resistente a impactos y temperatura. Excelente para piezas mecánicas.', pricePerGram: 0.25 },
      { id: 'petg', name: 'PETG Duradero', desc: 'Flexible, resistente al agua y químicos. Grado alimenticio.', pricePerGram: 0.22 }
    ],
    sla: [
      { id: 'standard', name: 'Resina Estándar', desc: 'Ultra-alto detalle visual. Ideal para miniaturas y moldes.', pricePerGram: 0.45 },
      { id: 'tough', name: 'Resina Ingeniería', desc: 'Alta resistencia y rigidez estructural bajo esfuerzo mecánico.', pricePerGram: 0.65 }
    ]
  };

  // State
  let selectedTech = 'fdm';
  let selectedMaterial = 'pla';
  let selectedSize = 'm'; // s, m, l
  let selectedInfill = 20; // 10% to 100%

  // DOM Elements
  const techBtns = document.querySelectorAll('[data-tech]');
  const materialContainer = document.getElementById('calc-materials');
  const sizeBtns = document.querySelectorAll('[data-size]');
  const infillSlider = document.getElementById('calc-infill');
  const infillValueDisplay = document.getElementById('infill-value');
  
  // Summary outputs
  const summaryTech = document.getElementById('sum-tech');
  const summaryMaterial = document.getElementById('sum-material');
  const summarySize = document.getElementById('sum-size');
  const summaryInfill = document.getElementById('sum-infill');
  const priceDisplay = document.getElementById('price-amount');
  const whatsappCalcBtn = document.getElementById('whatsapp-calc-btn');

  // Setup Material Selector Options dynamically
  function renderMaterials() {
    materialContainer.innerHTML = '';
    const materials = materialData[selectedTech];
    
    materials.forEach((mat, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `calc-option-btn ${selectedMaterial === mat.id ? 'active' : ''}`;
      btn.setAttribute('data-material', mat.id);
      btn.innerHTML = `
        <span class="option-title">${mat.name}</span>
        <span class="option-desc">${mat.desc}</span>
      `;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-material]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMaterial = mat.id;
        calculatePrice();
      });
      
      materialContainer.appendChild(btn);
    });
  }

  // Calculate Price and Update Summary UI
  function calculatePrice() {
    // 1. Base Setup Fee
    const setupFee = selectedTech === 'fdm' ? 60.0 : 120.0;
    
    // 2. Base weight estimate based on Size selection
    let baseWeight = 20.0; // Medium size default
    let sizeName = 'Mediano (Hasta 15cm)';
    if (selectedSize === 's') {
      baseWeight = 8.0;
      sizeName = 'Pequeño (Hasta 8cm)';
    } else if (selectedSize === 'l') {
      baseWeight = 110.0;
      sizeName = 'Grande (Hasta 25cm)';
    }

    // 3. Find Material Info
    const materials = materialData[selectedTech];
    const material = materials.find(m => m.id === selectedMaterial) || materials[0];
    
    // 4. Infill factor calculation
    // Estético/bajo: 10% - 20% (factor 0.85)
    // Medio/estructural: 21% - 50% (factor 1.1)
    // Sólido/industrial: 51% - 100% (factor 1.5)
    let infillFactor = 1.0;
    if (selectedInfill <= 20) {
      infillFactor = 0.85;
    } else if (selectedInfill <= 50) {
      infillFactor = 1.15;
    } else {
      infillFactor = 1.6;
    }

    // SLA Resin printing doesn't typically scale infill in a linear fashion,
    // but we apply it as a general material volume factor.
    const materialCost = baseWeight * material.pricePerGram * infillFactor;
    const finalEstimatedPrice = Math.round(setupFee + materialCost);

    // Update UI Summary Elements
    summaryTech.textContent = selectedTech === 'fdm' ? 'Impresión FDM (Filamento)' : 'Impresión SLA (Resina)';
    summaryMaterial.textContent = material.name;
    summarySize.textContent = sizeName;
    summaryInfill.textContent = `${selectedInfill}%`;
    priceDisplay.textContent = finalEstimatedPrice;

    // Update WhatsApp CTA action URL
    updateWhatsAppLink(finalEstimatedPrice, material.name, sizeName);
  }

  // Update WhatsApp Quote Trigger Link
  function updateWhatsAppLink(price, materialName, sizeName) {
    const techName = selectedTech === 'fdm' ? 'Impresión FDM (Filamento)' : 'Impresión SLA (Resina)';
    const phone = '525512345678'; // Novart 3D Studio number
    const textMessage = `¡Hola Novart 3D Studios! 👋 Quisiera solicitar una cotización formal basada en mi estimación web:

🛠️ *Detalles del Proyecto:*
- *Tecnología:* ${techName}
- *Material:* ${materialName}
- *Tamaño Estimado:* ${sizeName}
- *Relleno:* ${selectedInfill}%

💰 *Estimación Inicial en Web:* $${price} MXN

Adjunto/Enviaré mi archivo de modelo 3D (STL/OBJ) a continuación para afinar la cotización.`;

    const encodedText = encodeURIComponent(textMessage);
    whatsappCalcBtn.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  }

  // Event Listeners for Tech selector buttons
  techBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      techBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTech = btn.getAttribute('data-tech');
      
      // Auto switch material to the first available of new tech
      selectedMaterial = materialData[selectedTech][0].id;
      
      renderMaterials();
      calculatePrice();
    });
  });

  // Event Listeners for Size selector buttons
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.getAttribute('data-size');
      calculatePrice();
    });
  });

  // Event Listener for Infill Slider
  if (infillSlider) {
    infillSlider.addEventListener('input', (e) => {
      selectedInfill = parseInt(e.target.value);
      infillValueDisplay.textContent = `${selectedInfill}%`;
      calculatePrice();
    });
  }

  // Initialize Calculator on Page Load
  if (materialContainer) {
    renderMaterials();
    calculatePrice();
  }

  // --- INTERACTIVE CATALOG DATA ---
  const catalogProducts = [
    // Navidad
    { name: 'Árbol Articulado', category: 'navidad', image: '', emoji: '🎄', desc: 'Decoración festiva interactiva y flexible. Se mueve de forma divertida y es ideal para escritorios.' },
    { name: 'Esfera Navideña de Gato', category: 'navidad', image: '', emoji: '🐱', desc: 'Hermoso adorno calado con silueta de gato y detalles de copos de nieve.' },
    { name: 'Esfera Navideña Merry Christmas', category: 'navidad', image: '', emoji: '✨', desc: 'Clásica esfera navideña con tipografía estilizada para adornar tu árbol.' },
    { name: 'Mini Árboles Navideños (Aretes)', category: 'navidad', image: '', emoji: '🎄', desc: 'Aretes ligeros y festivos en forma de pino para lucir en temporada.' },
    { name: 'Mini Árboles Navideños (Llaveros)', category: 'navidad', image: '', emoji: '🔑', desc: 'Llaveros compactos en forma de árbol navideño para llevar el espíritu festivo contigo.' },
    { name: 'Árboles Decorativos de Alta Resolución', category: 'navidad', image: '', emoji: '🌲', desc: 'Elegantes pinos decorativos texturizados con acabados en relieve.' },
    { name: 'Árbol Navideño Decorativo con Piecitos', category: 'navidad', image: '', emoji: '🎅', desc: 'Pino navideño amigable con piecitos, ideal para decoración infantil y moderna.' },
    { name: 'Árbol Navideño Moderno en Espiral', category: 'navidad', image: '', emoji: '⭐', desc: 'Diseño geométrico en espiral con estrella superior en colores vibrantes.' },
    { name: 'Árbol Navideño Minimalista', category: 'navidad', image: '', emoji: '📐', desc: 'Silueta lineal autoportante de pino con diseño moderno y sobrio.' },
    { name: 'Árboles Navideños Articulados', category: 'navidad', image: '', emoji: '🎄', desc: 'Colección de pinos navideños flexibles que giran y se estiran.' },
    { name: 'Gnomo Navideño', category: 'navidad', image: '', emoji: '🍄', desc: 'Adorable gnomo nórdico de barbas tupidas y gorro puntiagudo en impresión 3D.' },
    { name: 'Nacimiento Clásico', category: 'navidad', image: 'assets/images/sculpture.png', emoji: '👼', desc: 'Representación clásica y delicada del nacimiento navideño en resina o filamento blanco.' },
    { name: 'Molde Casita de Jengibre', category: 'navidad', image: '', emoji: '🍪', desc: 'Molde de repostería para armar tu propia casita navideña de jengibre.' },
    { name: 'Árboles Articulados Personalizados', category: 'navidad', image: '', emoji: '✍️', desc: 'Pinos articulados grabados con nombres personalizados para regalos únicos.' },
    { name: 'Esferas Navideñas Personalizadas con Nombre', category: 'navidad', image: '', emoji: '🎁', desc: 'Esferas con nombres calados en relieve. Un detalle único para el árbol familiar.' },
    { name: 'Esfera Navideña Estilo Grinch', category: 'navidad', image: '', emoji: '🤢', desc: 'Divertida esfera bicolor personalizada con el rostro y gorro del Grinch.' },
    { name: 'Esferas de Minnie y Mickey Mouse', category: 'navidad', image: '', emoji: '🐭', desc: 'Esferas con las icónicas siluetas de Mickey o Minnie grabadas con nombres.' },
    { name: 'Esferas Personalizadas Brillo Navideño', category: 'navidad', image: '', emoji: '✨', desc: 'Set de esferas navideñas en acabados metálicos y nombres en cursiva.' },
    { name: 'Llaveros del Grinch', category: 'navidad', image: '', emoji: '🔑', desc: 'Llaveros color verde con la cara del personaje favorito que robó la Navidad.' },
    { name: 'Muñeco de Nieve Articulado', category: 'navidad', image: '', emoji: '⛄', desc: 'Simpático muñeco de nieve con sombrero de copa y brazos articulados.' },
    { name: 'Aretes de Árbol Navideño', category: 'navidad', image: '', emoji: '💎', desc: 'Aretes tipo pino texturizado con detalles dorados y ganchos premium.' },
    { name: 'Esfera Personalizada de Árbol Navideño', category: 'navidad', image: '', emoji: '🎄', desc: 'Esfera plana calada con grabado de árbol y nombre personalizado.' },
    { name: 'Aretes Estrella de Belén', category: 'navidad', image: '', emoji: '🌟', desc: 'Elegantes aretes dorados calados en forma de la Estrella de Belén.' },
    { name: 'Cascanueces Navideño', category: 'navidad', image: '', emoji: '💂', desc: 'Clásica figura de soldado cascanueces multicolor pintada a mano con gran detalle.' },
    { name: 'Figura del Grinch', category: 'navidad', image: '', emoji: '🎄', desc: 'Figura decorativa del Grinch sentado, ideal para centros de mesa festivos.' },
    { name: 'Esfera Navideña Tradicional', category: 'navidad', image: '', emoji: '🔴', desc: 'Esfera calada con paisaje navideño de pinos y estrella fugaz.' },
    { name: 'Docena de Esferas Navideñas', category: 'navidad', image: '', emoji: '📦', desc: 'Paquete de 12 esferas variadas y personalizadas con los nombres de toda la familia.' },

    // F1 & Autos
    { name: 'Lámpara F1: Pasión por la Velocidad', category: 'autos', image: 'assets/images/gear.png', emoji: '🏎️', desc: 'Lámpara LED con el logotipo oficial de F1. Ideal para aficionados del automovilismo.' },
    { name: 'Portalápices F1', category: 'autos', image: 'assets/images/gear.png', emoji: '✏️', desc: 'Organizador de escritorio con diseño deportivo de neumático y logo F1.' },
    { name: 'Calendario F1 2026 en Relieve', category: 'autos', image: 'assets/images/gear.png', emoji: '📅', desc: 'Cuadro texturizado con el circuito y fechas de toda la temporada 2026 de F1.' },
    { name: 'P ZERO F1 2026 Azul – Lluvia Extrema', category: 'autos', image: 'assets/images/gear.png', emoji: '💧', desc: 'Réplica coleccionable a escala de neumático Pirelli de lluvia extrema con rines detallados.' },
    { name: 'Colección Neumáticos P ZERO F1 2026', category: 'autos', image: 'assets/images/gear.png', emoji: '🏎️', desc: 'Set completo de los 5 compuestos de F1 a escala (Rojo, Amarillo, Blanco, Verde, Azul).' },
    { name: 'P ZERO F1 2026 Verde – Lluvia', category: 'autos', image: 'assets/images/gear.png', emoji: '🌦️', desc: 'Réplica detallada de neumático intermedio para pista húmeda con logo Pirelli.' },
    { name: 'P ZERO F1 2026 Blanca – Hard', category: 'autos', image: 'assets/images/gear.png', emoji: '⚪', desc: 'Réplica de compuesto duro F1. Gran rigidez y acabado premium para tu vitrina.' },
    { name: 'P ZERO F1 2026 Amarilla – Medium', category: 'autos', image: 'assets/images/gear.png', emoji: '🟡', desc: 'Réplica del neumático medio Pirelli, el balance perfecto en las pistas y tu escritorio.' },
    { name: 'P ZERO F1 2026 Roja – Soft', category: 'autos', image: 'assets/images/gear.png', emoji: '🔴', desc: 'Réplica de neumático blando F1. El favorito de los coleccionistas para simulación de pole position.' },

    // Lámparas
    { name: 'Lámpara FRIENDS', category: 'lamparas', image: '', emoji: '📺', desc: 'Lámpara LED con la tipografía icónica de la serie Friends. Perfecta para ambientar salas.' },
    { name: 'Lámpara inspirada en Minecraft', category: 'lamparas', image: '', emoji: '🟩', desc: 'Luz ambiental en cubo calado pixelado. Un clásico de los videojuegos en tu mesita de noche.' },
    { name: 'Lámpara Litofanía Personalizada (4 Fotos)', category: 'lamparas', image: '', emoji: '📷', desc: 'Luz mágica que revela 4 de tus fotografías favoritas grabadas en relieve 3D de alta definición.' },
    { name: 'Lámpara de Rapunzel', category: 'lamparas', image: '', emoji: '☀️', desc: 'Lámpara cilíndrica amarilla grabada con el sol dorado del reino de Corona.' },

    // Mascotas
    { name: 'Llaveros Pug Articulados', category: 'mascotas', image: '', emoji: '🐶', desc: 'Llaveros flexibles de perritos Pug que simulan movimientos reales.' },
    { name: 'Llavero Pug Bicolor', category: 'mascotas', image: '', emoji: '🐕', desc: 'Llavero bicolor de alta definición con el rostro de un Pug.' },
    { name: 'Llavero Shiba Inu Articulado', category: 'mascotas', image: '', emoji: '🦊', desc: 'Figura flexible de Shiba Inu. El perro más famoso del internet en tu bolsillo.' },
    { name: 'Llavero Poodle Rizado', category: 'mascotas', image: '', emoji: '🐩', desc: 'Llavero de Poodle texturizado con detalles hiperrealistas de pelaje rizado.' },
    { name: 'Llavero Labrador', category: 'mascotas', image: '', emoji: '🐶', desc: 'Llavero detallado de cachorro Labrador en colores crema o café.' },
    { name: 'Llavero Schnauzer', category: 'mascotas', image: '', emoji: '🐾', desc: 'Llavero de Schnauzer con detalles en gris y blanco característicos de la raza.' },
    { name: 'Base Pastor Alemán para Teléfono', category: 'mascotas', image: '', emoji: '📱', desc: 'Soporte de celular esculpido con la figura de un Pastor Alemán sentado.' },
    { name: 'Perro Pastor Belga Malinois', category: 'mascotas', image: '', emoji: '🐕', desc: 'Escultura realista a escala de Pastor Belga Malinois en posición de alerta.' },
    { name: 'Llavero Malteser', category: 'mascotas', image: '', emoji: '🐶', desc: 'Tierno llavero de perrito Maltés en resina detallada blanca.' },
    { name: 'Base Gato Estirándose para Celular', category: 'mascotas', image: '', emoji: '🐱', desc: 'Soporte funcional con la elegante forma de un felino estirándose.' },
    { name: 'Base Gato Silueta para Teléfono', category: 'mascotas', image: '', emoji: '🐈', desc: 'Base minimalista de gato para mantener tu celular en posición vertical u horizontal.' },
    { name: 'Llavero Parejas Gatitos Yin Yang', category: 'mascotas', image: '', emoji: '☯️', desc: 'Par de llaveros complementarios que forman un corazón con gatos blanco y negro.' },
    { name: 'Llavero Gatito Plano', category: 'mascotas', image: '', emoji: '🐱', desc: 'Llavero de silueta de gato negro con ojos grandes y brillantes.' },
    { name: 'Llavero Gatito Negro Articulado', category: 'mascotas', image: '', emoji: '🐈', desc: 'Figura flexible de gato negro articulado de divertidos movimientos.' },
    { name: 'Llavero Yin Yang de Gatos', category: 'mascotas', image: '', emoji: '🖤', desc: 'Llavero circular de resina de gatos complementarios Yin Yang.' },
    { name: 'Borreguito Decorativo de la Fortuna', category: 'mascotas', image: '', emoji: '🐑', desc: 'Adorno de borrego de lana rizada, ideal para la buena fortuna en tu hogar.' },
    { name: 'Llaveros Borreguitos Personalizados', category: 'mascotas', image: '', emoji: '🔑', desc: 'Set de llaveros de borreguitos flexibles ideales para recuerdos de eventos.' },
    { name: 'La Oveja más Rebelde del Rebaño', category: 'mascotas', image: '', emoji: '🤘', desc: 'Divertida figura de borrego negro rockero haciendo señas con las pezuñas.' },

    // Geek & Figuras
    { name: 'Llavero de Mira - Guerreras KPop', category: 'geek', image: '', emoji: '🎤', desc: 'Llavero ilustrado de Mira con cabello rosa de la colección Demon Hunters.' },
    { name: 'Llavero de Rumi - Guerreras KPop', category: 'geek', image: '', emoji: '💜', desc: 'Llavero detallado de Rumi con trenzas moradas caladas.' },
    { name: 'Llavero de Zoey - Guerreras KPop', category: 'geek', image: '', emoji: '💙', desc: 'Llavero estilizado de Zoey con traje azul brillante.' },
    { name: 'Llavero Romance Saja', category: 'geek', image: '', emoji: '🌸', desc: 'Llavero coleccionable de la colección Saja Boys con detalles florales.' },
    { name: 'Llavero Jinu Saja', category: 'geek', image: '', emoji: '🕶️', desc: 'Llavero de Jinu Saja de Demon Hunters con camisa a cuadros azul.' },
    { name: 'Llavero de Baby Saja', category: 'geek', image: '', emoji: '👶', desc: 'Versión tierna de Saja en llavero coleccionable K-Pop.' },
    { name: 'Llavero Mystery Saja', category: 'geek', image: '', emoji: '💜', desc: 'Llavero de Saja con cabello morado oscuro en pose misteriosa.' },
    { name: 'Llavero Abby – Saja Boys', category: 'geek', image: '', emoji: '🧢', desc: 'Llavero de Abby Saja con gorrito amarillo de alta precisión.' },
    { name: 'Adorno para Lápiz Saja Boys', category: 'geek', image: '', emoji: '✏️', desc: 'Topper de lápiz decorativo con el emblema de Saja Boys.' },
    { name: 'Adorno para Lápiz Huntrix', category: 'geek', image: '', emoji: '🏹', desc: 'Emblema decorativo Huntrix para personalizar tus lápices de estudio.' },
    { name: 'Separador de Rumi', category: 'geek', image: '', emoji: '📚', desc: 'Marcapáginas 3D plano con la silueta de Rumi en color morado.' },
    { name: 'Separador de Mira', category: 'geek', image: '', emoji: '📖', desc: 'Marcapáginas con la silueta de Mira en fondo rosa pastel.' },
    { name: 'Separador de Zoey', category: 'geek', image: '', emoji: '🔖', desc: 'Separador de libros premium de Zoey en color azul cobalto.' },
    { name: 'Derpy Tiger – Marcapáginas 3D', category: 'geek', image: '', emoji: '🐯', desc: 'Divertido marcapáginas con la cara de un tigre gracioso que cuelga del libro.' },
    { name: 'Centro de Mesa Huntrix Personalizado', category: 'geek', image: '', emoji: '🏆', desc: 'Stand decorativo con las siluetas de las guerreras y base grabada con nombre.' },
    { name: 'Gok-Do de Mira – Cosplay Prop', category: 'geek', image: '', emoji: '⚔️', desc: 'Réplica de alabarda Gok-Do de Mira para cosplay. Longitud completa y colores reales.' },
    { name: 'Mike Wazowski Articulado', category: 'geek', image: 'assets/images/sculpture.png', emoji: '👁️', desc: 'Figura articulada y detallada de Mike de Monsters Inc. con gran dinamismo.' },
    { name: 'Snoopy Decorativo', category: 'geek', image: 'assets/images/sculpture.png', emoji: '🐶', desc: 'Clásica figura de Snoopy parado en colores blanco y negro brillante.' },
    { name: 'Mazinger Z – Figura Articulada', category: 'geek', image: 'assets/images/sculpture.png', emoji: '🤖', desc: 'Modelo articulado a escala del gran robot Mazinger Z. Colores y piezas ensamblables.' },
    { name: 'Matute - Don Gato y su Pandilla', category: 'geek', image: 'assets/images/sculpture.png', emoji: '👮', desc: 'Figura coleccionable a escala del Oficial Matute con su uniforme de policía azul.' },
    { name: 'Adorno de Mickey y Minnie', category: 'geek', image: 'assets/images/sculpture.png', emoji: '🖤', desc: 'Silueta de las cabezas de Mickey y Minnie entrelazadas con corazones rojos en relieve.' },
    { name: 'Rocky Articulado – Proyecto Hail Mary', category: 'geek', image: 'assets/images/sculpture.png', emoji: '🦀', desc: 'Figura del alienígena Rocky en forma de araña de piedra del best-seller de ciencia ficción.' },
    { name: 'Keylisong Rivals Impresa 3D', category: 'geek', image: 'assets/images/sculpture.png', emoji: '⚔️', desc: 'Cuchillo mariposa de entrenamiento impreso en filamento dorado de alta resistencia.' },
    { name: 'Tecla Personalizada Charizard', category: 'geek', image: 'assets/images/sculpture.png', emoji: '⌨️', desc: 'Keycap artesanal para teclado mecánico con figura de Charizard en el interior.' },
    { name: 'Chimuelo – Furia Nocturna', category: 'geek', image: 'assets/images/sculpture.png', emoji: '🐉', desc: 'Dragón Chimuelo articulado de Cómo Entrenar a tu Dragón con ojos verdes.' },

    // Oficina
    { name: 'Placa Corporativa 3D Personalizada', category: 'oficina', image: 'assets/images/prototype.png', emoji: '🏢', desc: 'Placa con logo y tipografía de tu empresa en relieve. Excelente para recepciones y escritorios.' },
    { name: 'Organizador de Escritorio Ejecutivo', category: 'oficina', image: 'assets/images/prototype.png', emoji: '💼', desc: 'Portanombres y tarjetero premium con soporte integrado para pluma o celular.' },
    { name: 'Letras de Negocio en Relieve', category: 'oficina', image: 'assets/images/prototype.png', emoji: '🏬', desc: 'Letras individuales y logotipos comerciales para muros comerciales.' },

    // Accesorios & Otros
    { name: 'Llavero Zorrito Calado', category: 'accesorios', image: '', emoji: '🦊', desc: 'Llavero detallado de zorro en combinación de colores blanco y negro.' },
    { name: 'Llavero de Barco', category: 'accesorios', image: '', emoji: '🚢', desc: 'Réplica pequeña de barquito clásico ideal para llaveros náuticos.' },
    { name: 'Aretes de Estrella de Mar', category: 'accesorios', image: '', emoji: '⭐', desc: 'Aretes veraniegos y playeros en forma de estrellas de mar texturizadas.' },
    { name: 'Aretes Árbol de la Vida', category: 'accesorios', image: '', emoji: '🌳', desc: 'Aretes calados circulares con el intrincado diseño del Árbol de la Vida.' },
    { name: 'Aretes Estrella Minimalistas', category: 'accesorios', image: '', emoji: '✨', desc: 'Aretes en forma de estrellas de Belén doradas, ligeros y de gran brillo.' },
    { name: 'Alas de Ángel Decorativas', category: 'accesorios', image: '', emoji: '👼', desc: 'Escultura calada de un par de alas de ángel ideal para repisas.' },
    { name: 'Estatua de San Miguel Arcángel', category: 'accesorios', image: 'assets/images/sculpture.png', emoji: '⚔️', desc: 'Estatua religiosa detallada en resina dorada de San Miguel Arcángel venciendo al demonio.' },
    { name: 'Llavero Corazón con Alas', category: 'accesorios', image: '', emoji: '💖', desc: 'Tierno llavero de corazón alado, ideal para obsequiar a tu pareja.' },
    { name: 'Moldes Personalizados para Jabón', category: 'accesorios', image: '', emoji: '🧼', desc: 'Moldes de silicona o plástico rígido grabados con logotipos artesanales para jabonería.' },
    { name: 'Logo de The Rolling Stones de Pared', category: 'accesorios', image: '', emoji: '👅', desc: 'Decoración de pared tridimensional pintada en rojo brillante del logo de la lengua de los Stones.' },
    { name: 'Casco de los Steelers 3D', category: 'accesorios', image: '', emoji: '🏈', desc: 'Cuadro calado tridimensional del casco oficial de los Acereros de Pittsburgh.' },
    { name: 'Caja para Cromos FIFA Azul', category: 'accesorios', image: '', emoji: '⚽', desc: 'Estuche de almacenamiento temático del Mundial para guardar tus tarjetas coleccionables.' },
    { name: 'Caja para Cromos FIFA Dorada', category: 'accesorios', image: '', emoji: '🏆', desc: 'Estuche premium en filamento dorado metálico para colecciones valiosas.' },
    { name: 'Perchero Organizador DeLorean', category: 'accesorios', image: '', emoji: '🚗', desc: 'Colgador de llaves y abrigos de pared con la icónica parte trasera del DeLorean de Volver al Futuro.' }
  ];

  // --- CATALOG INTERACTIVE LOGIC ---
  const catalogGrid = document.getElementById('catalog-grid');
  const catalogSearch = document.getElementById('catalog-search');
  const catFilterBtns = document.querySelectorAll('.cat-filter-btn');

  function renderCatalog(category = 'all', searchQuery = '') {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    const query = searchQuery.toLowerCase().trim();
    const filtered = catalogProducts.filter(product => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch = query === '' || 
        product.name.toLowerCase().includes(query) || 
        product.desc.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div class="glass-panel" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">🔍 No se encontraron productos</p>
          <p style="font-size: 0.88rem;">Prueba con otra palabra clave o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card glass-panel';
      
      let imgHTML = '';
      if (product.image) {
        imgHTML = `<div class="product-image-wrapper"><img src="${product.image}" alt="${product.name}" loading="lazy">`;
      } else {
        imgHTML = `
          <div class="product-fallback-img">
            <span class="fallback-icon">${product.emoji || '📦'}</span>
          </div>
        `;
      }

      // Generate WhatsApp link
      const phone = '525512345678';
      const textMessage = `¡Hola Novart 3D Studios! 👋 Me interesa cotizar el siguiente producto de su catálogo:
      
✨ *Producto:* ${product.name}
📂 *Categoría:* ${product.category.toUpperCase()}

¿Me podrían dar información sobre costos, colores disponibles y tiempos de entrega? ¡Gracias!`;
      const encodedText = encodeURIComponent(textMessage);
      const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

      card.innerHTML = `
        <div class="product-image-wrapper">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : `
          <div class="product-fallback-img">
            <span class="fallback-icon">${product.emoji || '📦'}</span>
          </div>`}
          <span class="product-badge ${product.category}">${product.category}</span>
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
          <a href="${waLink}" target="_blank" class="btn-glass btn-glass-filled btn-product-cotizar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M187.58,144.84l-32-16a8,8,0,0,0-8,1l-14.71,11.77a110.87,110.87,0,0,1-34.93-34.93L111,92a8,8,0,0,0,1-8l-16-32A8,8,0,0,0,86.84,48,48,48,0,0,0,40,96c0,72.26,59.39,132,132,132a48,48,0,0,0,48-46.84A8,8,0,0,0,215,172.93Z" opacity="0.2"></path><path d="M128,24A104,104,0,0,0,36.8,178l-8.52,25.54a16,16,0,0,0,20.22,20.22l25.54-8.52A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.74-.79l-26.6,8.87,8.87-26.6a8,8,0,0,0-.79-6.74A88,88,0,1,1,128,216Zm45-43.07A40,40,0,0,1,136,184c-53.64,0-96-42.36-96-96a40,40,0,0,1,11.07-27,8,8,0,0,1,10.22-.72l16,32a8,8,0,0,1-1,8L65.6,112A78.82,78.82,0,0,0,112,158.4L123.69,147a8,8,0,0,1,8-1l32,16a8,8,0,0,1-.72,10.22Z"></path></svg>
            Cotizar por WhatsApp
          </a>
        </div>
      `;
      catalogGrid.appendChild(card);
    });
  }

  // Active filters and search state
  let activeCat = 'all';
  let activeSearch = '';

  if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      renderCatalog(activeCat, activeSearch);
    });
  }

  catFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      renderCatalog(activeCat, activeSearch);
    });
  });

  // Call initial catalog render
  if (catalogGrid) {
    renderCatalog();
  }

  // --- FLOATING WHATSAPP BUTTON PULSE / INTERACTION ---
  const whatsappFloating = document.querySelector('.whatsapp-floating');
  if (whatsappFloating) {
    // Auto show tooltip after 3 seconds, then hide it 5 seconds later
    setTimeout(() => {
      const tooltip = whatsappFloating.querySelector('.whatsapp-tooltip');
      if (tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(0)';
        
        setTimeout(() => {
          tooltip.style.opacity = '';
          tooltip.style.transform = '';
        }, 6000);
      }
    }, 3000);
  }

});
