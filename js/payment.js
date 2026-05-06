// ─── KONFIGURASI ──────────────────────────────────────────────────────

const API_URL = 'http://localhost:8000/api';
const WHATSAPP_NUMBER = '6287781232445';

// ─── INIT ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    loadBookingData();
    startCountdown();
    document.getElementById('payBtn').addEventListener('click', initiatePayment);
});

// ─── LOAD BOOKING DATA ──────────────────────────────────────────────────────

function loadBookingData() {
    try {
        const bookingJson = sessionStorage.getItem('bookingData');
        if (!bookingJson) {
            showAlert('Data booking tidak ditemukan. Kembali ke halaman booking.', 'danger');
            setTimeout(() => window.location.href = 'booking.html', 2000);
            return;
        }

        const booking = JSON.parse(bookingJson);

        // Render customer info
        document.getElementById('customerInfo').innerHTML = `
            <div>
                <p class="mb-1"><strong>Nama:</strong> ${booking.customer_name}</p>
                <p class="mb-1"><strong>WhatsApp:</strong> ${booking.customer_phone}</p>
                ${booking.customer_email ? `<p class="mb-0"><strong>Email:</strong> ${booking.customer_email}</p>` : ''}
            </div>
        `;

        // Render services list
        const servicesHtml = (booking.services || []).map(s => `
            <div class="order-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${s.name}</h6>
                        <small class="text-muted">${s.duration} menit</small>
                    </div>
                    <div class="text-end">
                        <strong style="color:#C47D8F;">Rp ${Number(s.price).toLocaleString('id-ID')}</strong>
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('servicesList').innerHTML = servicesHtml;

        // Update totals
        const totalDuration = booking.total_duration || 0;
        const totalPrice = booking.total_price || 0;

        document.getElementById('totalDuration').textContent = totalDuration;
        document.getElementById('totalPrice').textContent = `Rp ${Number(totalPrice).toLocaleString('id-ID')}`;
        document.getElementById('btnTotalPrice').textContent = `Rp ${Number(totalPrice).toLocaleString('id-ID')}`;

        // Store untuk digunakan saat pembayaran
        window.currentBooking = booking;

    } catch (error) {
        console.error('Error loading booking data:', error);
        showAlert('Terjadi kesalahan membaca data. Silakan refresh halaman.', 'danger');
    }
}

// ─── COUNTDOWN TIMER ───────────────────────────────────────────────────────

function startCountdown() {
    let timeLeft = 15 * 60; // 15 menit dalam detik

    const updateCountdown = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = display;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('payBtn').disabled = true;
            showAlert('Waktu pembayaran telah habis. Silakan buat booking baru.', 'warning');
        }
        timeLeft--;
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// ─── SELECT PAYMENT METHOD ─────────────────────────────────────────────────

function selectMethod(element, method) {
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');
    window.selectedPaymentMethod = method;

    const methodName = {
        'all': 'Semua metode pembayaran',
        'gopay': 'GoPay',
        'bank_transfer': 'Transfer Bank',
        'qris': 'QRIS',
        'credit_card': 'Kartu Kredit',
        'shopeepay': 'ShopeePay'
    };

    document.getElementById('selectedMethodInfo').innerHTML = `
        <i class="fas fa-check-circle me-1"></i>
        Metode pembayaran: <strong>${methodName[method]}</strong>
    `;
}

// ─── INITIATE PAYMENT ──────────────────────────────────────────────────────

async function initiatePayment() {
    if (!window.currentBooking) {
        showAlert('Data booking tidak ditemukan', 'danger');
        return;
    }

    const booking = window.currentBooking;
    const payBtn = document.getElementById('payBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    payBtn.disabled = true;
    loadingOverlay.classList.add('show');
    loadingText.textContent = 'Menyiapkan pembayaran...';

    try {
        // 1) Buat transaksi di backend
        const transactionResponse = await apiCall('/transactions', {
            method: 'POST',
            body: JSON.stringify({
                booking_id: booking.booking_id,
                customer_name: booking.customer_name,
                customer_email: booking.customer_email || 'customer@nitasalon.com',
                customer_phone: booking.customer_phone,
                amount: booking.total_price,
                services: booking.services.map(s => ({ name: s.name, price: s.price, quantity: 1 })),
                payment_method: window.selectedPaymentMethod || 'all'
            })
        });

        if (!transactionResponse.success || !transactionResponse.data) {
            throw new Error(transactionResponse.message || 'Gagal membuat transaksi');
        }

        const snapToken = transactionResponse.data.snap_token;

        loadingText.textContent = 'Membuka portal pembayaran...';

        // 2) Trigger Snap popup
        if (typeof snap !== 'undefined') {
            snap.pay(snapToken, {
                onSuccess: function (result) {
                    handlePaymentSuccess(result, booking);
                },
                onPending: function (result) {
                    handlePaymentPending(result, booking);
                },
                onError: function (result) {
                    handlePaymentError(result);
                },
                onClose: function () {
                    loadingOverlay.classList.remove('show');
                    payBtn.disabled = false;
                    showAlert('Anda menutup popup pembayaran.', 'info');
                }
            });
        } else {
            throw new Error('Snap.js tidak berhasil dimuat. Periksa client key Midtrans.');
        }

    } catch (error) {
        console.error('Payment error:', error);
        loadingOverlay.classList.remove('show');
        payBtn.disabled = false;
        showAlert(`Terjadi kesalahan: ${error.message}`, 'danger');
    }
}

// ─── PAYMENT SUCCESS ────────────────────────────────────────────────────────

async function handlePaymentSuccess(result, booking) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    loadingText.textContent = 'Pembayaran berhasil! Memproses...';

    try {
        // Update status booking ke "Terbayar"
        await apiCall(`/bookings/${booking.booking_id}/payment-success`, {
            method: 'POST',
            body: JSON.stringify({
                transaction_id: result.transaction_id,
                payment_type: result.payment_type,
                gross_amount: result.gross_amount
            })
        });

        // Simpan record lokal
        const allBookings = JSON.parse(localStorage.getItem('offlineBookings') || '[]');
        const idx = allBookings.findIndex(b => b.booking_id === booking.booking_id);
        if (idx > -1) {
            allBookings[idx].status = 'Terbayar';
            allBookings[idx].payment_id = result.transaction_id;
            localStorage.setItem('offlineBookings', JSON.stringify(allBookings));
        }

        loadingOverlay.classList.remove('show');

        // Buat WhatsApp notification
        const message = buildWhatsAppMessage(booking, 'Pembayaran berhasil!');
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        // Redirect ke halaman sukses
        setTimeout(() => {
            window.location.href = `payment-success.html?transaction=${result.transaction_id}&booking=${booking.booking_id}`;
        }, 1500);

    } catch (error) {
        console.error('Error updating payment:', error);
        loadingOverlay.classList.remove('show');
        showAlert('Pembayaran diterima tapi gagal menyimpan data. Hubungi admin.', 'warning');
    }
}

// ─── PAYMENT PENDING ────────────────────────────────────────────────────────

function handlePaymentPending(result, booking) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('show');

    showAlert('Pembayaran Anda masih diproses. Kami akan mengonfirmasi via WhatsApp.', 'info');

    setTimeout(() => {
        window.location.href = `check-status.html?queue=${booking.queue_number}`;
    }, 2000);
}

// ─── PAYMENT ERROR ─────────────────────────────────────────────────────────

function handlePaymentError(result) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const payBtn = document.getElementById('payBtn');

    loadingOverlay.classList.remove('show');
    payBtn.disabled = false;

    showAlert(`Pembayaran gagal: ${result.status_message}`, 'danger');
}

// ─── BUILD WHATSAPP MESSAGE ───────────────────────────────────────────────

function buildWhatsAppMessage(booking, status) {
    const dateFormatted = new Date(booking.date).toLocaleDateString('id-ID');
    const servicesList = (booking.services || []).map(s => s.name).join(', ');

    return `
Halo Nita Salon!

${status}

Detail Booking:
📋 Nomor Antrian: ${booking.queue_number}
👤 Nama: ${booking.customer_name}
📅 Tanggal: ${dateFormatted}
🕐 Jam: ${booking.time}
✂️ Layanan: ${servicesList}
💰 Total: Rp ${Number(booking.total_price).toLocaleString('id-ID')}

Terima kasih!
    `.trim();
}

// ─── ALERT HELPER ─────────────────────────────────────────────────────────

function showAlert(message, type = 'info') {
    const wrapper = document.createElement('div');
    wrapper.className = 'position-fixed top-0 start-50 translate-middle-x mt-3';
    wrapper.style.zIndex = '9999';
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" style="min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.appendChild(wrapper);

    const alert = new bootstrap.Alert(wrapper.querySelector('.alert'));
    setTimeout(() => {
        alert.close();
        wrapper.remove();
    }, 4000);
}

// ─── API HELPER ────────────────────────────────────────────────────────────

async function apiCall(endpoint, options = {}) {
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
