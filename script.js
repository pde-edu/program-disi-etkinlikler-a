let currentLang = "tr";
let autoScrollIntervals = []; // otomatik scroll interval'lerini saklamak için
let autoScrollPaused = false;
let pauseTimeout;
let selectedEventId = null;
let selectedImageIndex = 0; // Modal içinde hangi görselin açık olduğunu tutar

/* =========================
   ETKİNLİK VERİLERİ
========================= */
const events = {
  etkinlik1: {
    category: "belirli",
    title: { tr: "Etkinlik 1", en: "Activity 1" },
    shortDesc: { tr: "Bu etkinlikte öğrenciler iş birliği çalışması yaptı.", en: "Students practiced collaborative learning in this activity." },
    longDesc: { tr: "Bu etkinlik kapsamında öğrenciler grup çalışmaları yaparak problem çözme becerilerini geliştirdiler.", en: "In this activity, students improved their problem-solving skills through group work." },
    images: [
      "assets/images/etkinlik1-1.jpg",
      "assets/images/etkinlik1-2.jpg"
    ]
  },
  etkinlik2: {
    category: "bayram",
    title: { tr: "Etkinlik 2", en: "Activity 2" },
    shortDesc: { tr: "Bayram kutlamaları etkinliği.", en: "Holiday celebration activity." },
    longDesc: { tr: "Öğrenciler bayramlarla ilgili etkinlikler yaptı.", en: "Students participated in holiday-related activities." },
    images: [
      "assets/images/etkinlik2-1.jpg"
    ]
  },
  etkinlik3: {
    category: "okuldisi",
    title: { tr: "Etkinlik 3", en: "Activity 3" },
    shortDesc: { tr: "Okul dışı öğrenme ortamı etkinliği.", en: "Out-of-school learning environment activity." },
    longDesc: { tr: "Öğrenciler müze ve doğa gezilerine katıldılar.", en: "Students visited museums and nature trips." },
    images: [
      "assets/images/etkinlik3-1.jpg"
    ]
  }
};

/* =========================
   DİL DEĞİŞTİRME
========================= */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("selectedLang", lang);

    const sections = ["about", "hero", "gallery1", "gallery2"];
    sections.forEach(section => {
        const tr = document.getElementById(section + "-tr");
        const en = document.getElementById(section + "-en");
        if (tr) tr.style.display = (lang === "tr") ? "block" : "none";
        if (en) en.style.display = (lang === "en") ? "block" : "none";
    });

    const btn = document.getElementById("detailBtn");
    if(btn){
        btn.innerText = lang === "tr" ? "Devamını Gör" : "See Details";
    }

    // Galeriyi yeniden render et
    renderGallery(lang);
}

/* =========================
   SCROLL
========================= */
function scrollGallery(button, direction) {
    const wrapper = button.closest(".scroll-wrapper");
    if (!wrapper) return;
    const gallery = wrapper.querySelector(".horizontal-scroll");
    if (!gallery) return;

    gallery.scrollBy({ left: direction * 320, behavior: "smooth" });

    autoScrollPaused = true;
    clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => autoScrollPaused = false, 3000);
}

/* =========================
   MODAL
========================= */
function openModal(card, eventId, index = 0) {
    if(!eventId || !events[eventId]) return;

    selectedEventId = eventId;
    selectedImageIndex = index;
    autoScrollPaused = true;

    document.getElementById("modalImage").src = events[eventId].images[selectedImageIndex];
    document.getElementById("modalDescription").innerText = events[eventId].shortDesc[currentLang];
    document.getElementById("imageModal").style.display = "block";
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
    autoScrollPaused = false;
}

function nextImage() {
    if(!selectedEventId) return;
    const images = events[selectedEventId].images;
    selectedImageIndex = (selectedImageIndex + 1) % images.length;
    document.getElementById("modalImage").src = images[selectedImageIndex];
}

function prevImage() {
    if(!selectedEventId) return;
    const images = events[selectedEventId].images;
    selectedImageIndex = (selectedImageIndex - 1 + images.length) % images.length;
    document.getElementById("modalImage").src = images[selectedImageIndex];
}

/* =========================
   OTOMATİK SCROLL
========================= */
function autoScrollGallery() {
    // Önceki interval'leri temizle
    autoScrollIntervals.forEach(interval => clearInterval(interval));
    autoScrollIntervals = [];

    const galleries = document.querySelectorAll(".auto-scroll");
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    galleries.forEach(gallery => {
        if (isMobile) return;
        let scrollAmount = 0;
        const interval = setInterval(() => {
            if (autoScrollPaused) return;
            scrollAmount += 2;
            if (scrollAmount >= gallery.scrollWidth - gallery.clientWidth) scrollAmount = 0;
            gallery.scrollTo({ left: scrollAmount });
        }, 20);
        autoScrollIntervals.push(interval);
    });
}

/* =========================
   SAYFA YÜKLENİNCE
========================= */
document.addEventListener("DOMContentLoaded", function(){
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");
    const langParam = params.get("lang");

    if(langParam === "tr" || langParam === "en") currentLang = langParam;
    else {
        const savedLang = localStorage.getItem("selectedLang");
        if(savedLang === "tr" || savedLang === "en") currentLang = savedLang;
    }

    setLanguage(currentLang); // galeriyi ve dili başlat

    autoScrollGallery();
    document.querySelectorAll(".auto-scroll").forEach(gallery => {
        gallery.addEventListener("mouseenter", () => autoScrollPaused = true);
        gallery.addEventListener("mouseleave", () => autoScrollPaused = false);
    });

    // Detail sayfası
    if(eventId && events[eventId]){
        const event = events[eventId];
        const titleEl = document.getElementById("detailTitle");
        const textEl = document.getElementById("detailText");
        const gallery = document.getElementById("detailGallery");

        if(titleEl) titleEl.innerText = event.title[currentLang];
        if(textEl) textEl.innerText = event.longDesc[currentLang];

        if(gallery){
            gallery.innerHTML = "";
            event.images.forEach((imgSrc, i) => {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.style.width = "250px";
                img.style.margin = "10px";
                img.style.borderRadius = "12px";
                img.style.cursor = "pointer";
                img.onclick = () => openModal(null, eventId, i);
                gallery.appendChild(img);
            });
        }
    }
});

/* =========================
   DETAY SAYFASINA GİT
========================= */
function goToDetailPage() {
    if(selectedEventId){
        window.location.href = `detail.html?id=${selectedEventId}&lang=${currentLang}`;
    }
}

/* =========================
   GALERİ RENDER
========================= */
function renderGallery(lang = currentLang) {
    const containers = {
        belirli: document.getElementById(lang === "tr" ? "gallery-belirli" : "gallery-belirli-en"),
        bayram: document.getElementById(lang === "tr" ? "gallery-bayramlar" : "gallery-bayramlar-en"),
        okuldisi: document.getElementById(lang === "tr" ? "gallery-okuldisi" : "gallery-okuldisi-en")
    };
    Object.values(containers).forEach(c => { if(c) c.innerHTML = ""; });

    Object.keys(events).forEach(eventId => {
        const event = events[eventId];
        const container = containers[event.category];
        if(!container) return;

        const card = document.createElement("div");
        card.className = "card";
        card.onclick = () => openModal(card, eventId, 0);

        const img = document.createElement("img");
        img.src = event.images[0];

        const overlay = document.createElement("div");
        overlay.className = "overlay";
        overlay.innerText = event.title[lang];

        card.appendChild(img);
        card.appendChild(overlay);
        container.appendChild(card);
    });
}