// TC-2: Inisialisasi Data dari Local Storage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart = null;

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');

// Fungsi Format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// PERBAIKAN 1: Mengembalikan fungsi updateApp() yang terhapus
function updateApp() {
    // 1. Hitung Total Balance
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    totalBalanceEl.textContent = formatRupiah(total);

    // 2. Render Ulang Scrollable List
    transactionList.innerHTML = '';
    expenses.forEach((item) => {
        const li = document.createElement('li');
        li.className = item.category; // Untuk warna border CSS
        li.innerHTML = `
            <div class="item-info">
                <span class="name">${item.name}</span>
                <span class="cat">${item.category}</span>
            </div>
            <div class="item-amount-delete">
                <span class="amount">${formatRupiah(item.amount)}</span>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">×</button>
            </div>
        `;
        transactionList.appendChild(li);
    });

    // 3. Simpan Perubahan Terbaru ke Local Storage
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // 4. Perbarui Visual Pie Chart
    updateChart();
}

// Fungsi Tambah Item Baru
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validasi dasar bahwa semua field terisi
    if (!itemNameInput.value.trim() || !amountInput.value || !categoryInput.value) {
        alert('Mohon isi semua field dengan benar!');
        return;
    }

    const newItem = {
        id: Date.now().toString(), // ID Unik berbasis waktu
        name: itemNameInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: categoryInput.value
    };

    expenses.push(newItem);
    updateApp();

    // Reset Form Input setelah sukses
    expenseForm.reset();
});

// Fungsi Hapus Item berdasarkan ID
window.deleteItem = function(id) {
    expenses = expenses.filter(item => item.id !== id);
    updateApp();
};

// PERBAIKAN 2: Membersihkan duplikasi fungsi & menyatukan logika kategori dengan Form HTML
function updateChart() {
    const categories = { Makanan: 0, Belanja: 0, Transportasi: 0, Fun: 0 };
    expenses.forEach(item => {
        if (categories[item.category] !== undefined) {
            categories[item.category] += item.amount;
        }
    });

    // Susun data array searah dengan isi variabel di atas
    const chartData = [categories.Makanan, categories.Belanja, categories.Transportasi, categories.Fun];
    const ctx = document.getElementById('expense-chart'); // Perbaikan 3: Ambil elemen langsung tanpa .getContext('2d')

    // Cek apakah elemen canvas ditemukan di HTML
    if (!ctx) return;

    // Jika grafik belum diinisialisasi
    if (expenseChart === null) {
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Makanan', 'Belanja', 'Transportasi', 'Fun'],
                datasets: [{
                    data: chartData,
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    } else {
        // Jika grafik sudah ada, update datanya langsung ke indeks array yang tepat
        expenseChart.data.datasets[0].data = chartData;
        expenseChart.update();
    }
}

// Render tampilan awal ketika halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', updateApp);
