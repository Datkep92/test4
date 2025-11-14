// Module quản lý xuất hàng
function initExportModule() {
    // 1. Lắng nghe sự kiện tạo phiếu xuất
    const createExportButton = document.getElementById('create-export');
    if (createExportButton) {
        createExportButton.addEventListener('click', function() {
            createExport();
        });
    }

    // 2. Lắng nghe sự kiện nhập liệu để tính toán tổng giá trị xuất
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('export-quantity') || e.target.classList.contains('export-product-check')) {
            calculateExportTotal();
        }
    });

    // Thiết lập ngày xuất mặc định là ngày hiện tại
    const exportDateInput = document.getElementById('export-date');
    if (exportDateInput) {
        exportDateInput.valueAsDate = new Date();
    }

    // 3. Cập nhật danh sách sản phẩm khi khởi tạo
    updateExportProductsList();
}

/**
 * Hàm tiện ích: Tổng hợp tồn kho và tính giá vốn TB (đồng bộ với tonkho.js)
 * @param {object} hkd - Dữ liệu HKD hiện tại.
 * @returns {object} - Tồn kho đã tổng hợp theo MSP.
 */
function getAggregatedStock(hkd) {
    const aggregatedStock = {};
    
    (hkd.tonkhoMain || []).forEach(product => {
        if (product.quantity <= 0) return; 
        
        if (!aggregatedStock[product.msp]) {
            aggregatedStock[product.msp] = {
                msp: product.msp,
                name: product.name,
                unit: product.unit,
                quantity: 0,
                totalAmount: 0,
                avgPrice: 0,
            };
        }
        
        aggregatedStock[product.msp].quantity += parseFloat(product.quantity) || 0;
        aggregatedStock[product.msp].totalAmount = accountingRound(aggregatedStock[product.msp].totalAmount + (parseFloat(product.amount) || 0));
    });

    Object.values(aggregatedStock).forEach(product => {
        product.avgPrice = product.quantity > 0 ? accountingRound(product.totalAmount / product.quantity) : 0;
    });

    return aggregatedStock;
}

// Cập nhật danh sách sản phẩm có thể xuất (dựa trên tồn kho)
function updateExportProductsList() {
    const productsListContainer = document.getElementById('export-products-list');
    if (!productsListContainer) return;

    if (!window.currentCompany || !window.hkdData[window.currentCompany]) {
        productsListContainer.innerHTML = '<p style="text-align: center;">Vui lòng chọn công ty.</p>';
        return;
    }

    const hkd = window.hkdData[window.currentCompany];
    const aggregatedStock = getAggregatedStock(hkd);
    const stockItems = Object.values(aggregatedStock);

    if (stockItems.length === 0) {
        productsListContainer.innerHTML = '<p style="text-align: center;">Không có sản phẩm nào trong kho để xuất.</p>';
        return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Chọn</th>
                    <th>MSP</th>
                    <th>Tên SP</th>
                    <th>ĐVT</th>
                    <th>Số lượng tồn</th>
                    <th>Số lượng xuất</th>
                </tr>
            </thead>
            <tbody>
    `;

    stockItems.forEach(product => {
        // Sử dụng toLocaleString để hiển thị số lượng với dấu phẩy
        const displayQty = product.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
        
        html += `
            <tr>
                <td><input type="checkbox" class="export-product-check" data-msp="${product.msp}" data-price="${product.avgPrice}" ${product.quantity <= 0 ? 'disabled' : ''}></td>
                <td>${product.msp}</td>
                <td>${product.name}</td>
                <td>${product.unit}</td>
                <td data-max-qty="${product.quantity}">${displayQty}</td>
                <td>
                    <input type="number" class="export-quantity" data-msp="${product.msp}" 
                           min="0" max="${product.quantity}" value="0" step="0.01"
                           ${product.quantity <= 0 ? 'disabled' : ''} style="width: 80px;">
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    productsListContainer.innerHTML = html;

    // Gắn sự kiện cho checkbox để tự động nhập max
    document.querySelectorAll('.export-product-check').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const msp = this.getAttribute('data-msp');
            const qtyInput = document.querySelector(`.export-quantity[data-msp="${msp}"]`);
            if (this.checked) {
                // Đặt số lượng mặc định là max nếu chọn
                qtyInput.value = qtyInput.getAttribute('max');
                qtyInput.focus();
            } else {
                qtyInput.value = '0';
            }
            calculateExportTotal();
        });
    });
    
    calculateExportTotal(); // Tính tổng lần đầu
}

