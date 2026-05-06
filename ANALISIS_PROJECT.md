# ANALISIS PROJECT NITA SALON BOOKING SYSTEM

## 1. STRUKTUR PROJECT SAAT INI

### Frontend (HTML/JS)
```
/
├── index.html                    (Home page - OK)
├── booking.html                  (Form booking - PERLU REVISI)
├── checkout.html                 (Payment page - PERLU REVISI)
├── booking-confirmation.html     (Konfirmasi - PERLU REVISI)
├── payment-success.html          (Sukses - PERLU REVISI)
├── payment-failed.html           (Gagal - OK)
├── check-status.html             (Cek status - OK)
│
├── css/
│   └── style.css
│
└── js/
    ├── api.js                    (API helper - PERLU TAMBAH)
    ├── booking.js                (Booking logic - PERLU REVISI)
    └── payment.js                (Payment logic - PERLU BUAT ULANG)
```

## 2. MASALAH YANG DITEMUKAN

### Problem A: Alur Booking Tidak Terhubung ke Payment
- ✅ booking.html → form booking OK
- ❌ Tombol "Konfirmasi Booking" tidak redirect ke checkout.html
- ❌ Data booking tidak dikirim ke checkout.html
- ❌ checkout.html tidak menerima data booking

### Problem B: Checkout Tidak Terhubung ke Midtrans
- ❌ Snap.js dimuat tapi tidak digunakan
- ❌ Tombol "Bayar Sekarang" hanya simulasi
- ❌ Tidak ada payment transaction ke backend

### Problem C: Payment Success Tidak Auto-Redirect WhatsApp
- ❌ payment-success.html tampil manual, bukan otomatis
- ❌ Tidak ada WhatsApp auto-redirect setelah pembayaran sukses
- ❌ Pesan WhatsApp tidak otomatis terisi data

### Problem D: Backend Belum Ada
- ❌ Tidak ada API endpoint untuk payment
- ❌ Tidak ada webhook untuk Midtrans callback
- ❌ Tidak ada database update payment status

## 3. SOLUSI YANG AKAN DIIMPLEMENTASI

### Flow Baru (Correct):
```
booking.html 
  ↓ (User fill form & click "Konfirmasi Booking")
booking.js: handleBookingSubmit()
  ↓ (Validasi & simpan ke sessionStorage)
checkout.html (Auto-load booking data)
  ↓ (User click "Bayar Sekarang")
payment.js: initiatePayment()
  ↓ (Buat transaksi ke backend → dapatkan snap_token)
Midtrans Snap Popup
  ↓ (User bayar)
Backend: /transactions/callback (Webhook Midtrans)
  ↓ (Verifikasi & update database)
payment.js: handlePaymentSuccess()
  ↓ (Update localStorage)
payment-success.html
  ↓ (Auto-redirect ke WhatsApp dalam 3 detik)
https://wa.me/6287781232445?text=...
  ↓ (Admin receive notification)
Admin confirm di WhatsApp
```

## 4. PERUBAHAN YANG DIBUTUHKAN

### Frontend
1. ✏️ **booking.html** - Ubah tombol dari "Konfirmasi Booking" → "Bayar Sekarang"
2. ✏️ **booking.js** - Ubah handler: redirect ke checkout.html
3. ✏️ **checkout.html** - Auto-load booking data dari sessionStorage
4. ✏️ **payment.js** - Implementasi Midtrans Snap payment gateway
5. ✏️ **payment-success.html** - Auto-redirect ke WhatsApp dalam 3 detik
6. ✏️ **api.js** - Tambah endpoint untuk payment transaction

### Backend (Node.js/PHP)
1. 🆕 POST `/api/transactions` - Create payment transaction
2. 🆕 POST `/api/transactions/callback` - Webhook Midtrans
3. ✏️ POST `/api/bookings` - Update untuk payment flow
4. 🆕 Database: tambah kolom payment_status, transaction_id

## 5. FILE STRUCTURE BARU

