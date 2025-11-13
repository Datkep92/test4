// =======================
// MODULE KẾ TOÁN HOÀN CHỈNH THEO CHUẨN VAS
// =======================

// Danh mục tài khoản theo Thông tư 200/TT-BTC
const CHART_OF_ACCOUNTS = {
    // Tài sản ngắn hạn
    '111': { name: 'Tiền mặt', type: 'asset', category: 'current_asset' },
    '112': { name: 'Tiền gửi ngân hàng', type: 'asset', category: 'current_asset' },
    '131': { name: 'Phải thu khách hàng', type: 'asset', category: 'current_asset' },
    '133': { name: 'Thuế GTGT được khấu trừ', type: 'asset', category: 'current_asset' },
    '136': { name: 'Phải thu nội bộ', type: 'asset', category: 'current_asset' },
    '138': { name: 'Phải thu khác', type: 'asset', category: 'current_asset' },
    '141': { name: 'Tạm ứng', type: 'asset', category: 'current_asset' },
    '151': { name: 'Hàng mua đang đi đường', type: 'asset', category: 'current_asset' },
    '152': { name: 'Nguyên liệu, vật liệu', type: 'asset', category: 'current_asset' },
    '153': { name: 'Công cụ, dụng cụ', type: 'asset', category: 'current_asset' },
    '154': { name: 'Chi phí sản xuất kinh doanh dở dang', type: 'asset', category: 'current_asset' },
    '155': { name: 'Thành phẩm', type: 'asset', category: 'current_asset' },
    '156': { name: 'Hàng hóa', type: 'asset', category: 'current_asset' },
    '157': { name: 'Hàng gửi đi bán', type: 'asset', category: 'current_asset' },
    
    // Tài sản dài hạn
    '211': { name: 'Tài sản cố định hữu hình', type: 'asset', category: 'fixed_asset' },
    '214': { name: 'Hao mòn TSCĐ', type: 'asset', category: 'fixed_asset', is_contra: true },
    
    // Nợ phải trả
    '331': { name: 'Phải trả người bán', type: 'liability', category: 'current_liability' },
    '333': { name: 'Thuế và các khoản phải nộp Nhà nước', type: 'liability', category: 'current_liability' },
    '3331': { name: 'Thuế GTGT phải nộp', type: 'liability', category: 'current_liability' },
    '3332': { name: 'Thuế tiêu thụ đặc biệt', type: 'liability', category: 'current_liability' },
    '3333': { name: 'Thuế xuất nhập khẩu', type: 'liability', category: 'current_liability' },
    '3334': { name: 'Thuế thu nhập doanh nghiệp', type: 'liability', category: 'current_liability' },
    '3335': { name: 'Thuế thu nhập cá nhân', type: 'liability', category: 'current_liability' },
    '3336': { name: 'Thuế tài nguyên', type: 'liability', category: 'current_liability' },
    '3337': { name: 'Thuế nhà đất, tiền thuê đất', type: 'liability', category: 'current_liability' },
    '3338': { name: 'Các loại thuế khác', type: 'liability', category: 'current_liability' },
    '3339': { name: 'Phí, lệ phí và các khoản phải nộp khác', type: 'liability', category: 'current_liability' },
    '334': { name: 'Phải trả người lao động', type: 'liability', category: 'current_liability' },
    '335': { name: 'Chi phí phải trả', type: 'liability', category: 'current_liability' },
    '338': { name: 'Phải trả, phải nộp khác', type: 'liability', category: 'current_liability' },
    
    // Vốn chủ sở hữu
    '411': { name: 'Vốn đầu tư của chủ sở hữu', type: 'equity', category: 'equity' },
    '421': { name: 'Lợi nhuận chưa phân phối', type: 'equity', category: 'equity' },
    
    // Doanh thu
    '511': { name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'revenue', category: 'revenue' },
    '515': { name: 'Doanh thu hoạt động tài chính', type: 'revenue', category: 'revenue' },
    '521': { name: 'Các khoản giảm trừ doanh thu', type: 'revenue', category: 'revenue', is_contra: true },
    
    // Chi phí
    '632': { name: 'Giá vốn hàng bán', type: 'expense', category: 'cost_of_goods_sold' },
    '641': { name: 'Chi phí bán hàng', type: 'expense', category: 'operating_expense' },
    '642': { name: 'Chi phí quản lý doanh nghiệp', type: 'expense', category: 'operating_expense' },
    '635': { name: 'Chi phí tài chính', type: 'expense', category: 'financial_expense' },
    '811': { name: 'Chi phí khác', type: 'expense', category: 'other_expense' }
};

