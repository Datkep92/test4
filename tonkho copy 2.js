// Module quản lý tồn kho

// Khởi tạo module: Thiết lập các listeners
function initStockModule() {
    // 1. Tìm kiếm sản phẩm: Lắng nghe sự kiện nhập liệu để lọc danh sách tồn kho
    const searchInput = document.getElementById('search-stock');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            renderStock(e.target.value);
        });
    }

    // 2. Lọc theo loại sản phẩm (CK/KM/Hàng hóa)
    const filterButtons = document.querySelectorAll('.stock-filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            renderStock('', filterType);
            
            // Cập nhật trạng thái active
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}
// =======================
// Hàm lọc sản phẩm theo phân loại (Được giữ nguyên)
// =======================
function filterProductsByCategory(products, category) {
  if (!category || category === 'all') return products;
  return products.filter(p => p.category === category);
}

// =======================
// Hàm lấy danh sách phân loại từ tồn kho
// =======================
function getStockCategories(hkd) {
  const categories = new Set();
  hkd.tonkhoMain.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return Array.from(categories);
}
/**
 * Hiển thị thống kê tồn kho
 */
function updateStockStats() {
    const statsContainer = document.getElementById('stock-stats');
    if (!statsContainer || !window.currentCompany || !window.hkdData[window.currentCompany]) return;

    const hkd = window.hkdData[window.currentCompany];
    
    let totalQuantity = 0;
    let totalProducts = 0;
    let totalValue = 0;
    const productMap = new Map();

    hkd.tonkhoMain.forEach(product => {
        // Chỉ tính toán số lượng và giá trị cho Hàng hóa thường
        if (product.category === 'hang_hoa' && product.quantity > 0) { 
            totalQuantity += product.quantity;
            totalValue += product.amount;
            
            if (!productMap.has(product.msp)) {
                productMap.set(product.msp, true);
                totalProducts++;
            }
        }
    });

    statsContainer.innerHTML = `
        <div class="stats-grid-stock">
            <div class="stat-card-stock">
                <div class="stat-icon">📦</div>
                <div class="stat-value-stock">${totalQuantity.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</div>
                <div class="stat-label-stock">Tổng số lượng (HH)</div>
            </div>
            <div class="stat-card-stock">
                <div class="stat-icon">🏷️</div>
                <div class="stat-value-stock">${totalProducts}</div>
                <div class="stat-label-stock">Tổng mặt hàng (HH)</div>
            </div>
            <div class="stat-card-stock">
                <div class="stat-icon">💰</div>
                <div class="stat-value-stock">${formatCurrency(totalValue)}</div>
                <div class="stat-label-stock">Tổng giá trị (HH)</div>
            </div>
        </div>
    `;
}
// Thêm hàm phân loại sản phẩm
function getProductClassification(category) {
    const classifications = {
        'hang_hoa': 'Hàng hóa',
        'chiet_khau': 'Chiết khấu', 
        'khuyen_mai': 'Khuyến mãi',
        'dich_vu': 'Dịch vụ'
    };
    return classifications[category] || 'Hàng hóa';
}
/**
 * Hàm chính render danh sách tồn kho với chiết khấu và phân loại
 */