// Tính tổng giá trị xuất kho hiện tại (theo giá vốn trung bình)
function calculateExportTotal() {
    const totalDisplay = document.getElementById('current-export-total');
    let totalValue = 0;

    const exportQuantities = document.querySelectorAll('.export-quantity');
    exportQuantities.forEach(input => {
        const msp = input.getAttribute('data-msp');
        const quantity = parseFloat(input.value) || 0;
        const checkbox = document.querySelector(`.export-product-check[data-msp="${msp}"]`);
        
        // Chỉ tính toán nếu checkbox được chọn và số lượng > 0
        if (checkbox && checkbox.checked && quantity > 0) {
            const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
            totalValue = accountingRound(totalValue + quantity * price);
        }
    });

    totalDisplay.textContent = window.formatCurrency(totalValue);
    return totalValue;
}

// Tạo phiếu xuất kho
function createExport() {
    if (!window.currentCompany) {
        alert('Vui lòng chọn công ty.');
        return;
    }

    const hkd = window.hkdData[window.currentCompany];
    const exportDate = document.getElementById('export-date').value;
    const exportNote = document.getElementById('export-note').value.trim();
    const exportQuantities = document.querySelectorAll('.export-quantity');
    const aggregatedStock = getAggregatedStock(hkd);
    
    if (!exportDate) {
        alert('Vui lòng chọn ngày xuất.');
        return;
    }

    const exportProducts = [];
    let totalExportValue = 0;
    
    // 1. Thu thập dữ liệu xuất và kiểm tra tồn kho
    for (const input of exportQuantities) {
        const msp = input.getAttribute('data-msp');
        const quantity = parseFloat(input.value) || 0;
        const checkbox = document.querySelector(`.export-product-check[data-msp="${msp}"]`);
        
        if (checkbox && checkbox.checked && quantity > 0) {
            const stockItem = aggregatedStock[msp];
            
            if (!stockItem || quantity > stockItem.quantity) {
                 alert(`Lỗi: Số lượng xuất (${quantity}) vượt quá số lượng tồn (${stockItem ? stockItem.quantity : 0}) cho sản phẩm ${msp}.`);
                return;
            }
            
            const price = stockItem.avgPrice;
            const amount = accountingRound(quantity * price);
            totalExportValue = accountingRound(totalExportValue + amount);

            exportProducts.push({
                msp: msp,
                name: stockItem.name,
                unit: stockItem.unit,
                quantity: quantity,
                price: price,
                amount: amount
            });
        }
    }

    if (exportProducts.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm và nhập số lượng xuất.');
        return;
    }

    if (!confirm(`Xác nhận tạo phiếu xuất với tổng giá trị VỐN ${window.formatCurrency(totalExportValue)}?`)) {
        return;
    }

    // 2. Cập nhật tồn kho (trừ số lượng và giá trị vốn) - ÁP DỤNG LÀM TRÒN
    exportProducts.forEach(expProduct => {
        let remainingQtyToSubtract = expProduct.quantity;
        
        // Trừ từ các lô nhập có sẵn trong tonkhoMain (trừ theo lô)
        for (let i = 0; i < hkd.tonkhoMain.length && remainingQtyToSubtract > 0; i++) {
            let stock = hkd.tonkhoMain[i];
            if (stock.msp === expProduct.msp && stock.quantity > 0) {
                if (remainingQtyToSubtract >= stock.quantity) {
                    // Trừ hết lô này
                    remainingQtyToSubtract -= stock.quantity;
                    stock.amount = 0; 
                    stock.quantity = 0; 
                } else {
                    // Trừ một phần - ÁP DỤNG LÀM TRÒN
                    const ratio = remainingQtyToSubtract / stock.quantity;
                    stock.amount = accountingRound(stock.amount - (stock.amount * ratio));
                    stock.quantity = accountingRound(stock.quantity - remainingQtyToSubtract);
                    remainingQtyToSubtract = 0;
                }
            }
        }
    });

    // Loại bỏ các mục có số lượng <= 0
    hkd.tonkhoMain = hkd.tonkhoMain.filter(p => p.quantity > 0);

    // 3. Ghi nhận phiếu xuất (ÁP DỤNG LÀM TRÒN)
    const exportId = `PX-${new Date().getTime().toString().slice(-6)}`;
    const newExport = {
        id: exportId,
        date: exportDate,
        note: exportNote,
        products: exportProducts,
        totalValue: accountingRound(totalExportValue)
    };

    // Đảm bảo mảng exports tồn tại
    if (!hkd.exports) {
        hkd.exports = [];
    }
    
    hkd.exports.unshift(newExport); 

    // 4. Cập nhật giao diện - QUAN TRỌNG: THÊM CẬP NHẬT THỐNG KÊ KẾ TOÁN
    updateExportProductsList();
    renderExportHistory();
    if (typeof window.renderStock === 'function') window.renderStock();
    
    // 🔥 QUAN TRỌNG: Cập nhật thống kê kế toán sau khi xuất hàng
    if (typeof window.updateAccountingStats === 'function') {
        window.updateAccountingStats();
    }
    
    // 🔥 QUAN TRỌNG: Tích hợp với hệ thống kế toán
    if (typeof window.integrateSaleAccounting === 'function') {
        window.integrateSaleAccounting(newExport, window.currentCompany);
    }
    
    // Reset form
    document.getElementById('export-note').value = '';
    
    alert(`Đã tạo phiếu xuất ${exportId} thành công và cập nhật tồn kho!`);
    
    // Lưu dữ liệu
    if (typeof window.saveData === 'function') {
        window.saveData();
    }
}