class AccountingSystem {
    constructor() {
        this.journalEntries = [];
        this.generalLedger = {};
        this.initLedger();
    }

    initLedger() {
        // Khởi tạo sổ cái cho tất cả tài khoản
        Object.keys(CHART_OF_ACCOUNTS).forEach(account => {
            this.generalLedger[account] = {
                account: account,
                name: CHART_OF_ACCOUNTS[account].name,
                type: CHART_OF_ACCOUNTS[account].type,
                debit: 0,
                credit: 0,
                balance: 0,
                transactions: []
            };
        });
    }

    // Hàm hạch toán nghiệp vụ mua hàng nhập kho
    recordPurchase(invoice, taxCode) {
        const entry = {
            id: `PE-${Date.now()}`,
            date: invoice.invoiceInfo.date,
            description: `Mua hàng từ ${invoice.sellerInfo.name} - HĐ ${invoice.invoiceInfo.symbol}/${invoice.invoiceInfo.number}`,
            reference: invoice.originalFileId,
            transactions: []
        };

        // Phân loại sản phẩm để hạch toán
        let inventoryAmount = 0;    // Hàng hóa thường
        let discountAmount = 0;     // Chiết khấu
        let promotionAmount = 0;    // Khuyến mãi
        let inputVAT = 0;           // VAT đầu vào

        invoice.products.forEach(product => {
            if (product.category === 'hang_hoa') {
                inventoryAmount += product.amount;
                inputVAT += product.taxAmount;
            } else if (product.category === 'chiet_khau') {
                discountAmount += Math.abs(product.amount);
            } else if (product.category === 'khuyen_mai') {
                promotionAmount += product.amount;
            }
        });

        // Định khoản nghiệp vụ mua hàng
        if (inventoryAmount > 0) {
            // Nợ 156 - Hàng hóa
            entry.transactions.push({
                account: '156',
                debit: inventoryAmount,
                credit: 0,
                description: 'Nhập kho hàng hóa'
            });
        }

        if (inputVAT > 0) {
            // Nợ 133 - Thuế GTGT được khấu trừ
            entry.transactions.push({
                account: '133',
                debit: inputVAT,
                credit: 0,
                description: 'VAT đầu vào được khấu trừ'
            });
        }

        if (discountAmount > 0) {
            // Có 521 - Chiết khấu thương mại
            entry.transactions.push({
                account: '521',
                debit: 0,
                credit: discountAmount,
                description: 'Chiết khấu thương mại được hưởng'
            });
        }

        // Có 331 - Phải trả người bán (tổng giá trị thanh toán)
        const totalPayable = inventoryAmount + inputVAT - discountAmount;
        entry.transactions.push({
            account: '331',
            debit: 0,
            credit: totalPayable,
            description: 'Phải trả nhà cung cấp'
        });

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        console.log('✅ Đã hạch toán nghiệp vụ mua hàng:', entry);
        return entry;
    }

    // Hàm hạch toán nghiệp vụ xuất hàng bán
    recordSale(exportRecord, taxCode) {
        const entry = {
            id: `SE-${Date.now()}`,
            date: exportRecord.date,
            description: `Xuất bán hàng - Phiếu ${exportRecord.id}`,
            reference: exportRecord.id,
            transactions: []
        };

        const totalCost = exportRecord.totalValue;

        // Định khoản nghiệp vụ xuất bán
        // Nợ 632 - Giá vốn hàng bán
        entry.transactions.push({
            account: '632',
            debit: totalCost,
            credit: 0,
            description: 'Giá vốn hàng xuất bán'
        });

        // Có 156 - Hàng hóa
        entry.transactions.push({
            account: '156',
            debit: 0,
            credit: totalCost,
            description: 'Xuất kho hàng bán'
        });

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        console.log('✅ Đã hạch toán nghiệp vụ xuất bán:', entry);
        return entry;
    }