function renderStock(searchTerm = '', filterType = 'all') {
    const stockList = document.getElementById('stock-list');
    if (!stockList) return;

    if (!window.hkdData || !window.currentCompany) {
        stockList.innerHTML = '<tr><td colspan="14" style="text-align: center;">Vui lòng chọn công ty</td></tr>';
        return;
    }

    stockList.innerHTML = '';
    
    const hkd = hkdData[window.currentCompany];
    let productCount = 0;
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    updateStockStats();
    
    // Cấu trúc tổng hợp với thông tin chiết khấu
    const aggregatedStock = {};
    
    // Bước 1: Tổng hợp dữ liệu từ tonkhoMain
    hkd.tonkhoMain.forEach(product => {
        
        // Dùng giá trị tuyệt đối cho số lượng CK/KM để tính tổng
        const currentQuantity = Math.abs(parseFloat(product.quantity)); 
        
        // Không tổng hợp các sản phẩm có số lượng 0 sau khi làm tròn hoặc KM/CK có số lượng 0
        if (currentQuantity === 0 && product.category !== 'chiet_khau') return; 

        // ====================================================================
        // ✅ LOGIC LỌC ĐÃ CHUẨN HÓA: Dựa vào trường 'category'
        // ====================================================================
        const productCategory = product.category || 'hang_hoa'; // Fallback an toàn

        if (filterType === 'ck' && productCategory !== 'chiet_khau') return;
        if (filterType === 'km' && productCategory !== 'khuyen_mai') return;
        if (filterType === 'normal' && productCategory !== 'hang_hoa') return;
        // ====================================================================
        
        if (!aggregatedStock[product.msp]) {
            aggregatedStock[product.msp] = {
                msp: product.msp,
                name: product.name,
                unit: product.unit,
                quantity: 0,
                totalAmount: 0,
                totalDiscount: 0, // Tổng chiết khấu dòng
                avgPrice: 0,
                category: productCategory, 
                classification: product.classification || getProductClassification(productCategory),
                discountRate: 0 
            };
        }
        
        // Nếu là hàng hóa thường (HH) thì tổng hợp số lượng (âm/dương)
        if (productCategory === 'hang_hoa') {
            aggregatedStock[product.msp].quantity += parseFloat(product.quantity);
        } 
        // Nếu là Chiết khấu (CK) hoặc Khuyến mãi (KM) thì chỉ tính tổng giá trị
        
        aggregatedStock[product.msp].totalAmount += parseFloat(product.amount);
        
        // Cộng dồn chiết khấu từ các lô
        if (product.discount) {
            aggregatedStock[product.msp].totalDiscount += parseFloat(product.discount) || 0;
        }
    });
    
    // Bước 2: Tính toán các chỉ số và hiển thị
    Object.values(aggregatedStock).forEach((product, index) => {
        // Lọc theo từ khóa tìm kiếm
        if (searchTerm && 
            !product.msp.toLowerCase().includes(lowerSearchTerm) &&
            !product.name.toLowerCase().includes(lowerSearchTerm) &&
            !product.classification.toLowerCase().includes(lowerSearchTerm)) {
            return;
        }
        
        // Bỏ qua các hàng hóa thường có tổng số lượng <= 0
        if (product.category === 'hang_hoa' && product.quantity <= 0) return;
        
        // Tính giá trung bình và tỷ lệ chiết khấu
        const absoluteAmount = Math.abs(product.totalAmount);
        product.avgPrice = product.quantity > 0 && product.category === 'hang_hoa' ? 
            absoluteAmount / product.quantity : 0;
            
        product.discountRate = absoluteAmount > 0 ? 
            (product.totalDiscount / absoluteAmount * 100) : 0;
        
        
        // TÍNH TOÁN CÁC CHỈ SỐ HIỂN THỊ
        const amountBeforeTax = product.totalAmount;
        
        // Xác định thuế suất theo phân loại
        let taxRate = 10; // Mặc định 10%
        if (product.category !== 'hang_hoa') {
            taxRate = 0; // Chiết khấu và khuyến mãi không tính thuế
        }
        
        // Thuế được tính trên giá trị tuyệt đối của tổng tiền trước thuế
        const taxAmount = accountingRound(amountBeforeTax * taxRate / 100);
        const amountAfterTax = accountingRound(amountBeforeTax + taxAmount);
        
        // Giá bán đề xuất (chỉ cho hàng hóa thường)
        const suggestedPrice = product.category === 'hang_hoa' ? 
            accountingRound(product.avgPrice * 1.2) : 0;

        // Render dòng sản phẩm
        const row = document.createElement('tr');
        
        // Màu nền theo phân loại
        if (product.category === 'chiet_khau') {
            row.style.backgroundColor = '#fff3cd'; // Màu vàng nhạt cho chiết khấu
        } else if (product.category === 'khuyen_mai') {
            row.style.backgroundColor = '#d1ecf1'; // Màu xanh nhạt cho khuyến mãi
        }
        
        // Hiển thị số lượng: 
        // - HH: số lượng tồn kho thực tế.
        // - CK/KM: Dùng ký hiệu '-' hoặc tổng số lần xuất hiện (tùy theo mục đích báo cáo)
        const quantityDisplay = product.category === 'hang_hoa' ? 
            product.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : 
            '--'; 
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${product.msp}</strong></td>
            <td>${product.name}</td>
            <td>${product.unit}</td>
            <td>${quantityDisplay}</td>
            <td>${product.category === 'hang_hoa' ? formatCurrency(product.avgPrice) : '0'}</td>
            <td><strong>${formatCurrency(product.totalDiscount)}</strong></td>
            <td>${product.discountRate.toFixed(2)}%</td>
            <td>${formatCurrency(amountBeforeTax)}</td>
            <td>${taxRate}% (${formatCurrency(taxAmount)})</td>
            <td>${formatCurrency(amountAfterTax)}</td>
            <td>${product.category === 'hang_hoa' ? formatCurrency(suggestedPrice) : '0'}</td>
            <td><span class="badge ${getClassificationBadgeClass(product.category)}">${product.classification}</span></td>
            <td>
                <button class="btn-sm btn-info" onclick="editStockItem('${product.msp}')">Sửa</button>
                <button class="btn-sm btn-danger" onclick="deleteStockItem('${product.msp}')">Xóa</button>
            </td>
        `;
        
        stockList.appendChild(row);
        productCount++;
    });
    
    if (productCount === 0) {
        stockList.innerHTML = `<tr><td colspan="14" style="text-align: center;">${searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có dữ liệu tồn kho'}</td></tr>`;
    }
}

// Hàm xác định class badge cho phân loại
function getClassificationBadgeClass(category) {
    const classes = {
        'hang_hoa': 'badge-primary',
        'chiet_khau': 'badge-warning', 
        'khuyen_mai': 'badge-info',
        'dich_vu': 'badge-secondary'
    };
    return classes[category] || 'badge-secondary';
}

// Hàm sửa sản phẩm tồn kho
function editStockItem(msp) {
    alert('Chức năng sửa sản phẩm: ' + msp);
    // TODO: Triển khai chức năng sửa
}

// Hàm xóa sản phẩm tồn kho
function deleteStockItem(msp) {
    if (!window.currentCompany || !confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi tồn kho?')) return;
    
    const hkd = hkdData[window.currentCompany];
    hkd.tonkhoMain = hkd.tonkhoMain.filter(p => p.msp !== msp);
    
    renderStock();
    if (typeof window.updateAccountingStats === 'function') window.updateAccountingStats();
    alert('Đã xóa sản phẩm khỏi tồn kho.');
}

// =======================
// Exports toàn cục
// =======================
window.initStockModule = initStockModule;
window.renderStock = renderStock;
window.updateStockStats = updateStockStats;
window.editStockItem = editStockItem;
window.deleteStockItem = deleteStockItem;