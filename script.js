// app.js (Frontend Client)
const API_URL = 'https://api-danzymarket.vercel.app/api';

async function executeOrderProcess(game, product, price) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showToast("Silahkan login terlebih dahulu untuk melanjutkan transaksi", "error");
    showLoginModal(); // Tampilkan popup login tanpa pindah halaman
    return;
  }

  const accountId = document.getElementById('accountIdInput').value; // Misal: User ID + Zone ID
  const paymentMethod = document.querySelector('.payment-method.selected').dataset.method;

  try {
    // Skeleton Loading / Button Spinner On
    document.getElementById('checkoutBtn').innerText = 'Memproses...';
    
    const response = await fetch(`${API_URL}/transaction/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // JWT Auth
      },
      body: JSON.stringify({ game, account_id: accountId, product, price, payment_method })
    });

    const data = await response.json();

    if (response.ok) {
      showToast(`Invoice ${data.invoice} Berhasil Dibuat!`, "success");
      // Arahkan ke halaman Cek Pesanan / Pembayaran
      window.location.href = `/invoice.html?id=${data.invoice}`;
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Terjadi kesalahan pada server", "error");
  } finally {
    document.getElementById('checkoutBtn').innerText = 'Beli Sekarang ⚡';
  }
}

// Fungsi Toast Notification Modern
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} smooth`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