    // Hàm hạch toán nghiệp vụ thu tiền
    recordCashReceipt(amount, description, customer = '') {
        const entry = {
            id: `CR-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: description,
            reference: '',
            transactions: []
        };

        // Nợ 111/112 - Tiền mặt/Tiền gửi ngân hàng
        entry.transactions.push({
            account: '111', // Có thể thay bằng 112 nếu là ngân hàng
            debit: amount,
            credit: 0,
            description: 'Thu tiền ' + description
        });

        // Có 131 - Phải thu khách hàng hoặc 511 - Doanh thu
        entry.transactions.push({
            account: customer ? '131' : '511',
            debit: 0,
            credit: amount,
            description: customer ? `Thu nợ ${customer}` : 'Doanh thu bán hàng'
        });

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        return entry;
    }

    // Hàm hạch toán nghiệp vụ chi tiền
    recordCashPayment(amount, description, supplier = '') {
        const entry = {
            id: `CP-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: description,
            reference: '',
            transactions: []
        };

        // Nợ 331 - Phải trả nhà cung cấp hoặc 641/642 - Chi phí
        entry.transactions.push({
            account: supplier ? '331' : '641',
            debit: amount,
            credit: 0,
            description: supplier ? `Trả nợ ${supplier}` : description
        });

        // Có 111/112 - Tiền mặt/Tiền gửi ngân hàng
        entry.transactions.push({
            account: '111',
            debit: 0,
            credit: amount,
            description: 'Chi tiền ' + description
        });

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        return entry;
    }

    // Phân loại vào sổ cái
    postToLedger(entry) {
        entry.transactions.forEach(transaction => {
            const account = this.generalLedger[transaction.account];
            if (account) {
                account.debit += transaction.debit;
                account.credit += transaction.credit;
                
                // Tính số dư
                if (account.type === 'asset' || account.type === 'expense') {
                    account.balance = account.debit - account.credit;
                } else {
                    account.balance = account.credit - account.debit;
                }

                account.transactions.push({
                    date: entry.date,
                    description: entry.description,
                    debit: transaction.debit,
                    credit: transaction.credit,
                    reference: entry.reference
                });
            }
        });
    }

    // Lấy số dư tài khoản
    getAccountBalance(accountNumber) {
        const account = this.generalLedger[accountNumber];
        return account ? account.balance : 0;
    }

    // Kiểm tra cân đối số phát sinh
    checkTrialBalance() {
        let totalDebit = 0;
        let totalCredit = 0;

        Object.values(this.generalLedger).forEach(account => {
            totalDebit += account.debit;
            totalCredit += account.credit;
        });

        return {
            totalDebit,
            totalCredit,
            isBalanced: totalDebit === totalCredit,
            difference: Math.abs(totalDebit - totalCredit)
        };
    }

    // Báo cáo kết quả kinh doanh
    generateIncomeStatement(startDate, endDate) {
        const revenue = this.getAccountBalance('511') - this.getAccountBalance('521');
        const costOfGoodsSold = this.getAccountBalance('632');
        const operatingExpenses = this.getAccountBalance('641') + this.getAccountBalance('642');
        const financialExpenses = this.getAccountBalance('635');
        const otherExpenses = this.getAccountBalance('811');

        const grossProfit = revenue - costOfGoodsSold;
        const operatingProfit = grossProfit - operatingExpenses;
        const netProfit = operatingProfit - financialExpenses - otherExpenses;

        return {
            revenue,
            costOfGoodsSold,
            grossProfit,
            operatingExpenses,
            operatingProfit,
            financialExpenses,
            otherExpenses,
            netProfit,
            period: { startDate, endDate }
        };
    }

    // Bảng cân đối kế toán
    generateBalanceSheet(asOfDate) {
        // Tài sản
        const currentAssets = 
            this.getAccountBalance('111') + 
            this.getAccountBalance('112') + 
            this.getAccountBalance('131') + 
            this.getAccountBalance('133') + 
            this.getAccountBalance('156');
        
        const fixedAssets = 
            this.getAccountBalance('211') - 
            this.getAccountBalance('214');

        const totalAssets = currentAssets + fixedAssets;

        // Nợ phải trả
        const currentLiabilities = 
            this.getAccountBalance('331') + 
            this.getAccountBalance('333') + 
            this.getAccountBalance('334');

        const totalLiabilities = currentLiabilities;

        // Vốn chủ sở hữu
        const equity = 
            this.getAccountBalance('411') + 
            this.getAccountBalance('421');

        return {
            assets: {
                currentAssets,
                fixedAssets,
                totalAssets
            },
            liabilities: {
                currentLiabilities,
                totalLiabilities
            },
            equity: {
                capital: this.getAccountBalance('411'),
                retainedEarnings: this.getAccountBalance('421'),
                totalEquity: equity
            },
            asOfDate,
            isBalanced: totalAssets === (totalLiabilities + equity)
        };
    }

