let selectedServices = [];
let allServices = [];

const STATIC_SERVICES = [
    // Pemotongan & Styling
    { id: 101, name: 'Potong Rambut',           price: 30000,  duration: 30,  description: 'Potongan rapi sesuai bentuk wajah oleh stylist berpengalaman.', is_best_seller: true  },
    { id: 102, name: 'Cuci & Catok',             price: 30000,  duration: 30,  description: 'Rambut bersih, wangi, dan lurus sempurna setelah catok.', is_best_seller: false },
    { id: 103, name: 'Potong + Cuci + Catok',    price: 75000,  duration: 60,  description: 'Paket lengkap potong, keramas, dan catok dalam satu sesi.', is_best_seller: true  },
    { id: 104, name: 'Sanggul/Hair Do',           price: 50000,  duration: 45,  description: 'Tatanan elegan untuk acara formal, wisuda, maupun pernikahan.', is_best_seller: false },

    // Perawatan Rambut
    { id: 201, name: 'Creambath',                price: 45000,  duration: 60,  description: 'Perawatan krim nutrisi + pijat kepala yang menenangkan dan menyehatkan.', is_best_seller: true  },
    { id: 202, name: 'Hair Spa',                 price: 55000,  duration: 75,  description: 'Terapi intensif untuk rambut rusak, kering, dan kusam agar kembali berkilau.', is_best_seller: false },
    { id: 203, name: 'Hair Mask',                price: 40000,  duration: 45,  description: 'Masker kaya protein untuk mengembalikan kelembapan dan kekuatan rambut.', is_best_seller: false },
    { id: 204, name: 'Keratin Treatment',        price: 80000,  duration: 90,  description: 'Meluruskan & menghaluskan rambut dengan formula keratin berkualitas tinggi.', is_best_seller: false },
    { id: 205, name: 'Hot Oil Treatment',        price: 35000,  duration: 45,  description: 'Minyak hangat untuk menutrisi akar rambut dan mengurangi kerontokan.', is_best_seller: false },
    { id: 206, name: 'Detox Rambut',             price: 50000,  duration: 60,  description: 'Membersihkan penumpukan produk & kotoran di kulit kepala secara menyeluruh.', is_best_seller: false },
    { id: 207, name: 'Scalp Treatment',          price: 55000,  duration: 60,  description: 'Perawatan khusus untuk kulit kepala berketombe, gatal, atau berminyak.', is_best_seller: false },

    // Perawatan Kimia
    { id: 301, name: 'Hair Coloring (Full)',     price: 150000, duration: 120, description: 'Pewarnaan penuh dengan pilihan warna terkini dan cat berkualitas salon.', is_best_seller: true  },
    { id: 302, name: 'Hair Coloring (Touch Up)', price: 80000,  duration: 60,  description: 'Mewarnai ulang bagian akar yang tumbuh agar warna tetap merata.', is_best_seller: false },
    { id: 303, name: 'Highlight/Balayage',       price: 175000, duration: 90,  description: 'Pewarnaan parsial untuk tampilan dimensi dan natural yang trendi.', is_best_seller: false },
    { id: 304, name: 'Ombre/Gradient',           price: 200000, duration: 120, description: 'Gradasi warna dari gelap ke terang untuk tampilan modern dan artistik.', is_best_seller: false },
    { id: 305, name: 'Smoothing/Rebonding',      price: 200000, duration: 150, description: 'Meluruskan rambut keriting atau bergelombang dengan hasil halus tahan lama.', is_best_seller: true  },
    { id: 306, name: 'Permanent Wave (Perm)',    price: 175000, duration: 120, description: 'Memberikan tekstur keriting atau bergelombang yang tahan lama sesuai selera.', is_best_seller: false },

    // Layanan Tambahan
    { id: 401, name: 'Pijat Pundak',             price: 30000,  duration: 20,  description: 'Relaksasi otot pundak yang tegang, cocok ditambahkan setelah perawatan.', is_best_seller: false },
    { id: 402, name: 'Pijat Tangan & Lengan',    price: 30000,  duration: 20,  description: 'Pijat lembut tangan dan lengan untuk mengurangi pegal dan stres.', is_best_seller: false },
    { id: 403, name: 'Hair Extensions',          price: 100000, duration: 90,  description: 'Menambah panjang atau volume rambut secara instan dengan metode profesional.', is_best_seller: false },
    { id: 404, name: 'Perawatan Jenggot/Kumis',  price: 30000,  duration: 20,  description: 'Merapikan dan membentuk jenggot & kumis agar tampil lebih rapi dan groomed.', is_best_seller: false },
    { id: 405, name: 'Facial Dasar',             price: 75000,  duration: 45,  description: 'Perawatan wajah dasar untuk membersihkan pori dan mencerahkan kulit.', is_best_seller: false },
    { id: 406, name: 'Facial Premium',           price: 150000, duration: 75,  description: 'Facial lengkap dengan serum dan masker premium untuk kulit glowing.', is_best_seller: false },
];

