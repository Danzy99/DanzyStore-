// ==========================================================================
// GAME DATABASE & PRODUCTS INITIALIZATION
// ==========================================================================
const GAMES_DATABASE = {
    mlbb: {
        id: "mlbb",
        name: "Mobile Legends",
        tagline: "Diamonds Instan",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80",
        fields: [
            { id: "user_id", label: "User ID", placeholder: "Masukkan User ID" },
            { id: "server", label: "Zone ID", placeholder: "Zona" }
        ],
        products: [
            { id: "ml_86", name: "86 Diamonds", price: 20000 },
            { id: "ml_172", name: "172 Diamonds", price: 40000 },
            { id: "ml_257", name: "257 Diamonds", price: 60000 },
            { id: "ml_706", name: "706 Diamonds", price: 150000 },
            { id: "ml_1412", name: "1412 Diamonds", price: 300000 }
        ]
    },
    ff: {
        id: "ff",
        name: "Free Fire",
        tagline: "Diamonds Fast Delivery",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80",
        fields: [
            { id: "user_id", label: "Player ID", placeholder: "Masukkan Player ID" }
        ],
        products: [
            { id: "ff_140", name: "140 Diamonds", price: 19000 },
            { id: "ff_355", name: "355 Diamonds", price: 45000 },
            { id: "ff_720", name: "720 Diamonds", price: 90000 },
            { id: "ff_1440", name: "1440 Diamonds", price: 180000 }
        ]
    },
    pubg: {
        id: "pubg",
        name: "PUBG Mobile",
        tagline: "Unknown Cash (UC)",
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=300&q=80",
        fields: [
            { id: "user_id", label: "Character ID", placeholder: "Masukkan Character ID" }
        ],
        products: [
            { id: "pubg_60", name: "60 UC", price: 15000 },
            { id: "pubg_325", name: "325 UC", price: 70000 },
            { id: "pubg_660", name: "660 UC", price: 140000 },
            { id: "pubg_1800", name: "1800 UC", price: 380000 }
        ]
    },
    valorant: {
        id: "valorant",
        name: "Valorant",
        tagline: "Riot Points / VP",
        image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=300&q=80",
        fields: [
            { id: "user_id", label: "Riot ID + Tag", placeholder: "contoh: Danzy#ID1" }
        ],
        products: [
            { id: "val_475", name: "475 VP", price: 55000 },
            { id: "val_1000", name: "1000 VP", price: 110000 },
            { id: "val_2050", name: "2050 VP", price: 220000 },
            { id: "val_5300", name: "5300 VP", price: 550000 }
        ]
    },
    roblox: {
        id: "roblox",
        name: "Roblox",
        tagline: "Robux Voucher",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80",
        fields: [
            { id: "user_id", label: "Roblox Username", placeholder: "Masukkan Username" }
        ],
        products: [
            { id: "rb_400", name: "400 Robux", price: 75000 },
            { id: "rb_800", name: "800 Robux", price: 145000 },
            { id: "rb_1700", name: "1700 Robux", price: 290000 },
            { id: "rb_4500", name: "4500 Robux", price: 790000 }
        ]
    }
};

const PAYMENT_METHODS = [
    { id: "QRIS", name: "QRIS All Payment", label: "QRIS" },
    { id: "DANA", name: "DANA Wallet", label: "DANA" },
    { id: "OVO", name: "OVO Cash", label: "OVO" },
    { id: "GOPAY", name: "GoPay E-Money", label: "GOPAY" },
    { id: "BANK", name: "Bank Central Asia (BCA)", label: "BANK" }
];

let SELECTED_GAME = null;
let SELECTED_PRODUCT = null;
let SELECTED_PAYMENT = null;

// Seed data awal jika LocalStorage masih kosong
function initLocalStorageDB() {
    if (!localStorage.getItem("danzy_transactions")) {
        const seedData = [
            {
                invoice: "DZ-20260628-1024",
                game: "Mobile Legends",
                user_id: "87654321",
                server: "1234",
                produk: "257 Diamonds",
                harga: 60000,
                pembayaran: "QRIS",
                status: "Selesai",
                tanggal: "28 Jun 2026, 10:14"
            }
        ];
        localStorage.setItem("danzy_transactions", JSON.stringify(seedData));
    }
}

function getTransactions() {
    return JSON.parse(localStorage.getItem("danzy_transactions")) || [];
}