    // Sổ nhật ký chung
    getGeneralJournal(startDate = null, endDate = null) {
        let entries = this.journalEntries;

        if (startDate && endDate) {
            entries = entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );
        }

        return entries;
    }

    // Sổ cái chi tiết
    getGeneralLedger(accountNumber, startDate = null, endDate = null) {
        const account = this.generalLedger[accountNumber];
        if (!account) return null;

        let transactions = account.transactions;

        if (startDate && endDate) {
            transactions = transactions.filter(t => 
                t.date >= startDate && t.date <= endDate
            );
        }

        return {
            account: accountNumber,
            name: account.name,
            openingBalance: 0, // Có thể tính từ ngày trước đó
            transactions,
            closingBalance: account.balance
        };
    }
}

// Khởi tạo hệ thống kế toán toàn cục
window.accountingSystem = new AccountingSystem();

// =======================
// GIAO DIỆN VÀ TÍCH HỢP
// =======================

function initAccountingModule() {
    // 1. Tạo báo cáo theo tháng
    const generateReportButton = document.getElementById('generate-report');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', function() {
            generateMonthlyReport();
        });
    }

    // 2. Thiết lập tháng mặc định
    const reportMonthInput = document.getElementById('report-month');
    if (reportMonthInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        reportMonthInput.value = `${year}-${month}`;
    }

    // 3. Khởi tạo giao diện kế toán
    setupAccountingUI();
    
    // 4. Cập nhật thống kê
    updateAccountingStats();
}

function setupAccountingUI() {
    // Thêm các tab mới cho kế toán
    const accountingTabs = `
        <div class="accounting-tabs" style="margin-bottom: 20px;">
            <button class="btn-secondary" onclick="showAccountingTab('general-ledger')">Sổ Cái</button>
            <button class="btn-secondary" onclick="showAccountingTab('general-journal')">Nhật Ký Chung</button>
            <button class="btn-secondary" onclick="showAccountingTab('balance-sheet')">CĐKT</button>
            <button class="btn-secondary" onclick="showAccountingTab('income-statement')">KQKD</button>
            <button class="btn-secondary" onclick="showAccountingTab('trial-balance')">Cân Đối TK</button>
        </div>
        
        <div id="accounting-tab-content">
            <!-- Nội dung các tab sẽ được load động -->
        </div>
    `;

    const keToanTab = document.getElementById('ke-toan');
    if (keToanTab) {
        const existingTabs = keToanTab.querySelector('.accounting-tabs');
        if (!existingTabs) {
            keToanTab.querySelector('.content-body').insertAdjacentHTML('afterbegin', accountingTabs);
        }
    }
}

// =======================
// CÁC HÀM HIỂN THỊ GIAO DIỆN CÒN THIẾU
// =======================

function showGeneralJournal() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const journalEntries = window.accountingSystem.getGeneralJournal(firstDay, lastDay);
    
    let html = `
        <div class="card">
            <div class="card-header">Sổ Nhật Ký Chung - Tháng ${now.getMonth() + 1}/${now.getFullYear()}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Chứng từ</th>
                        <th>Diễn giải</th>
                        <th>Tài khoản</th>
                        <th>Phát sinh Nợ</th>
                        <th>Phát sinh Có</th>
                    </tr>
                </thead>
                <tbody>
    `;

    journalEntries.forEach(entry => {
        // Hiển thị từng giao dịch trong bút toán
        entry.transactions.forEach((transaction, index) => {
            html += `
                <tr>
                    <td>${index === 0 ? window.formatDate(entry.date) : ''}</td>
                    <td>${index === 0 ? entry.reference : ''}</td>
                    <td>${index === 0 ? entry.description : ''}</td>
                    <td>${transaction.account} - ${CHART_OF_ACCOUNTS[transaction.account]?.name || ''}</td>
                    <td>${transaction.debit > 0 ? window.formatCurrency(transaction.debit) : ''}</td>
                    <td>${transaction.credit > 0 ? window.formatCurrency(transaction.credit) : ''}</td>
                </tr>
            `;
        });
        
        // Thêm dòng trống giữa các bút toán
        html += `<tr style="height: 10px; background-color: #f8f9fa;"><td colspan="6"></td></tr>`;
    });

    html += `</tbody></table></div>`;
    contentDiv.innerHTML = html;
}

