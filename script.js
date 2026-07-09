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
    const navLinks = document.querySelectorAll('.nav-link');
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