```
/backend
├── config/
│   └── midtrans.js              (Konfigurasi Midtrans)
│
├── routes/
│   ├── bookings.js              (Booking routes)
│   └── transactions.js          (Payment routes)
│
├── controllers/
│   ├── bookingController.js
│   └── transactionController.js
│
├── middleware/
│   └── verifyMidtrans.js        (Verify webhook signature)
│
└── models/
    └── Booking.js               (Database schema)

/frontend
├── booking.html                 (REVISI)
├── checkout.html                (REVISI)
├── payment-success.html         (REVISI)
│
├── js/
│   ├── api.js                   (REVISI)
│   ├── booking.js               (REVISI)
│   └── payment.js               (BUAT ULANG)
```

## 6. DATA FLOW

### A. Booking Submit (booking.js)
```
Form submit
  ↓
Validasi input
  ↓
Simpan selectedServices ke window variable
  ↓
Buat bookingRecord object:
{
  queue_number: "A-20260506-001",
  booking_id: "BK-1234567890",
  customer_name: "John Doe",
  customer_phone: "081234567890",
  customer_email: "john@example.com",
  date: "2026-05-10",
  time: "14:00",
  services: [{id, name, price, duration}, ...],
  total_price: 250000,
  total_duration: 90,
  status: "Pending Payment",
  created_at: ISO string
}
  ↓
sessionStorage.setItem('bookingData', JSON.stringify(bookingRecord))
localStorage.setItem('offlineBookings', ...)
  ↓
window.location.href = 'checkout.html'
```

### B. Checkout Load (payment.js)
```
DOMContentLoaded
  ↓
sessionStorage.getItem('bookingData')
  ↓
Parse & display on page
  ↓
window.currentBooking = bookingRecord
```

### C. Payment Process (payment.js)
```
Click "Bayar Sekarang"
  ↓
initiatePayment()
  ↓
POST /api/transactions
{
  booking_id: "BK-...",
  customer_name: "John",
  customer_email: "john@...",
  customer_phone: "081...",
  amount: 250000,
  services: [...]
}
  ↓
Backend create SNAP token
  ↓
Response: {snap_token: "xxx"}
  ↓
snap.pay(snap_token, {
  onSuccess: handlePaymentSuccess,
  onError: handlePaymentError,
  onPending: handlePaymentPending
})
  ↓
User complete payment
  ↓
snap.onSuccess callback
```

### D. Payment Callback (Backend)
```
Midtrans POST to /api/transactions/callback
  ↓
Verify signature
  ↓
Update bookings table: status = "Paid"
  ↓
Update bookings table: payment_id = transaction_id
  ↓
Return 200 OK
```

### E. Success Redirect
```
handlePaymentSuccess() callback
  ↓
Update localStorage: status = "Paid"
  ↓
window.location.href = 'payment-success.html?transaction=XXX&booking=XXX'
```

### F. Payment Success Page
```
Load payment-success.html
  ↓
setTimeout 3 detik
  ↓
Build WhatsApp URL dengan data booking
  ↓
window.location.href = 'https://wa.me/6287781232445?text=...'
```

## 7. SECURITY MEASURES

✅ **Signature Verification**
- Midtrans callback signature diverifikasi dengan Server Key
- Prevent fake webhook calls

✅ **Session Protection**
- Booking data disimpan di sessionStorage (tab-specific)
- Payment status verified di backend sebelum update database

✅ **Status Validation**
- Payment tidak bisa diubah dari "Pending" ke "Paid" tanpa callback valid
- Transaction ID wajib ada di webhook

✅ **Anti-Bypass**
- Frontend hanya trigger pembayaran
- Backend yang update database
- WhatsApp redirect hanya setelah payment valid

## 8. TESTING CHECKLIST

- [ ] Booking form submit → redirect checkout
- [ ] Checkout load & display booking data
- [ ] Click "Bayar Sekarang" → Midtrans popup
- [ ] Complete payment → Success page
- [ ] Success page → Auto WhatsApp redirect (3 detik)
- [ ] WhatsApp message terisi otomatis
- [ ] Payment status di database berubah ke "Paid"
- [ ] Cancel payment → error page
- [ ] Failed payment → error page
- [ ] Offline fallback (generate queue number lokal)

## 9. GO-LIVE CHECKLIST

- [ ] Backend deployed (production)
- [ ] Database migrations selesai
- [ ] Midtrans sandbox testing OK
- [ ] Midtrans production keys configured
- [ ] All API endpoints tested
- [ ] Webhook callback tested
- [ ] Error handling tested
- [ ] Security headers added
- [ ] CORS configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set
- [ ] Backup database configured