function showGeneralLedger() {
    const contentDiv = document.getElementById('accounting-tab-content');
    let html = `
        <div class="card">
            <div class="card-header">Sổ Cái Tổng Hợp</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Tên tài khoản</th>
                        <th>Dư nợ</th>
                        <th>Dư có</th>
                        <th>Số dư</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.values(window.accountingSystem.generalLedger).forEach(account => {
        if (account.debit > 0 || account.credit > 0) {
            const balanceType = account.type === 'asset' || account.type === 'expense' ? 
                (account.balance > 0 ? 'Nợ' : account.balance < 0 ? 'Có' : '') :
                (account.balance > 0 ? 'Có' : account.balance < 0 ? 'Nợ' : '');
                
            html += `
                <tr>
                    <td>${account.account}</td>
                    <td>${account.name}</td>
                    <td>${window.formatCurrency(account.debit)}</td>
                    <td>${window.formatCurrency(account.credit)}</td>
                    <td>${window.formatCurrency(Math.abs(account.balance))} ${balanceType}</td>
                    <td>
                        <button class="btn-sm btn-info" onclick="showAccountDetail('${account.account}')">Chi tiết</button>
                    </td>
                </tr>
            `;
        }
    });

    html += `</tbody></table></div>`;
    contentDiv.innerHTML = html;
}

function showAccountDetail(accountNumber) {
    const ledger = window.accountingSystem.getGeneralLedger(accountNumber);
    if (!ledger) {
        alert('Không tìm thấy tài khoản: ' + accountNumber);
        return;
    }

    let detailHtml = `
        <div class="card">
            <div class="card-header">Sổ Cái Chi Tiết - TK ${accountNumber} - ${ledger.name}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Diễn giải</th>
                        <th>Số hiệu CT</th>
                        <th>Nợ</th>
                        <th>Có</th>
                        <th>Số dư</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let runningBalance = 0;
    const accountInfo = CHART_OF_ACCOUNTS[accountNumber];
    
    ledger.transactions.forEach(transaction => {
        // Tính số dư running
        if (accountInfo.type === 'asset' || accountInfo.type === 'expense') {
            runningBalance += transaction.debit - transaction.credit;
        } else {
            runningBalance += transaction.credit - transaction.debit;
        }

        const balanceType = runningBalance > 0 ? 
            (accountInfo.type === 'asset' || accountInfo.type === 'expense' ? 'Nợ' : 'Có') :
            (runningBalance < 0 ? (accountInfo.type === 'asset' || accountInfo.type === 'expense' ? 'Có' : 'Nợ') : '');

        detailHtml += `
            <tr>
                <td>${window.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.debit > 0 ? window.formatCurrency(transaction.debit) : ''}</td>
                <td>${transaction.credit > 0 ? window.formatCurrency(transaction.credit) : ''}</td>
                <td>${window.formatCurrency(Math.abs(runningBalance))} ${balanceType}</td>
            </tr>
        `;
    });

    detailHtml += `
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 10px; font-weight: bold;">
                Số dư cuối kỳ: ${window.formatCurrency(Math.abs(ledger.closingBalance))} 
                ${ledger.closingBalance > 0 ? 
                    (accountInfo.type === 'asset' || accountInfo.type === 'expense' ? 'Nợ' : 'Có') : 
                    (ledger.closingBalance < 0 ? (accountInfo.type === 'asset' || accountInfo.type === 'expense' ? 'Có' : 'Nợ') : '')}
            </div>
        </div>
    `;

    window.showModal(`Sổ Cái TK ${accountNumber}`, detailHtml);
}