const CATEGORIES = {
    'Pemotongan & Styling': {
        icon: 'fa-scissors',
        names: ['Potong Rambut', 'Cuci & Catok', 'Potong + Cuci + Catok', 'Sanggul/Hair Do']
    },
    'Perawatan Rambut': {
        icon: 'fa-spa',
        names: ['Creambath', 'Hair Spa', 'Hair Mask', 'Keratin Treatment', 'Hot Oil Treatment', 'Detox Rambut', 'Scalp Treatment']
    },
    'Perawatan Kimia': {
        icon: 'fa-flask-vial',
        names: ['Hair Coloring (Full)', 'Hair Coloring (Touch Up)', 'Highlight/Balayage', 'Ombre/Gradient', 'Smoothing/Rebonding', 'Permanent Wave (Perm)']
    },
    'Layanan Tambahan': {
        icon: 'fa-plus',
        names: ['Pijat Pundak', 'Pijat Tangan & Lengan', 'Hair Extensions', 'Perawatan Jenggot/Kumis', 'Facial Dasar', 'Facial Premium']
    }
};

// ─── GENERATE QUEUE NUMBER LOKAL ─────────────────────────────────────────────

function generateQueueNumber(date) {
    const d = date.replace(/-/g, '');           // "20260306"
    const seq = String(Math.floor(Math.random() * 900) + 100); // 100–999
    return `A-${d}-${seq}`;
}

function generateBookingId() {
    return 'BK-' + Date.now();
}

// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').setAttribute('min', today);

    loadServices();

    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
});

// ─── LOAD SERVICES ───────────────────────────────────────────────────────────

async function loadServices() {
    try {
        const data = await apiCall('/services');
        if (!data?.data?.length) throw new Error('Data kosong dari API');
        allServices = data.data;
        displayServices(allServices);
    } catch (error) {
        console.warn('API tidak tersedia, menggunakan data lokal:', error);
        allServices = STATIC_SERVICES;
        displayServices(allServices);
    }
}

// ─── DISPLAY SERVICES ────────────────────────────────────────────────────────