function saveTransaction(tx) {
    const txs = getTransactions();
    txs.unshift(tx);
    localStorage.setItem("danzy_transactions", JSON.stringify(txs));
}

// SPA Routing Router
function navigateTo(viewId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const viewNode = document.getElementById(`view-${viewId}`);
    if (viewNode) viewNode.classList.remove('hidden');

    const menuBtn = document.getElementById(`nav-${viewId}`);
    if (menuBtn) menuBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

function toggleLoading(show, text = "Memproses Data...") {
    const screen = document.getElementById("loading-screen");
    const textNode = screen.querySelector(".loading-text");
    if (textNode) textNode.innerText = text;
    show ? screen.classList.remove("hidden") : screen.classList.add("hidden");
}

// Render Grid Game di Home
function renderGamesGrid() {
    const grid = document.getElementById("game-list-container");
    grid.innerHTML = "";
    Object.values(GAMES_DATABASE).forEach(game => {
        const card = document.createElement("div");
        card.className = "glass-card game-card";
        card.onclick = () => selectGameView(game.id);
        card.innerHTML = `
            <div class="game-card-img-wrap"><img src="${game.image}" alt="${game.name}"></div>
            <h4>${game.name}</h4><p>${game.tagline}</p>
        `;
        grid.appendChild(card);
    });
}

// Render Halaman Form Pembelian Game Terpilih
function selectGameView(gameId) {
    SELECTED_GAME = GAMES_DATABASE[gameId];
    SELECTED_PRODUCT = null;
    SELECTED_PAYMENT = null;

    document.getElementById("detail-game-image").src = SELECTED_GAME.image;
    document.getElementById("detail-game-name").innerText = SELECTED_GAME.name;

    const inputsWrap = document.getElementById("inputs-container");
    inputsWrap.innerHTML = "";
    SELECTED_GAME.fields.forEach(field => {
        const group = document.createElement("div");
        group.className = "form-field";
        group.innerHTML = `
            <label>${field.label}</label>
            <input type="text" id="input-${field.id}" placeholder="${field.placeholder}" class="form-control-input">
        `;
        inputsWrap.appendChild(group);
    });

    const nominalsWrap = document.getElementById("nominal-container");
    nominalsWrap.innerHTML = "";
    SELECTED_GAME.products.forEach(prod => {
        const item = document.createElement("div");
        item.className = "nominal-item-card";
        item.id = `prod-${prod.id}`;
        item.onclick = () => selectProduct(prod);
        item.innerHTML = `
            <div class="nominal-title">${prod.name}</div>
            <div class="nominal-price">Rp ${prod.price.toLocaleString('id-ID')}</div>
        `;
        nominalsWrap.appendChild(item);
    });

    const paymentsWrap = document.getElementById("payment-container");
    paymentsWrap.innerHTML = "";
    PAYMENT_METHODS.forEach(pay => {
        const item = document.createElement("div");
        item.className = "payment-item-card";
        item.id = `pay-${pay.id}`;
        item.onclick = () => selectPaymentMethod(pay);
        item.innerHTML = `
            <div class="payment-left-node">
                <span class="payment-logo-mock">${pay.label}</span>
                <span class="payment-name">${pay.name}</span>
            </div>
            <div class="payment-price-tag" id="pay-price-${pay.id}">-</div>
        `;
        paymentsWrap.appendChild(item);
    });

    navigateTo("game-detail");
}

function selectProduct(product) {
    SELECTED_PRODUCT = product;
    document.querySelectorAll(".nominal-item-card").forEach(el => el.classList.remove("selected"));
    document.getElementById(`prod-${product.id}`).classList.add("selected");
    PAYMENT_METHODS.forEach(pay => {
        document.getElementById(`pay-price-${pay.id}`).innerText = `Rp ${product.price.toLocaleString('id-ID')}`;
    });
}

function selectPaymentMethod(payment) {
    if (!SELECTED_PRODUCT) {
        showToast("Silakan pilih nominal produk terlebih dahulu!", "error");
        return;
    }
    SELECTED_PAYMENT = payment;
    document.querySelectorAll(".payment-item-card").forEach(el => el.classList.remove("selected"));
    document.getElementById(`pay-${payment.id}`).classList.add("selected");
}

// Checkout & Pembuatan Invoice Otomatis
function processCheckout() {
    if (!SELECTED_GAME) return;
    let accountData = {};
    let missingField = false;
    
    SELECTED_GAME.fields.forEach(field => {
        const inputVal = document.getElementById(`input-${field.id}`).value.trim();
        if (!inputVal) missingField = true;
        accountData[field.id] = inputVal;
    });

    if (missingField) { showToast("Mohon lengkapi seluruh kolom data ID Akun Anda!", "error"); return; }
    if (!SELECTED_PRODUCT) { showToast("Pilih salah satu item nominal top up!", "error"); return; }
    if (!SELECTED_PAYMENT) { showToast("Pilih salah satu opsi metode pembayaran!", "error"); return; }

    toggleLoading(true, "Menghubungkan ke payment gateway...");
    setTimeout(() => {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const randSeed = Math.floor(1000 + Math.random() * 9000);
        const generatedInvoice = `DZ-${year}${month}${day}-${randSeed}`;
        
        const timestampString = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;

        const newTx = {
            invoice: generatedInvoice,
            game: SELECTED_GAME.name,
            user_id: accountData.user_id,
            server: accountData.server || "-",
            produk: SELECTED_PRODUCT.name,
            harga: SELECTED_PRODUCT.price,
            pembayaran: SELECTED_PAYMENT.id,
            status: "Pending",
            tanggal: timestampString
        };

        saveTransaction(newTx);
        toggleLoading(false);
        showToast("Invoice berhasil diterbitkan!", "success");
        openPaymentModal(newTx);
    }, 1200);
}

let CURRENT_ACTIVE_MODAL_INVOICE = null;

function openPaymentModal(tx) {
    CURRENT_ACTIVE_MODAL_INVOICE = tx.invoice;
    const body = document.getElementById("modal-payment-body");
    let instructionHtml = tx.pembayaran === "BANK" ? `
        <div class="bank-transfer-box">
            <p>Transfer Bank Virtual Account BCA</p>
            <div class="account-number">8720 0124 ${Math.floor(1000 + Math.random()*9000)}</div>
            <small class="text-muted">Atas Nama: PT DANZY CIPTA DIGITAL</small>
        </div>` : `
        <p class="text-center text-muted">Pindai kode QRIS di bawah ini untuk menyelesaikan pembayaran.</p>
        <div class="payment-qr-mock"><div class="payment-qr-inner"></div></div>`;

    body.innerHTML = `
        <div class="receipt-row"><span class="receipt-label">No. Invoice</span><span class="receipt-value text-cyan">${tx.invoice}</span></div>
        <div class="receipt-row"><span class="receipt-label">Item</span><span class="receipt-value">${tx.game} — ${tx.produk}</span></div>
        <div class="receipt-row"><span class="receipt-label">Tujuan ID</span><span class="receipt-value">${tx.user_id} (${tx.server})</span></div>
        <div class="receipt-row"><span class="receipt-label">Metode</span><span class="receipt-value">${tx.pembayaran}</span></div>
        ${instructionHtml}
        <div class="receipt-row receipt-total"><span>Total Tagihan</span><span class="text-orange">Rp ${tx.harga.toLocaleString('id-ID')}</span></div>
    `;
    document.getElementById("payment-modal").classList.remove("hidden");
}

function closePaymentModal() {
    document.getElementById("payment-modal").classList.add("hidden");
    if(CURRENT_ACTIVE_MODAL_INVOICE) {
        document.getElementById("check-invoice-input").value = CURRENT_ACTIVE_MODAL_INVOICE;
        handleSearchInvoice();
        navigateTo("check");
    }
}

function confirmPaymentFromModal() {
    toggleLoading(true, "Memverifikasi dana masuk...");
    setTimeout(() => {
        const txs = getTransactions();
        const idx = txs.findIndex(t => t.invoice === CURRENT_ACTIVE_MODAL_INVOICE);
        if (idx !== -1) { txs[idx].status = "Diproses"; localStorage.setItem("danzy_transactions", JSON.stringify(txs)); }
        toggleLoading(false);
        showToast("Pembayaran Anda diterima! Pesanan kini sedang diproses.", "success");
        closePaymentModal();
    }, 1200);
}

// Cek Transaksi / Pelacakan Invoice Customer
function handleSearchInvoice() {
    const query = document.getElementById("check-invoice-input").value.trim();
    const card = document.getElementById("invoice-result-card");
    if(!query) { showToast("Masukkan kode invoice valid!", "error"); return; }

    const txs = getTransactions();
    const found = txs.find(t => t.invoice.toLowerCase() === query.toLowerCase());
    if (!found) { showToast("Invoice tidak ditemukan!", "error"); card.classList.add("hidden"); return; }

    card.innerHTML = `
        <div class="receipt-header text-center"><h4>Rincian Transaksi</h4><p class="text-muted">${found.tanggal}</p></div>
        <div class="receipt-row"><span class="receipt-label">No Invoice</span><span class="receipt-value text-cyan">${found.invoice}</span></div>
        <div class="receipt-row"><span class="receipt-label">Game</span><span class="receipt-value">${found.game}</span></div>
        <div class="receipt-row"><span class="receipt-label">Target ID</span><span class="receipt-value">${found.user_id} ${found.server !== '-' ? `(Z: ${found.server})` : ''}</span></div>
        <div class="receipt-row"><span class="receipt-label">Item</span><span class="receipt-value">${found.produk}</span></div>
        <div class="receipt-row"><span class="receipt-label">Status</span><span class="status-pill ${found.status.toLowerCase()}">${found.status}</span></div>
        <div class="receipt-row receipt-total"><span>Total</span><span class="text-orange">Rp ${found.harga.toLocaleString('id-ID')}</span></div>
    `;
    card.classList.remove("hidden");
}

// ==========================================================================
// ADMIN MODE ENGINE
// ==========================================================================
let ADMIN_MODE_ACTIVE = false;

function toggleAdminPanel() {
    if (!ADMIN_MODE_ACTIVE) {
        const password = prompt("Masukkan Password Otoritas Akses Admin:");
        if (password === "admin") { // Password default untuk masuk admin panel
            ADMIN_MODE_ACTIVE = true;
            showToast("Akses Admin Diterima!", "success");
            renderAdminDashboardRows();
            navigateTo("admin");
        } else { showToast("Sandi Salah!", "error"); }
    } else {
        renderAdminDashboardRows(); navigateTo("admin");
    }
}

function renderAdminDashboardRows() {
    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = "";
    const txs = getTransactions();
    if(txs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Belum ada riwayat transaksi masuk.</td></tr>`; return;
    }
    txs.forEach(tx => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-cyan font-weight-700">${tx.invoice}</td>
            <td>${tx.tanggal}</td>
            <td><strong>${tx.game}</strong></td>
            <td>${tx.user_id} ${tx.server !== '-' ? `(${tx.server})` : ''}</td>
            <td>${tx.produk}</td>
            <td class="text-orange">Rp ${tx.harga.toLocaleString('id-ID')}</td>
            <td><span class="badge">${tx.pembayaran}</span></td>
            <td>
                <select class="admin-select-status" onchange="updateTransactionStatus('${tx.invoice}', this.value)">
                    <option value="Pending" ${tx.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Diproses" ${tx.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                    <option value="Selesai" ${tx.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                </select>
            </td>
            <td><button class="btn-table-del" onclick="deleteTransactionRow('${tx.invoice}')">Hapus</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateTransactionStatus(invoice, newStatus) {
    const txs = getTransactions();
    const idx = txs.findIndex(t => t.invoice === invoice);
    if(idx !== -1) {
        txs[idx].status = newStatus;
        localStorage.setItem("danzy_transactions", JSON.stringify(txs));
        showToast(`Invoice ${invoice} diubah ke: ${newStatus}`, "success");
        if (!document.getElementById("invoice-result-card").classList.contains("hidden")) handleSearchInvoice();
    }
}

function deleteTransactionRow(invoice) {
    if(confirm(`Hapus transaksi ${invoice}?`)) {
        let txs = getTransactions();
        txs = txs.filter(t => t.invoice !== invoice);
        localStorage.setItem("danzy_transactions", JSON.stringify(txs));
        showToast("Transaksi dihapus!", "info");
        renderAdminDashboardRows();
    }
}

function clearAllTransactions() {
    if(confirm("Hapus seluruh database transaksi?")) {
        localStorage.removeItem("danzy_transactions");
        showToast("Database dibersihkan!", "info");
        renderAdminDashboardRows();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initLocalStorageDB();
    renderGamesGrid();
    navigateTo("home");
});