function showBalanceSheet() {
    const balanceSheet = window.accountingSystem.generateBalanceSheet(new Date().toISOString().split('T')[0]);
    
    let html = `
        <div class="card">
            <div class="card-header">Bảng Cân Đối Kế Toán - ${window.formatDate(balanceSheet.asOfDate)}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>TÀI SẢN</h4>
                    <table class="table">
                        <tr>
                            <td><strong>A. TÀI SẢN NGẮN HẠN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.currentAssets)}</td>
                        </tr>
                        <tr>
                            <td><strong>B. TÀI SẢN DÀI HẠN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.fixedAssets)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG CỘNG TÀI SẢN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.totalAssets)}</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h4>NGUỒN VỐN</h4>
                    <table class="table">
                        <tr>
                            <td><strong>A. NỢ PHẢI TRẢ</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.liabilities.totalLiabilities)}</td>
                        </tr>
                        <tr>
                            <td><strong>B. VỐN CHỦ SỞ HỮU</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.equity.totalEquity)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG CỘNG NGUỒN VỐN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center; color: ${balanceSheet.isBalanced ? 'green' : 'red'};">
                <strong>${balanceSheet.isBalanced ? '✓ CÂN ĐỐI' : '✗ KHÔNG CÂN ĐỐI'}</strong>
            </div>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

function showIncomeStatement() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const incomeStatement = window.accountingSystem.generateIncomeStatement(firstDay, lastDay);
    
    let html = `
        <div class="card">
            <div class="card-header">Báo Cáo Kết Quả Kinh Doanh - Tháng ${now.getMonth() + 1}/${now.getFullYear()}</div>
            <table class="table">
                <tr>
                    <td><strong>1. Doanh thu bán hàng và cung cấp dịch vụ</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.revenue)}</td>
                </tr>
                <tr>
                    <td><strong>2. Giá vốn hàng bán</strong></td>
                    <td style="text-align: right;">(${window.formatCurrency(incomeStatement.costOfGoodsSold)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>LỢI NHUẬN GỘP</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.grossProfit)}</td>
                </tr>
                <tr>
                    <td>3. Chi phí bán hàng</td>
                    <td style="text-align: right;">(${window.formatCurrency(incomeStatement.operatingExpenses)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>LỢI NHUẬN THUẦN TỪ HOẠT ĐỘNG KINH DOANH</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.operatingProfit)}</td>
                </tr>
                <tr>
                    <td>4. Chi phí tài chính</td>
                    <td style="text-align: right;">(${window.formatCurrency(incomeStatement.financialExpenses)})</td>
                </tr>
                <tr>
                    <td>5. Chi phí khác</td>
                    <td style="text-align: right;">(${window.formatCurrency(incomeStatement.otherExpenses)})</td>
                </tr>
                <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f8f9fa;">
                    <td><strong>LỢI NHUẬN SAU THUẾ</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.netProfit)}</td>
                </tr>
            </table>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