// Hiển thị danh sách phiếu xuất đã tạo
function renderExportHistory() {
    const historyList = document.getElementById('export-history-list');
    if (!historyList) return;

    if (!window.currentCompany || !window.hkdData[window.currentCompany]) {
        historyList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Vui lòng chọn công ty</td></tr>';
        return;
    }

    const hkd = window.hkdData[window.currentCompany];
    historyList.innerHTML = '';
    let exportCount = 0;

    // Đảm bảo exports tồn tại
    const exports = hkd.exports || [];

    // Sắp xếp theo ngày (mới nhất trước)
    const sortedExports = [...exports].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExports.forEach(exportRecord => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exportRecord.id}</td>
            <td>${window.formatDate(exportRecord.date)}</td>
            <td>${exportRecord.note || '-'}</td>
            <td>${window.formatCurrency(exportRecord.totalValue)}</td>
            <td>
                <button class="btn-sm btn-info" onclick="showExportDetail('${exportRecord.id}')">Chi tiết</button>
            </td>
        `;
        historyList.appendChild(row);
        exportCount++;
    });

    if (exportCount === 0) {
        historyList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có phiếu xuất nào được tạo</td></tr>';
    }
}

// Hiển thị chi tiết phiếu xuất
function showExportDetail(id) {
    if (!window.currentCompany) return;
    
    const hkd = window.hkdData[window.currentCompany];
    const exportRecord = (hkd.exports || []).find(exp => exp.id === id);
    
    if (!exportRecord) {
        alert('Không tìm thấy phiếu xuất');
        return;
    }
    
    let detailHtml = `
        <div class="card">
            <div class="card-header">Thông Tin Phiếu Xuất</div>
            <p><strong>Mã phiếu:</strong> ${exportRecord.id}</p>
            <p><strong>Ngày xuất:</strong> ${window.formatDate(exportRecord.date)}</p>
            <p><strong>Ghi chú:</strong> ${exportRecord.note || '-'}</p>
        </div>
        
        <div class="card">
            <div class="card-header">Chi Tiết Sản Phẩm Xuất (Giá Vốn)</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>MSP</th>
                        <th>Tên sản phẩm</th>
                        <th>ĐVT</th>
                        <th>Số lượng</th>
                        <th>Đơn giá Vốn TB</th>
                        <th>Thành tiền Vốn</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    exportRecord.products.forEach(product => {
        detailHtml += `
            <tr>
                <td>${product.msp}</td>
                <td>${product.name}</td>
                <td>${product.unit}</td>
                <td>${product.quantity.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</td>
                <td>${window.formatCurrency(product.price)}</td>
                <td>${window.formatCurrency(product.amount)}</td>
            </tr>
        `;
    });
    
    detailHtml += `
                </tbody>
            </table>
            <h4 style="text-align: right; margin-top: 10px;">Tổng Giá Trị Xuất: ${window.formatCurrency(exportRecord.totalValue)}</h4>
        </div>
    `;
    
    window.showModal(`Chi Tiết Phiếu Xuất ${exportRecord.id}`, detailHtml);
}

// =======================
// Exports toàn cục
// =======================
window.initExportModule = initExportModule;
window.updateExportProductsList = updateExportProductsList;
window.renderExportHistory = renderExportHistory;
window.showExportDetail = showExportDetail;
window.createExport = createExport;