function displayServices(services) {
    const container = document.getElementById('services-container');
    container.innerHTML = '';

    let hasAny = false;

    Object.entries(CATEGORIES).forEach(([category, { icon, names }]) => {
        const categoryServices = services.filter(s => names.includes(s.name));
        if (categoryServices.length === 0) return;
        hasAny = true;

        const categoryHtml = `
            <div class="category-title">
                <i class="fas ${icon}"></i> ${category}
            </div>
            <div class="row g-3 mb-4">
                ${categoryServices.map(service => renderServiceCard(service)).join('')}
            </div>
        `;
        container.innerHTML += categoryHtml;
    });

    if (!hasAny) {
        container.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-info-circle"></i> Tidak ada layanan tersedia saat ini.
            </div>
        `;
    }
}

function renderServiceCard(service) {
    const isSelected = selectedServices.some(s => s.id === service.id);
    const bestSellerBadge = service.is_best_seller
        ? `<div class="badge-bestseller">Best Seller</div>`
        : '';

    return `
        <div class="col-md-6">
            <div class="service-option ${isSelected ? 'selected' : ''}"
                onclick="toggleService(${service.id}, '${escapeAttr(service.name)}', ${service.price}, ${service.duration})">
                <div class="service-header">
                    <h6 class="service-title">${service.name}</h6>
                    ${bestSellerBadge}
                </div>
                <p class="service-description">${service.description || 'Layanan berkualitas Nita Salon'}</p>
                <div class="service-meta">
                    <span><i class="fas fa-hourglass-end"></i> ${service.duration} menit</span>
                    <span class="service-price">Rp ${service.price.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
    `;
}

function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ─── TOGGLE SERVICE ──────────────────────────────────────────────────────────

function toggleService(serviceId, serviceName, price, duration) {
    const index = selectedServices.findIndex(s => s.id === serviceId);

    if (index > -1) {
        selectedServices.splice(index, 1);
    } else {
        selectedServices.push({ id: serviceId, name: serviceName, price, duration });
    }

    displayServices(allServices);
    updateSummary();
}

// ─── UPDATE SUMMARY ──────────────────────────────────────────────────────────

function updateSummary() {
    const summaryContainer = document.getElementById('selected-services');

    if (selectedServices.length === 0) {
        summaryContainer.innerHTML = '<p class="empty-message">Belum ada layanan yang dipilih</p>';
        document.getElementById('total-duration').textContent = '0';
        document.getElementById('total-price').textContent = 'Rp 0';
        return;
    }

    let totalPrice = 0;
    let totalDuration = 0;

    const summaryHtml = selectedServices.map(service => {
        totalPrice    += service.price;
        totalDuration += service.duration;

        return `
            <div class="summary-item">
                <div>
                    <div style="font-weight:600; color:#333;">${service.name}</div>
                    <small class="text-muted">
                        ${service.duration} menit &bull; Rp ${service.price.toLocaleString('id-ID')}
                    </small>
                </div>
                <button type="button" class="remove-btn"
                    onclick="toggleService(${service.id}, '${escapeAttr(service.name)}', ${service.price}, ${service.duration})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    summaryContainer.innerHTML = summaryHtml;
    document.getElementById('total-duration').textContent = totalDuration;
    document.getElementById('total-price').textContent = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

// ─── BOOKING SUBMIT ──────────────────────────────────────────────────────────

async function handleBookingSubmit(e) {
    e.preventDefault();

    const name  = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value || null;
    const date  = document.getElementById('date').value;
    const time  = document.getElementById('time').value;

    // ── Validasi ──────────────────────────────────────────────────────────────
    if (!name) {
        showToast('Nama tidak boleh kosong', 'warning'); return;
    }
    if (!phone || phone.length < 10) {
        showToast('Nomor WhatsApp tidak valid', 'warning'); return;
    }
    if (selectedServices.length === 0) {
        showToast('Pilih minimal satu layanan', 'warning'); return;
    }
    if (!date) {
        showToast('Pilih tanggal booking', 'warning'); return;
    }
    if (!time) {
        showToast('Pilih jam booking', 'warning'); return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        showToast('Tanggal harus hari ini atau setelahnya', 'warning'); return;
    }

    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';

    // ── Coba API, fallback ke lokal ───────────────────────────────────────────
    try {
        const bookingData = {
            name,
            phone,
            email,
            services: selectedServices.map(s => s.id),
            date,
            time,
        };

        let queueNumber, bookingId;

        try {
            // Coba kirim ke API
            const response = await apiCall('/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingData),
            });

            if (!response.success) {
                throw new Error(response.message || 'API gagal');
            }

            queueNumber = response.data.queue_number;
            bookingId   = response.data.booking_id;

        } catch (apiError) {
            // ── FALLBACK: buat data lokal jika API tidak tersedia ────────────
            console.warn('API tidak tersedia, menggunakan mode lokal:', apiError);
            queueNumber = generateQueueNumber(date);
            bookingId   = generateBookingId();
        }

        // Simpan data ke sessionStorage agar halaman checkout bisa membacanya
        const totalPrice    = selectedServices.reduce((sum, s) => sum + s.price, 0);
        const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

        const bookingRecord = {
            queue_number:    queueNumber,
            booking_id:      bookingId,
            customer_name:   name,
            customer_phone:  phone,
            customer_email:  email,
            date,
            time,
            services:        selectedServices,   // array lengkap dengan name, price, duration
            total_price:     totalPrice,
            total_duration:  totalDuration,
            status:          'Menunggu Pembayaran',
            created_at:      new Date().toISOString(),
        };

        // ── sessionStorage: untuk halaman checkout (tab yang sama) ──────────
        sessionStorage.setItem('bookingData', JSON.stringify(bookingRecord));

        // ── localStorage: untuk admin dashboard & cek status (lintas tab) ─────
        try {
            const existing = localStorage.getItem('offlineBookings');
            const allBookings = existing ? JSON.parse(existing) : [];
            allBookings.unshift(bookingRecord);             // booking terbaru di atas
            // Batasi maks 200 entry agar tidak membengkak
            if (allBookings.length > 200) allBookings.splice(200);
            localStorage.setItem('offlineBookings', JSON.stringify(allBookings));
        } catch (e) {
            console.warn('Gagal menyimpan ke localStorage:', e);
        }

        showToast('Booking berhasil! Melanjutkan ke pembayaran...', 'success');

        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);

    } catch (error) {
        console.error('Booking error:', error);
        showToast('Terjadi kesalahan. Silakan coba lagi.', 'danger');
    } finally {
        spinner.style.display = 'none';
    }
}

// ─── TOAST ──────────────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
    const wrap = document.createElement('div');
    wrap.className = 'position-fixed bottom-0 end-0 p-3';
    wrap.style.zIndex = '9999';
    wrap.innerHTML = `
        <div class="toast align-items-center text-white bg-${type} border-0"
             role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    new bootstrap.Toast(wrap.querySelector('.toast')).show();
    setTimeout(() => wrap.remove(), 3000);
}

// ─── API HELPER ──────────────────────────────────────────────────────────────

async function apiCall(endpoint, options = {}) {
    const API_URL = 'http://localhost:8000/api';
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, { headers, ...options });
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = 'admin-login.html';
        }
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}