function showTrialBalance() {
    const trialBalance = window.accountingSystem.checkTrialBalance();
    
    let html = `
        <div class="card">
            <div class="card-header">Bảng Cân Đối Số Phát Sinh</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Tên tài khoản</th>
                        <th>Phát sinh Nợ</th>
                        <th>Phát sinh Có</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.values(window.accountingSystem.generalLedger).forEach(account => {
        if (account.debit > 0 || account.credit > 0) {
            html += `
                <tr>
                    <td>${account.account}</td>
                    <td>${account.name}</td>
                    <td>${window.formatCurrency(account.debit)}</td>
                    <td>${window.formatCurrency(account.credit)}</td>
                </tr>
            `;
        }
    });

    html += `
                </tbody>
                <tfoot style="border-top: 2px solid #333; font-weight: bold;">
                    <tr>
                        <td colspan="2"><strong>TỔNG CỘNG</strong></td>
                        <td>${window.formatCurrency(trialBalance.totalDebit)}</td>
                        <td>${window.formatCurrency(trialBalance.totalCredit)}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="text-align: center; margin-top: 20px; color: ${trialBalance.isBalanced ? 'green' : 'red'};">
                <strong>${trialBalance.isBalanced ? '✓ CÂN ĐỐI' : `✗ KHÔNG CÂN ĐỐI - Chênh lệch: ${window.formatCurrency(trialBalance.difference)}`}</strong>
            </div>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

// =======================
// CẬP NHẬT HÀM showAccountingTab
// =======================
function showAccountingTab(tabName) {
    const contentDiv = document.getElementById('accounting-tab-content');
    if (!contentDiv) return;

    switch(tabName) {
        case 'general-ledger':
            showGeneralLedger();
            break;
        case 'general-journal':
            showGeneralJournal();
            break;
        case 'balance-sheet':
            showBalanceSheet();
            break;
        case 'income-statement':
            showIncomeStatement();
            break;
        case 'trial-balance':
            showTrialBalance();
            break;
        default:
            showGeneralLedger(); // Mặc định hiển thị sổ cái
    }
}

function showGeneralLedger() {
    const contentDiv = document.getElementById('accounting-tab-content');
    let html = `
        <div class="card">
            <div class="card-header">Sổ Cái Tổng Hợp</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Tên tài khoản</th>
                        <th>Dư nợ</th>
                        <th>Dư có</th>
                        <th>Số dư</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.values(window.accountingSystem.generalLedger).forEach(account => {
        if (account.debit > 0 || account.credit > 0) {
            html += `
                <tr>
                    <td>${account.account}</td>
                    <td>${account.name}</td>
                    <td>${window.formatCurrency(account.debit)}</td>
                    <td>${window.formatCurrency(account.credit)}</td>
                    <td>${window.formatCurrency(account.balance)}</td>
                    <td>
                        <button class="btn-sm btn-info" onclick="showAccountDetail('${account.account}')">Chi tiết</button>
                    </td>
                </tr>
            `;
        }
    });

    html += `</tbody></table></div>`;
    contentDiv.innerHTML = html;
}

function showAccountDetail(accountNumber) {
    const ledger = window.accountingSystem.getGeneralLedger(accountNumber);
    if (!ledger) return;

    let detailHtml = `
        <div class="card">
            <div class="card-header">Sổ Cái Chi Tiết - TK ${accountNumber} - ${ledger.name}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Diễn giải</th>
                        <th>Số hiệu CT</th>
                        <th>Nợ</th>
                        <th>Có</th>
                    </tr>
                </thead>
                <tbody>
    `;

    ledger.transactions.forEach(transaction => {
        detailHtml += `
            <tr>
                <td>${window.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.debit > 0 ? window.formatCurrency(transaction.debit) : ''}</td>
                <td>${transaction.credit > 0 ? window.formatCurrency(transaction.credit) : ''}</td>
            </tr>
        `;
    });

    detailHtml += `
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 10px; font-weight: bold;">
                Số dư cuối kỳ: ${window.formatCurrency(ledger.closingBalance)}
            </div>
        </div>
    `;

    window.showModal(`Sổ Cái TK ${accountNumber}`, detailHtml);
}

function showBalanceSheet() {
    const balanceSheet = window.accountingSystem.generateBalanceSheet(new Date().toISOString().split('T')[0]);
    
    let html = `
        <div class="card">
            <div class="card-header">Bảng Cân Đối Kế Toán - ${window.formatDate(balanceSheet.asOfDate)}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>TÀI SẢN</h4>
                    <table class="table">
                        <tr>
                            <td><strong>Tài sản ngắn hạn</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.currentAssets)}</td>
                        </tr>
                        <tr>
                            <td><strong>Tài sản dài hạn</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.fixedAssets)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG TÀI SẢN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.assets.totalAssets)}</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h4>NGUỒN VỐN</h4>
                    <table class="table">
                        <tr>
                            <td><strong>Nợ phải trả</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.liabilities.totalLiabilities)}</td>
                        </tr>
                        <tr>
                            <td><strong>Vốn chủ sở hữu</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.equity.totalEquity)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG NGUỒN VỐN</strong></td>
                            <td style="text-align: right;">${window.formatCurrency(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center; color: ${balanceSheet.isBalanced ? 'green' : 'red'};">
                <strong>${balanceSheet.isBalanced ? '✓ CÂN ĐỐI' : '✗ KHÔNG CÂN ĐỐI'}</strong>
            </div>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

function showIncomeStatement() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const incomeStatement = window.accountingSystem.generateIncomeStatement(firstDay, lastDay);
    
    let html = `
        <div class="card">
            <div class="card-header">Báo Cáo Kết Quả Kinh Doanh - Tháng ${now.getMonth() + 1}/${now.getFullYear()}</div>
            <table class="table">
                <tr>
                    <td><strong>Doanh thu thuần</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.revenue)}</td>
                </tr>
                <tr>
                    <td>Giá vốn hàng bán</td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.costOfGoodsSold)}</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>Lợi nhuận gộp</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.grossProfit)}</td>
                </tr>
                <tr>
                    <td>Chi phí bán hàng & QLDN</td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.operatingExpenses)}</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>Lợi nhuận thuần từ HĐKD</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.operatingProfit)}</td>
                </tr>
                <tr>
                    <td>Chi phí tài chính</td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.financialExpenses)}</td>
                </tr>
                <tr>
                    <td>Chi phí khác</td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.otherExpenses)}</td>
                </tr>
                <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f8f9fa;">
                    <td><strong>LỢI NHUẬN SAU THUẾ</strong></td>
                    <td style="text-align: right;">${window.formatCurrency(incomeStatement.netProfit)}</td>
                </tr>
            </table>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

function showTrialBalance() {
    const trialBalance = window.accountingSystem.checkTrialBalance();
    
    let html = `
        <div class="card">
            <div class="card-header">Bảng Cân Đối Số Phát Sinh</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tài khoản</th>
                        <th>Tên tài khoản</th>
                        <th>Phát sinh Nợ</th>
                        <th>Phát sinh Có</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.values(window.accountingSystem.generalLedger).forEach(account => {
        if (account.debit > 0 || account.credit > 0) {
            html += `
                <tr>
                    <td>${account.account}</td>
                    <td>${account.name}</td>
                    <td>${window.formatCurrency(account.debit)}</td>
                    <td>${window.formatCurrency(account.credit)}</td>
                </tr>
            `;
        }
    });

    html += `
                </tbody>
                <tfoot style="border-top: 2px solid #333; font-weight: bold;">
                    <tr>
                        <td colspan="2"><strong>TỔNG CỘNG</strong></td>
                        <td>${window.formatCurrency(trialBalance.totalDebit)}</td>
                        <td>${window.formatCurrency(trialBalance.totalCredit)}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="text-align: center; margin-top: 20px; color: ${trialBalance.isBalanced ? 'green' : 'red'};">
                <strong>${trialBalance.isBalanced ? '✓ CÂN ĐỐI' : `✗ KHÔNG CÂN ĐỐI - Chênh lệch: ${window.formatCurrency(trialBalance.difference)}`}</strong>
            </div>
        </div>
    `;

    document.getElementById('accounting-tab-content').innerHTML = html;
}

// =======================
// TÍCH HỢP TỰ ĐỘNG VỚI CÁC MODULE KHÁC
// =======================

// Tích hợp tự động khi nhập hóa đơn
function integratePurchaseAccounting(invoice, taxCode) {
    if (!window.accountingSystem) return;
    
    try {
        window.accountingSystem.recordPurchase(invoice, taxCode);
        console.log('✅ Đã tích hợp hạch toán mua hàng tự động');
    } catch (error) {
        console.error('❌ Lỗi hạch toán mua hàng:', error);
    }
}

// Tích hợp tự động khi xuất hàng
function integrateSaleAccounting(exportRecord, taxCode) {
    if (!window.accountingSystem) return;
    
    try {
        window.accountingSystem.recordSale(exportRecord, taxCode);
        console.log('✅ Đã tích hợp hạch toán xuất bán tự động');
    } catch (error) {
        console.error('❌ Lỗi hạch toán xuất bán:', error);
    }
}

// =======================
// CẬP NHẬT THỐNG KÊ
// =======================
function updateAccountingStats() {
    const totalInvoicesEl = document.getElementById('total-invoices');
    const totalInvoiceValueEl = document.getElementById('total-invoice-value');
    const totalProductsEl = document.getElementById('total-products');
    const totalStockValueEl = document.getElementById('total-stock-value');

    if (!totalInvoicesEl || !window.currentCompany) return;

    const hkd = window.hkdData[window.currentCompany];
    if (!hkd) return;

    // Tính tổng số hóa đơn
    const totalInvoices = (hkd.invoices || []).length;
    
    // Tính tổng giá trị hóa đơn
    let totalInvoiceValue = 0;
    (hkd.invoices || []).forEach(invoice => {
        totalInvoiceValue += invoice.summary.calculatedTotal || 0;
    });

    // Tính tổng số sản phẩm tồn kho
    let totalProducts = 0;
    let totalStockValue = 0;
    const productMap = new Map();
    
    (hkd.tonkhoMain || []).forEach(product => {
        if (product.category === 'hang_hoa' && product.quantity > 0) {
            if (!productMap.has(product.msp)) {
                productMap.set(product.msp, true);
                totalProducts++;
            }
            totalStockValue += product.amount || 0;
        }
    });

    // Cập nhật giao diện
    totalInvoicesEl.textContent = totalInvoices.toLocaleString('vi-VN');
    totalInvoiceValueEl.textContent = window.formatCurrency(totalInvoiceValue);
    totalProductsEl.textContent = totalProducts.toLocaleString('vi-VN');
    totalStockValueEl.textContent = window.formatCurrency(totalStockValue);
}

// =======================
// Exports toàn cục
// =======================
// =======================
// Exports toàn cục
// =======================
window.initAccountingModule = initAccountingModule;
window.updateAccountingStats = updateAccountingStats;
window.integratePurchaseAccounting = integratePurchaseAccounting;
window.integrateSaleAccounting = integrateSaleAccounting;
window.showAccountingTab = showAccountingTab;
window.showAccountDetail = showAccountDetail;
window.showGeneralJournal = showGeneralJournal;
window.showGeneralLedger = showGeneralLedger;
window.showBalanceSheet = showBalanceSheet;
window.showIncomeStatement = showIncomeStatement;
window.showTrialBalance = showTrialBalance;