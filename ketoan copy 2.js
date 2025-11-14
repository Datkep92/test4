// =======================
// MODULE KẾ TOÁN HỖ TRỢ VAS VÀ IFRS
// =======================

// Cấu hình hệ thống kế toán
const ACCOUNTING_CONFIG = {
    standards: {
        'VAS': {
            name: 'Chuẩn mực Kế toán Việt Nam (VAS)',
            currency: 'VND',
            dateFormat: 'dd/MM/yyyy',
            taxCode: 'VAT',
            chartOfAccounts: {
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
                '212': { name: 'Tài sản cố định thuê tài chính', type: 'asset', category: 'fixed_asset' },
                '213': { name: 'Tài sản cố định vô hình', type: 'asset', category: 'fixed_asset' },
                '214': { name: 'Hao mòn TSCĐ', type: 'asset', category: 'fixed_asset', is_contra: true },
                '217': { name: 'Bất động sản đầu tư', type: 'asset', category: 'fixed_asset' },
                
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
                '4111': { name: 'Vốn góp cổ phần', type: 'equity', category: 'equity' },
                '4112': { name: 'Thặng dư vốn cổ phần', type: 'equity', category: 'equity' },
                '421': { name: 'Lợi nhuận chưa phân phối', type: 'equity', category: 'equity' },
                '4211': { name: 'Lợi nhuận chưa phân phối năm trước', type: 'equity', category: 'equity' },
                '4212': { name: 'Lợi nhuận chưa phân phối năm nay', type: 'equity', category: 'equity' },
                
                // Doanh thu
                '511': { name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'revenue', category: 'revenue' },
                '5111': { name: 'Doanh thu bán hàng hóa', type: 'revenue', category: 'revenue' },
                '5112': { name: 'Doanh thu bán thành phẩm', type: 'revenue', category: 'revenue' },
                '5113': { name: 'Doanh thu cung cấp dịch vụ', type: 'revenue', category: 'revenue' },
                '515': { name: 'Doanh thu hoạt động tài chính', type: 'revenue', category: 'revenue' },
                '521': { name: 'Các khoản giảm trừ doanh thu', type: 'revenue', category: 'revenue', is_contra: true },
                '5211': { name: 'Chiết khấu thương mại', type: 'revenue', category: 'revenue', is_contra: true },
                '5212': { name: 'Giảm giá hàng bán', type: 'revenue', category: 'revenue', is_contra: true },
                '5213': { name: 'Hàng bán bị trả lại', type: 'revenue', category: 'revenue', is_contra: true },
                
                // Chi phí
                '632': { name: 'Giá vốn hàng bán', type: 'expense', category: 'cost_of_goods_sold' },
                '641': { name: 'Chi phí bán hàng', type: 'expense', category: 'operating_expense' },
                '642': { name: 'Chi phí quản lý doanh nghiệp', type: 'expense', category: 'operating_expense' },
                '635': { name: 'Chi phí tài chính', type: 'expense', category: 'financial_expense' },
                '811': { name: 'Chi phí khác', type: 'expense', category: 'other_expense' }
            }
        },
        'IFRS': {
            name: 'International Financial Reporting Standards (IFRS)',
            currency: 'USD',
            dateFormat: 'yyyy-MM-dd',
            taxCode: 'VAT',
            chartOfAccounts: {
                // Assets
                '1000': { name: 'Cash and cash equivalents', type: 'asset', category: 'current_asset' },
                '1100': { name: 'Accounts receivable', type: 'asset', category: 'current_asset' },
                '1200': { name: 'Inventory', type: 'asset', category: 'current_asset' },
                '1300': { name: 'Prepaid expenses', type: 'asset', category: 'current_asset' },
                '1400': { name: 'Other current assets', type: 'asset', category: 'current_asset' },
                
                // Non-current assets
                '2000': { name: 'Property, plant and equipment', type: 'asset', category: 'fixed_asset' },
                '2100': { name: 'Intangible assets', type: 'asset', category: 'fixed_asset' },
                '2200': { name: 'Investment property', type: 'asset', category: 'fixed_asset' },
                '2300': { name: 'Goodwill', type: 'asset', category: 'fixed_asset' },
                '2400': { name: 'Other non-current assets', type: 'asset', category: 'fixed_asset' },
                
                // Liabilities
                '3000': { name: 'Accounts payable', type: 'liability', category: 'current_liability' },
                '3100': { name: 'Short-term borrowings', type: 'liability', category: 'current_liability' },
                '3200': { name: 'Current tax liabilities', type: 'liability', category: 'current_liability' },
                '3300': { name: 'Provisions', type: 'liability', category: 'current_liability' },
                '3400': { name: 'Other current liabilities', type: 'liability', category: 'current_liability' },
                
                // Non-current liabilities
                '4000': { name: 'Long-term borrowings', type: 'liability', category: 'non_current_liability' },
                '4100': { name: 'Deferred tax liabilities', type: 'liability', category: 'non_current_liability' },
                '4200': { name: 'Other non-current liabilities', type: 'liability', category: 'non_current_liability' },
                
                // Equity
                '5000': { name: 'Share capital', type: 'equity', category: 'equity' },
                '5100': { name: 'Share premium', type: 'equity', category: 'equity' },
                '5200': { name: 'Retained earnings', type: 'equity', category: 'equity' },
                '5300': { name: 'Other comprehensive income', type: 'equity', category: 'equity' },
                '5400': { name: 'Treasury shares', type: 'equity', category: 'equity', is_contra: true },
                
                // Revenue
                '6000': { name: 'Revenue from contracts with customers', type: 'revenue', category: 'revenue' },
                '6100': { name: 'Other revenue', type: 'revenue', category: 'revenue' },
                
                // Cost of sales
                '7000': { name: 'Cost of goods sold', type: 'expense', category: 'cost_of_goods_sold' },
                '7100': { name: 'Cost of services', type: 'expense', category: 'cost_of_goods_sold' },
                
                // Operating expenses
                '8000': { name: 'Selling and marketing expenses', type: 'expense', category: 'operating_expense' },
                '8100': { name: 'General and administrative expenses', type: 'expense', category: 'operating_expense' },
                '8200': { name: 'Research and development costs', type: 'expense', category: 'operating_expense' },
                '8300': { name: 'Depreciation and amortization', type: 'expense', category: 'operating_expense' },
                
                // Other income/expenses
                '9000': { name: 'Finance income', type: 'revenue', category: 'financial_income' },
                '9100': { name: 'Finance costs', type: 'expense', category: 'financial_expense' },
                '9200': { name: 'Other income', type: 'revenue', category: 'other_income' },
                '9300': { name: 'Other expenses', type: 'expense', category: 'other_expense' }
            }
        }
    }
};

class AccountingSystem {
    constructor(taxCode, standard = 'VAS') {
        this.taxCode = taxCode;
        this.standard = standard;
        this.journalEntries = [];
        this.generalLedger = {};
        this.fiscalYear = new Date().getFullYear();
        this.initLedger();
    }

    // Chuyển đổi chuẩn kế toán
    setAccountingStandard(standard) {
        if (ACCOUNTING_CONFIG.standards[standard]) {
            this.standard = standard;
            this.initLedger(); // Khởi tạo lại sổ cái theo chuẩn mới
            console.log(`✅ Đã chuyển sang chuẩn kế toán: ${standard}`);
        } else {
            console.error(`❌ Chuẩn kế toán không hỗ trợ: ${standard}`);
        }
    }

    initLedger() {
        this.generalLedger = {};
        const chartOfAccounts = ACCOUNTING_CONFIG.standards[this.standard].chartOfAccounts;
        
        Object.keys(chartOfAccounts).forEach(account => {
            this.generalLedger[account] = {
                account: account,
                name: chartOfAccounts[account].name,
                type: chartOfAccounts[account].type,
                category: chartOfAccounts[account].category,
                debit: 0,
                credit: 0,
                balance: 0,
                transactions: []
            };
        });
    }

    // Hàm hạch toán nghiệp vụ mua hàng (tương thích cả VAS và IFRS)
    recordPurchase(invoice, taxCode) {
        const entry = {
            id: `PE-${Date.now()}`,
            date: invoice.invoiceInfo.date,
            description: `Purchase from ${invoice.sellerInfo.name} - Invoice ${invoice.invoiceInfo.symbol}/${invoice.invoiceInfo.number}`,
            reference: invoice.originalFileId,
            standard: this.standard,
            transactions: []
        };

        // Phân loại sản phẩm để hạch toán
        let inventoryAmount = 0;
        let discountAmount = 0;
        let inputVAT = 0;

        invoice.products.forEach(product => {
            if (product.category === 'hang_hoa') {
                inventoryAmount += product.amount || 0;
                inputVAT += product.taxAmount || 0;
            } else if (product.category === 'chiet_khau') {
                discountAmount += Math.abs(product.amount || 0);
            }
        });

        if (this.standard === 'VAS') {
            // Định khoản theo VAS
            if (inventoryAmount > 0) {
                entry.transactions.push({
                    account: '156',
                    debit: inventoryAmount,
                    credit: 0,
                    description: 'Nhập kho hàng hóa'
                });
            }

            if (inputVAT > 0) {
                entry.transactions.push({
                    account: '133',
                    debit: inputVAT,
                    credit: 0,
                    description: 'VAT đầu vào được khấu trừ'
                });
            }

            if (discountAmount > 0) {
                entry.transactions.push({
                    account: '5211',
                    debit: 0,
                    credit: discountAmount,
                    description: 'Chiết khấu thương mại được hưởng'
                });
            }

            const totalPayable = inventoryAmount + inputVAT - discountAmount;
            entry.transactions.push({
                account: '331',
                debit: 0,
                credit: totalPayable,
                description: 'Phải trả nhà cung cấp'
            });

        } else if (this.standard === 'IFRS') {
            // Định khoản theo IFRS
            if (inventoryAmount > 0) {
                entry.transactions.push({
                    account: '1200',
                    debit: inventoryAmount,
                    credit: 0,
                    description: 'Inventory purchase'
                });
            }

            if (inputVAT > 0) {
                entry.transactions.push({
                    account: '1300', // Prepaid expenses for VAT
                    debit: inputVAT,
                    credit: 0,
                    description: 'Input VAT recoverable'
                });
            }

            if (discountAmount > 0) {
                entry.transactions.push({
                    account: '6100', // Other revenue for discounts
                    debit: 0,
                    credit: discountAmount,
                    description: 'Purchase discount received'
                });
            }

            const totalPayable = inventoryAmount + inputVAT - discountAmount;
            entry.transactions.push({
                account: '3000',
                debit: 0,
                credit: totalPayable,
                description: 'Accounts payable'
            });
        }

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        console.log(`✅ Đã hạch toán mua hàng theo ${this.standard}:`, entry);
        return entry;
    }

    // Hàm hạch toán nghiệp vụ xuất hàng bán
    recordSale(exportRecord, taxCode) {
        const entry = {
            id: `SE-${Date.now()}`,
            date: exportRecord.date,
            description: this.standard === 'VAS' ? 
                `Xuất bán hàng - Phiếu ${exportRecord.id}` :
                `Goods sold - Export ${exportRecord.id}`,
            reference: exportRecord.id,
            standard: this.standard,
            transactions: []
        };

        const totalCost = exportRecord.totalValue || 0;

        if (this.standard === 'VAS') {
            // Định khoản theo VAS
            entry.transactions.push({
                account: '632',
                debit: totalCost,
                credit: 0,
                description: 'Giá vốn hàng xuất bán'
            });

            entry.transactions.push({
                account: '156',
                debit: 0,
                credit: totalCost,
                description: 'Xuất kho hàng bán'
            });

        } else if (this.standard === 'IFRS') {
            // Định khoản theo IFRS
            entry.transactions.push({
                account: '7000',
                debit: totalCost,
                credit: 0,
                description: 'Cost of goods sold'
            });

            entry.transactions.push({
                account: '1200',
                debit: 0,
                credit: totalCost,
                description: 'Inventory reduction'
            });
        }

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        console.log(`✅ Đã hạch toán xuất bán theo ${this.standard}:`, entry);
        return entry;
    }

    // Hàm hạch toán doanh thu bán hàng (IFRS)
    recordRevenue(amount, description, customer = '') {
        const entry = {
            id: `RE-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: description,
            reference: '',
            standard: this.standard,
            transactions: []
        };

        if (this.standard === 'VAS') {
            entry.transactions.push({
                account: '111',
                debit: amount,
                credit: 0,
                description: 'Thu tiền bán hàng'
            });

            entry.transactions.push({
                account: customer ? '131' : '5111',
                debit: 0,
                credit: amount,
                description: customer ? `Thu nợ ${customer}` : 'Doanh thu bán hàng'
            });

        } else if (this.standard === 'IFRS') {
            entry.transactions.push({
                account: '1000',
                debit: amount,
                credit: 0,
                description: 'Cash receipt from sales'
            });

            entry.transactions.push({
                account: customer ? '1100' : '6000',
                debit: 0,
                credit: amount,
                description: customer ? `Receivable from ${customer}` : 'Revenue from sales'
            });
        }

        this.journalEntries.push(entry);
        this.postToLedger(entry);
        
        return entry;
    }

    // Phân loại vào sổ cái (giữ nguyên)
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
                    reference: entry.reference,
                    standard: entry.standard
                });
            }
        });
    }

    // Báo cáo kết quả kinh doanh theo cả hai chuẩn
    generateIncomeStatement(startDate, endDate) {
        if (this.standard === 'VAS') {
            const revenue = this.getAccountBalance('511') - this.getAccountBalance('521');
            const costOfGoodsSold = this.getAccountBalance('632');
            const operatingExpenses = this.getAccountBalance('641') + this.getAccountBalance('642');
            const financialExpenses = this.getAccountBalance('635');
            const otherExpenses = this.getAccountBalance('811');

            const grossProfit = revenue - costOfGoodsSold;
            const operatingProfit = grossProfit - operatingExpenses;
            const netProfit = operatingProfit - financialExpenses - otherExpenses;

            return {
                standard: 'VAS',
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

        } else if (this.standard === 'IFRS') {
            const revenue = this.getAccountBalance('6000') + this.getAccountBalance('6100');
            const costOfGoodsSold = this.getAccountBalance('7000') + this.getAccountBalance('7100');
            const operatingExpenses = this.getAccountBalance('8000') + this.getAccountBalance('8100') + this.getAccountBalance('8200') + this.getAccountBalance('8300');
            const financeCosts = this.getAccountBalance('9100');
            const financeIncome = this.getAccountBalance('9000');
            const otherIncome = this.getAccountBalance('9200');
            const otherExpenses = this.getAccountBalance('9300');

            const grossProfit = revenue - costOfGoodsSold;
            const operatingProfit = grossProfit - operatingExpenses;
            const profitBeforeTax = operatingProfit + financeIncome - financeCosts + otherIncome - otherExpenses;
            const netProfit = profitBeforeTax; // Chưa tính thuế

            return {
                standard: 'IFRS',
                revenue,
                costOfGoodsSold,
                grossProfit,
                operatingExpenses,
                operatingProfit,
                financeCosts,
                financeIncome,
                otherIncome,
                otherExpenses,
                profitBeforeTax,
                netProfit,
                period: { startDate, endDate }
            };
        }
    }

    // Bảng cân đối kế toán theo cả hai chuẩn
    generateBalanceSheet(asOfDate) {
        if (this.standard === 'VAS') {
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

            const currentLiabilities = 
                this.getAccountBalance('331') + 
                this.getAccountBalance('333') + 
                this.getAccountBalance('334');

            const totalLiabilities = currentLiabilities;

            const equity = 
                this.getAccountBalance('411') + 
                this.getAccountBalance('421');

            return {
                standard: 'VAS',
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

        } else if (this.standard === 'IFRS') {
            const currentAssets = 
                this.getAccountBalance('1000') + 
                this.getAccountBalance('1100') + 
                this.getAccountBalance('1200') + 
                this.getAccountBalance('1300') + 
                this.getAccountBalance('1400');
            
            const nonCurrentAssets = 
                this.getAccountBalance('2000') + 
                this.getAccountBalance('2100') + 
                this.getAccountBalance('2200') + 
                this.getAccountBalance('2300') + 
                this.getAccountBalance('2400');

            const totalAssets = currentAssets + nonCurrentAssets;

            const currentLiabilities = 
                this.getAccountBalance('3000') + 
                this.getAccountBalance('3100') + 
                this.getAccountBalance('3200') + 
                this.getAccountBalance('3300') + 
                this.getAccountBalance('3400');

            const nonCurrentLiabilities = 
                this.getAccountBalance('4000') + 
                this.getAccountBalance('4100') + 
                this.getAccountBalance('4200');

            const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

            const equity = 
                this.getAccountBalance('5000') + 
                this.getAccountBalance('5100') + 
                this.getAccountBalance('5200') + 
                this.getAccountBalance('5300') - 
                this.getAccountBalance('5400');

            return {
                standard: 'IFRS',
                assets: {
                    currentAssets,
                    nonCurrentAssets,
                    totalAssets
                },
                liabilities: {
                    currentLiabilities,
                    nonCurrentLiabilities,
                    totalLiabilities
                },
                equity: {
                    shareCapital: this.getAccountBalance('5000'),
                    sharePremium: this.getAccountBalance('5100'),
                    retainedEarnings: this.getAccountBalance('5200'),
                    otherComprehensiveIncome: this.getAccountBalance('5300'),
                    treasuryShares: this.getAccountBalance('5400'),
                    totalEquity: equity
                },
                asOfDate,
                isBalanced: Math.abs(totalAssets - (totalLiabilities + equity)) < 1
            };
        }
    }

    // Các hàm utility (giữ nguyên)
    getAccountBalance(accountNumber) {
        const account = this.generalLedger[accountNumber];
        return account ? account.balance : 0;
    }

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
            isBalanced: Math.abs(totalDebit - totalCredit) < 1,
            difference: Math.abs(totalDebit - totalCredit)
        };
    }

    getGeneralJournal(startDate = null, endDate = null) {
        let entries = this.journalEntries;
        if (startDate && endDate) {
            entries = entries.filter(entry => 
                entry.date >= startDate && entry.date <= endDate
            );
        }
        return entries;
    }

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
            openingBalance: 0,
            transactions,
            closingBalance: account.balance
        };
    }
}

function setupAccountingUI() {
    const accountingTabs = `
        <div class="accounting-container">
            <div class="accounting-header">
                <div class="standard-selector">
                    <label>Chuẩn kế toán:</label>
                    <select id="accounting-standard" onchange="changeAccountingStandard(this.value)">
                        <option value="VAS">VAS (Việt Nam)</option>
                        <option value="IFRS">IFRS (Quốc tế)</option>
                    </select>
                    <span id="current-standard-badge" class="standard-badge vas">VAS</span>
                </div>
                <div class="accounting-info">
                    <span id="currency-display">💰 VND</span>
                    <span id="fiscal-year">📅 Năm tài chính: ${new Date().getFullYear()}</span>
                </div>
            </div>

            <div class="accounting-tabs">
                <button class="accounting-tab-btn active" onclick="showAccountingTab('general-ledger')">
                    📊 Sổ Cái
                </button>
                <button class="accounting-tab-btn" onclick="showAccountingTab('general-journal')">
                    📝 Nhật Ký Chung
                </button>
                <button class="accounting-tab-btn" onclick="showAccountingTab('balance-sheet')">
                    ⚖️ Bảng CĐKT
                </button>
                <button class="accounting-tab-btn" onclick="showAccountingTab('income-statement')">
                    💰 KQKD
                </button>
                <button class="accounting-tab-btn" onclick="showAccountingTab('trial-balance')">
                    🎯 Cân Đối TK
                </button>
                <button class="accounting-tab-btn" onclick="showAccountingTab('standards-comparison')">
                    🔄 So sánh
                </button>
            </div>
            
            <div id="accounting-tab-content" class="accounting-tab-content">
                <div class="accounting-card">
                    <div class="accounting-card-header">
                        🏢 Hệ Thống Kế Toán Đa Chuẩn
                    </div>
                    <div class="accounting-card-body">
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🌍</div>
                            <h3>Hỗ trợ Chuẩn mực Kế toán VAS & IFRS</h3>
                            <p style="color: #6c757d; margin-top: 10px;">
                                Chọn chuẩn kế toán và tab để bắt đầu
                            </p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 30px;">
                                <div class="standard-card vas">
                                    <h4>VAS</h4>
                                    <p>Chuẩn mực Việt Nam</p>
                                </div>
                                <div class="standard-card ifrs">
                                    <h4>IFRS</h4>
                                    <p>Chuẩn mực Quốc tế</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const keToanTab = document.getElementById('ke-toan');
    if (keToanTab) {
        keToanTab.querySelector('.content-body').innerHTML = accountingTabs;
    }
}

function showAccountingTab(tabName) {
    const contentDiv = document.getElementById('accounting-tab-content');
    if (!contentDiv) return;

    // Cập nhật active state
    document.querySelectorAll('.accounting-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.accounting-tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

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
        case 'standards-comparison':
            showStandardsComparison();
            break;
        default:
            showGeneralLedger();
    }
}
// Hàm chuyển đổi chuẩn kế toán
function changeAccountingStandard(standard) {
    const accountingSystem = getCurrentAccountingSystem();
    if (accountingSystem) {
        accountingSystem.setAccountingStandard(standard);
        updateStandardUI(standard);
        saveAccountingData();
        
        // Refresh tab hiện tại
        const activeTab = document.querySelector('.accounting-tab-btn.active');
        if (activeTab) {
            const onclickAttr = activeTab.getAttribute('onclick');
            // Dòng này đã được sửa lỗi đảm bảo có tabName
            const match = onclickAttr.match(/showAccountingTab\('([^']+)'\)/);
            if (match && match[1]) {
                const tabName = match[1];
                showAccountingTab(tabName);
            }
        }
    }
}

// Cập nhật giao diện theo chuẩn
function updateStandardUI(standard) {
    const badge = document.getElementById('current-standard-badge');
    const currencyDisplay = document.getElementById('currency-display');
    
    if (badge && currencyDisplay) {
        badge.textContent = standard;
        badge.className = `standard-badge ${standard.toLowerCase()}`;
        
        const currency = standard === 'VAS' ? 'VND' : 'USD';
        currencyDisplay.textContent = `💰 ${currency}`;
    }
    
    // Cập nhật select box
    const select = document.getElementById('accounting-standard');
    if (select) {
        select.value = standard;
    }
}
// Thêm CSS cho đa chuẩn
const additionalCSS = `
/* CSS cho hệ thống đa chuẩn */
.accounting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.standard-selector {
    display: flex;
    align-items: center;
    gap: 10px;
}

.standard-selector select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
}

.standard-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: white;
}

.standard-badge.vas {
    background: linear-gradient(135deg, #dc3545, #c82333);
}

.standard-badge.ifrs {
    background: linear-gradient(135deg, #007bff, #0056b3);
}

.accounting-info {
    display: flex;
    gap: 15px;
    font-size: 14px;
    color: #6c757d;
}

.standard-card {
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    min-width: 120px;
    border: 2px solid transparent;
}

.standard-card.vas {
    border-color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
}

.standard-card.ifrs {
    border-color: #007bff;
    background: rgba(0, 123, 255, 0.1);
}

.standard-card h4 {
    margin: 0 0 5px 0;
    color: #495057;
}

.standard-card p {
    margin: 0;
    font-size: 12px;
    color: #6c757d;
}

/* Tab so sánh chuẩn */
.comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.comparison-section {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.comparison-section h4 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #007bff;
}

@media (max-width: 768px) {
    .accounting-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }
    
    .comparison-grid {
        grid-template-columns: 1fr;
    }
}

/* Thêm style cho báo cáo */
.status-balanced {
    color: #155724;
    background-color: #d4edda;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.status-unbalanced {
    color: #721c24;
    background-color: #f8d7da;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
}

.balance-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    margin-left: 5px;
}

.balance-badge.balance-debit {
    background-color: #ffe5e5;
    color: #dc3545;
}

.balance-badge.balance-credit {
    background-color: #e5f7ff;
    color: #007bff;
}
`;

// Thêm CSS vào document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
// Hàm hiển thị tab so sánh chuẩn
function showStandardsComparison() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const vasSystem = new AccountingSystem('comparison', 'VAS');
    const ifrsSystem = new AccountingSystem('comparison', 'IFRS');
    
    // Tạo dữ liệu mẫu để so sánh
    // const sampleData = {
    //     revenue: 1000000000,
    //     costOfGoodsSold: 600000000,
    //     operatingExpenses: 200000000
    // };
    
    // Báo cáo mẫu không cần thiết cho giao diện so sánh này, chỉ cần so sánh đặc điểm
    // const vasReport = vasSystem.generateIncomeStatement('2024-01-01', '2024-12-31');
    // const ifrsReport = ifrsSystem.generateIncomeStatement('2024-01-01', '2024-12-31');
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">🔄 So sánh Chuẩn mực Kế toán</div>
            <div class="accounting-card-body">
                <div class="comparison-grid">
                    <div class="comparison-section">
                        <h4>📊 VAS (Việt Nam)</h4>
                        <p><strong>Đặc điểm:</strong></p>
                        <ul>
                            <li>Tuân thủ Luật Kế toán Việt Nam</li>
                            <li>Báo cáo bằng tiếng Việt</li>
                            <li>Đơn vị tiền tệ: VND</li>
                            <li>Phù hợp với doanh nghiệp trong nước</li>
                        </ul>
                        <p><strong>Hệ thống tài khoản:</strong> 3 chữ số</p>
                        <p><strong>Ưu điểm:</strong> Đơn giản, dễ thực hiện</p>
                    </div>
                    
                    <div class="comparison-section">
                        <h4>🌍 IFRS (Quốc tế)</h4>
                        <p><strong>Đặc điểm:</strong></p>
                        <ul>
                            <li>Chuẩn mực kế toán quốc tế</li>
                            <li>Báo cáo bằng tiếng Anh</li>
                            <li>Đơn vị tiền tệ: USD hoặc ngoại tệ mạnh</li>
                            <li>Phù hợp với doanh nghiệp đa quốc gia</li>
                        </ul>
                        <p><strong>Hệ thống tài khoản:</strong> 4 chữ số</p>
                        <p><strong>Ưu điểm:</strong> Minh bạch, được công nhận toàn cầu</p>
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <h4>Khuyến nghị lựa chọn</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="standard-card vas" style="cursor: pointer;" onclick="changeAccountingStandard('VAS')">
                            <h4>Chọn VAS nếu:</h4>
                            <p>• Doanh nghiệp Việt Nam</p>
                            <p>• Không có giao dịch quốc tế</p>
                            <p>• Muốn đơn giản hóa</p>
                        </div>
                        <div class="standard-card ifrs" style="cursor: pointer;" onclick="changeAccountingStandard('IFRS')">
                            <h4>Chọn IFRS nếu:</h4>
                            <p>• Doanh nghiệp đa quốc gia</p>
                            <p>• Có nhà đầu tư nước ngoài</p>
                            <p>• Muốn niêm yết quốc tế</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    // Cập nhật lại UI nếu có
    const currentSystem = getCurrentAccountingSystem();
    if (currentSystem) {
        updateStandardUI(currentSystem.standard);
    }
}
// Hàm tích hợp tự động khi nhập hóa đơn
function integratePurchaseAccounting(invoice, taxCode) {
    const accountingSystem = getAccountingSystem(taxCode);
    if (!accountingSystem) {
        console.error('Không thể lấy hệ thống kế toán cho MST:', taxCode);
        return;
    }
    
    try {
        accountingSystem.recordPurchase(invoice, taxCode);
        saveAccountingData();
        console.log(`✅ Đã tích hợp hạch toán mua hàng cho công ty ${taxCode} theo ${accountingSystem.standard}`);
    } catch (error) {
        console.error(`❌ Lỗi hạch toán mua hàng cho công ty ${taxCode}:`, error);
    }
}
// =======================
// CÁC HÀM BỊ THIẾU - BỔ SUNG HOÀN CHỈNH
// =======================

// Hàm khởi tạo hệ thống kế toán từ dữ liệu đã lưu
function initAccountingFromSavedData() {
    if (!window.hkdData || !window.accountingSystems) return; // Đảm bảo window.accountingSystems đã được khởi tạo
    
    Object.keys(window.hkdData).forEach(taxCode => {
        const company = window.hkdData[taxCode];
        if (company.accountingData) {
            // Khôi phục dữ liệu kế toán từ localStorage
            const standard = company.accountingData.standard || 'VAS';
            // Tạo mới và lưu vào window.accountingSystems
            window.accountingSystems[taxCode] = new AccountingSystem(taxCode, standard);
            const accountingSystem = window.accountingSystems[taxCode];
            
            // Khôi phục sổ sách
            accountingSystem.journalEntries = company.accountingData.journalEntries || [];
            accountingSystem.generalLedger = company.accountingData.generalLedger || {};
            
            console.log(`✅ Đã khôi phục dữ liệu kế toán cho công ty: ${taxCode} (${standard})`);
        }
    });
}

// Hàm lưu dữ liệu kế toán vào hkdData
function saveAccountingData() {
    if (!window.hkdData || !window.accountingSystems) return;
    
    Object.keys(window.accountingSystems).forEach(taxCode => {
        const accountingSystem = window.accountingSystems[taxCode];
        if (accountingSystem && window.hkdData[taxCode]) {
            window.hkdData[taxCode].accountingData = {
                journalEntries: accountingSystem.journalEntries,
                generalLedger: accountingSystem.generalLedger,
                standard: accountingSystem.standard,
                lastUpdated: new Date().toISOString()
            };
        }
    });
    // Giả định hàm lưu global có tồn tại
    if (typeof window.saveHkdData === 'function') {
        window.saveHkdData();
    }
}
// Hàm tích hợp tự động khi xuất hàng
function integrateSaleAccounting(exportRecord, taxCode) {
    const accountingSystem = getAccountingSystem(taxCode);
    if (!accountingSystem) {
        console.error('Không thể lấy hệ thống kế toán cho MST:', taxCode);
        return;
    }
    
    try {
        accountingSystem.recordSale(exportRecord, taxCode);
        saveAccountingData();
        console.log(`✅ Đã tích hợp hạch toán xuất bán cho công ty ${taxCode} theo ${accountingSystem.standard}`);
    } catch (error) {
        console.error(`❌ Lỗi hạch toán xuất bán cho công ty ${taxCode}:`, error);
    }
}

// Hàm lấy hệ thống kế toán theo MST
function getAccountingSystem(taxCode) {
    if (!taxCode || taxCode === 'UNKNOWN') return null;
    
    // Đảm bảo window.accountingSystems đã tồn tại
    if (!window.accountingSystems) {
        window.accountingSystems = {};
    }

    if (!window.accountingSystems[taxCode]) {
        // Kiểm tra xem công ty có tồn tại trong hkdData không
        const savedStandard = window.hkdData?.[taxCode]?.accountingData?.standard || 'VAS';
        window.accountingSystems[taxCode] = new AccountingSystem(taxCode, savedStandard);
        
    }
    return window.accountingSystems[taxCode];
}

/**
 * Hàm LẤY HỆ THỐNG KẾ TOÁN HIỆN TẠI (Đã sửa lỗi)
 * Phụ thuộc vào biến global window.currentCompany và window.accountingSystems
 */
function getCurrentAccountingSystem() {
    if (!window.currentCompany) return null;
    return getAccountingSystem(window.currentCompany);
}


// Hàm hiển thị thông báo khi chưa chọn công ty
function showNoCompanyMessage() {
    return `
        <div class="accounting-card">
            <div class="accounting-card-header">📊 Thông báo</div>
            <div class="accounting-card-body">
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🏢</div>
                    <h4>Vui lòng chọn công ty</h4>
                    <p style="color: #6c757d; margin-top: 10px;">
                        Chọn một công ty từ danh sách bên trái để xem thông tin kế toán.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function showGeneralJournal() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const accountingSystem = getCurrentAccountingSystem();
    
    if (!accountingSystem) {
        contentDiv.innerHTML = showNoCompanyMessage();
        return;
    }
    
    const standardInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard];
    const now = new Date();
    // Định dạng ngày theo chuẩn ISO để lọc
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const journalEntries = accountingSystem.getGeneralJournal(firstDay, lastDay);
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">
                📝 Nhật Ký Chung - ${standardInfo.name}
            </div>
            <div class="accounting-card-body">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <strong>Chuẩn:</strong> ${accountingSystem.standard} | 
                    <strong>Kỳ:</strong> Tháng ${now.getMonth() + 1}/${now.getFullYear()} |
                    <strong>Số bút toán:</strong> ${journalEntries.length}
                </div>
    `;

    if (journalEntries.length === 0) {
        html += `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <h4>Chưa có nghiệp vụ kế toán</h4>
                <p style="color: #6c757d;">Dữ liệu sẽ xuất hiện khi bạn nhập hóa đơn hoặc xuất hàng.</p>
            </div>
        `;
    } else {
        html += `
            <div style="overflow-x: auto;">
                <table class="accounting-table">
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
            entry.transactions.forEach((transaction, index) => {
                const accountInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard].chartOfAccounts[transaction.account];
                html += `
                    <tr>
                        <td>${index === 0 ? (window.formatDate ? window.formatDate(entry.date) : entry.date) : ''}</td>
                        <td>${index === 0 ? entry.reference : ''}</td>
                        <td>${index === 0 ? entry.description : ''}</td>
                        <td><strong>${transaction.account}</strong> - ${accountInfo?.name || ''}</td>
                        <td style="text-align: right;">${transaction.debit > 0 ? (window.formatCurrency ? window.formatCurrency(transaction.debit) : transaction.debit) : ''}</td>
                        <td style="text-align: right;">${transaction.credit > 0 ? (window.formatCurrency ? window.formatCurrency(transaction.credit) : transaction.credit) : ''}</td>
                    </tr>
                `;
            });
            
            html += `<tr style="height: 10px; background-color: #f8f9fa;"><td colspan="6"></td></tr>`;
        });

        html += `</tbody></table></div>`;
    }

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

function showGeneralLedger() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const accountingSystem = getCurrentAccountingSystem();
    
    if (!accountingSystem) {
        contentDiv.innerHTML = showNoCompanyMessage();
        return;
    }
    
    const standardInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard];
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">
                📊 Sổ Cái Tổng Hợp - ${standardInfo.name}
            </div>
            <div class="accounting-card-body">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <strong>Chuẩn:</strong> ${accountingSystem.standard} | 
                    <strong>Tiền tệ:</strong> ${standardInfo.currency} |
                    <strong>Số tài khoản:</strong> ${Object.keys(accountingSystem.generalLedger).length}
                </div>
    `;

    // Lỗi: Biến CHART_OF_ACCOUNTS không được định nghĩa
    const currentChartOfAccounts = standardInfo.chartOfAccounts;

    const hasData = Object.values(accountingSystem.generalLedger).some(account => account.debit > 0 || account.credit > 0);
    
    if (!hasData) {
        html += `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <h4>Chưa có số liệu kế toán</h4>
                <p style="color: #6c757d;">Dữ liệu sẽ xuất hiện khi bạn nhập hóa đơn hoặc xuất hàng.</p>
            </div>
        `;
    } else {
        html += `
            <div style="overflow-x: auto;">
                <table class="accounting-table">
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

        Object.values(accountingSystem.generalLedger).forEach(account => {
            if (account.debit > 0 || account.credit > 0) {
                // Sử dụng account.type để xác định loại tài khoản (asset/expense: dư Nợ, liability/equity/revenue: dư Có)
                const isDebitType = account.type === 'asset' || account.type === 'expense';
                let balanceType = '';
                
                if (account.balance > 0) {
                    balanceType = isDebitType ? 'Nợ' : 'Có';
                } else if (account.balance < 0) {
                    balanceType = isDebitType ? 'Có' : 'Nợ';
                }
                
                const badgeClass = balanceType === 'Nợ' ? 'balance-badge balance-debit' : 'balance-badge balance-credit';
                    
                html += `
                    <tr>
                        <td><strong>${account.account}</strong></td>
                        <td>${account.name}</td>
                        <td style="text-align: right;">${window.formatCurrency ? window.formatCurrency(account.debit) : account.debit}</td>
                        <td style="text-align: right;">${window.formatCurrency ? window.formatCurrency(account.credit) : account.credit}</td>
                        <td style="text-align: right;">
                            ${window.formatCurrency ? window.formatCurrency(Math.abs(account.balance)) : Math.abs(account.balance)} 
                            <span class="${badgeClass}">${balanceType}</span>
                        </td>
                        <td>
                            <button class="accounting-btn accounting-btn-info" onclick="showAccountDetail('${account.account}')">
                                👁️ Chi tiết
                            </button>
                        </td>
                    </tr>
                `;
            }
        });

        html += `</tbody></table></div>`;
    }

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

function showAccountDetail(accountNumber) {
    const accountingSystem = getCurrentAccountingSystem();
    if (!accountingSystem) {
        alert('Vui lòng chọn công ty.');
        return;
    }

    const ledger = accountingSystem.getGeneralLedger(accountNumber);
    if (!ledger) {
        alert('Không tìm thấy tài khoản: ' + accountNumber);
        return;
    }
    
    // Lấy thông tin tài khoản hiện tại từ config
    const accountInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard].chartOfAccounts[accountNumber];
    if (!accountInfo) {
         alert('Không tìm thấy cấu hình tài khoản: ' + accountNumber);
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
    // Cần tính lại số dư mở đầu nếu có
    const isDebitType = accountInfo.type === 'asset' || accountInfo.type === 'expense';
    
    // Tính số dư đầu kỳ (nếu không có giao dịch trong kỳ thì số dư đầu kỳ bằng số dư cuối kỳ trước)
    // Để đơn giản, ta sẽ chỉ tính số dư lũy kế từ đầu đến cuối danh sách transactions
    
    ledger.transactions.forEach(transaction => {
        // Cần tính lại runningBalance theo logic của Sổ Cái Chi Tiết
        if (isDebitType) {
            runningBalance += transaction.debit - transaction.credit;
        } else {
            runningBalance += transaction.credit - transaction.debit;
        }

        const balanceType = runningBalance > 0 ? 
            (isDebitType ? 'Nợ' : 'Có') :
            (runningBalance < 0 ? (isDebitType ? 'Có' : 'Nợ') : '');

        detailHtml += `
            <tr>
                <td>${window.formatDate ? window.formatDate(transaction.date) : transaction.date}</td>
                <td>${transaction.description}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.debit > 0 ? (window.formatCurrency ? window.formatCurrency(transaction.debit) : transaction.debit) : ''}</td>
                <td>${transaction.credit > 0 ? (window.formatCurrency ? window.formatCurrency(transaction.credit) : transaction.credit) : ''}</td>
                <td>${window.formatCurrency ? window.formatCurrency(Math.abs(runningBalance)) : Math.abs(runningBalance)} ${balanceType}</td>
            </tr>
        `;
    });

    // Xác định loại dư cuối kỳ
    let finalBalanceType = '';
    if (ledger.closingBalance > 0) {
        finalBalanceType = isDebitType ? 'Nợ' : 'Có';
    } else if (ledger.closingBalance < 0) {
        finalBalanceType = isDebitType ? 'Có' : 'Nợ';
    }


    detailHtml += `
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 10px; font-weight: bold;">
                Số dư cuối kỳ: ${window.formatCurrency ? window.formatCurrency(Math.abs(ledger.closingBalance)) : Math.abs(ledger.closingBalance)} 
                ${finalBalanceType}
            </div>
        </div>
    `;

    // Giả định window.showModal có tồn tại
    if (typeof window.showModal === 'function') {
        window.showModal(`Sổ Cái TK ${accountNumber}`, detailHtml);
    } else {
        // Fallback nếu không có modal
        const contentDiv = document.getElementById('accounting-tab-content');
        contentDiv.innerHTML = detailHtml;
    }
}

function showBalanceSheet() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const accountingSystem = getCurrentAccountingSystem();
    
    if (!accountingSystem) {
        contentDiv.innerHTML = showNoCompanyMessage();
        return;
    }
    
    const balanceSheet = accountingSystem.generateBalanceSheet(new Date().toISOString().split('T')[0]);
    const standardInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard];
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">
                ⚖️ Bảng Cân Đối Kế Toán - ${standardInfo.name}
            </div>
            <div class="accounting-card-body">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <strong>Ngày:</strong> ${window.formatDate ? window.formatDate(balanceSheet.asOfDate) : balanceSheet.asOfDate} | 
                    <strong>Tiền tệ:</strong> ${standardInfo.currency} |
                    <strong>Trạng thái:</strong> <span class="${balanceSheet.isBalanced ? 'status-balanced' : 'status-unbalanced'}">${balanceSheet.isBalanced ? 'Cân đối' : 'Không cân đối'}</span>
                </div>
    `;
    
    // Sử dụng window.formatCurrency để định dạng tiền tệ
    const fc = window.formatCurrency || ((v) => v.toLocaleString('en-US'));

    if (accountingSystem.standard === 'VAS') {
        html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>TÀI SẢN</h4>
                    <table class="accounting-table">
                        <tr>
                            <td><strong>A. TÀI SẢN NGẮN HẠN</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.currentAssets)}</td>
                        </tr>
                        <tr>
                            <td><strong>B. TÀI SẢN DÀI HẠN</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.fixedAssets)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG CỘNG TÀI SẢN</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.totalAssets)}</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h4>NGUỒN VỐN</h4>
                    <table class="accounting-table">
                        <tr>
                            <td><strong>A. NỢ PHẢI TRẢ</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.totalLiabilities)}</td>
                        </tr>
                        <tr>
                            <td><strong>B. VỐN CHỦ SỞ HỮU</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.equity.totalEquity)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TỔNG CỘNG NGUỒN VỐN</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    } else if (accountingSystem.standard === 'IFRS') {
        html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4>ASSETS</h4>
                    <table class="accounting-table">
                        <tr>
                            <td><strong>Current Assets</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.currentAssets)}</td>
                        </tr>
                        <tr>
                            <td><strong>Non-current Assets</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.nonCurrentAssets)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TOTAL ASSETS</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.assets.totalAssets)}</td>
                        </tr>
                    </table>
                </div>
                <div>
                    <h4>LIABILITIES & EQUITY</h4>
                    <table class="accounting-table">
                        <tr>
                            <td><strong>Current Liabilities</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.currentLiabilities)}</td>
                        </tr>
                        <tr>
                            <td><strong>Non-current Liabilities</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.nonCurrentLiabilities)}</td>
                        </tr>
                        <tr style="border-top: 1px solid #333;">
                            <td><strong>Total Liabilities</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.totalLiabilities)}</td>
                        </tr>
                        <tr>
                            <td><strong>Share Capital</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.equity.shareCapital)}</td>
                        </tr>
                        <tr>
                            <td><strong>Retained Earnings</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.equity.retainedEarnings)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Equity</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.equity.totalEquity)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td><strong>TOTAL LIABILITIES & EQUITY</strong></td>
                            <td style="text-align: right;">${fc(balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

function showIncomeStatement() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const accountingSystem = getCurrentAccountingSystem();
    
    if (!accountingSystem) {
        contentDiv.innerHTML = showNoCompanyMessage();
        return;
    }
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const incomeStatement = accountingSystem.generateIncomeStatement(firstDay, lastDay);
    const standardInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard];
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">
                💰 Báo Cáo Kết Quả Kinh Doanh - ${standardInfo.name}
            </div>
            <div class="accounting-card-body">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <strong>Kỳ:</strong> Tháng ${now.getMonth() + 1}/${now.getFullYear()} | 
                    <strong>Tiền tệ:</strong> ${standardInfo.currency}
                </div>
    `;

    // Sử dụng window.formatCurrency để định dạng tiền tệ
    const fc = window.formatCurrency || ((v) => v.toLocaleString('en-US'));

    if (accountingSystem.standard === 'VAS') {
        html += `
            <table class="accounting-table">
                <tr>
                    <td><strong>1. Doanh thu bán hàng và cung cấp dịch vụ</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.revenue)}</td>
                </tr>
                <tr>
                    <td><strong>2. Giá vốn hàng bán</strong></td>
                    <td style="text-align: right;">(${fc(incomeStatement.costOfGoodsSold)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>LỢI NHUẬN GỘP</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.grossProfit)}</td>
                </tr>
                <tr>
                    <td>3. Chi phí bán hàng & QLDN</td>
                    <td style="text-align: right;">(${fc(incomeStatement.operatingExpenses)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>LỢI NHUẬN THUẦN TỪ HĐKD</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.operatingProfit)}</td>
                </tr>
                <tr>
                    <td>4. Chi phí tài chính</td>
                    <td style="text-align: right;">(${fc(incomeStatement.financialExpenses)})</td>
                </tr>
                <tr>
                    <td>5. Chi phí khác</td>
                    <td style="text-align: right;">(${fc(incomeStatement.otherExpenses)})</td>
                </tr>
                <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f8f9fa;">
                    <td><strong>LỢI NHUẬN SAU THUẾ</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.netProfit)}</td>
                </tr>
            </table>
        `;
    } else if (accountingSystem.standard === 'IFRS') {
        html += `
            <table class="accounting-table">
                <tr>
                    <td><strong>Revenue</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.revenue)}</td>
                </tr>
                <tr>
                    <td><strong>Cost of goods sold</strong></td>
                    <td style="text-align: right;">(${fc(incomeStatement.costOfGoodsSold)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>GROSS PROFIT</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.grossProfit)}</td>
                </tr>
                <tr>
                    <td>Operating expenses</td>
                    <td style="text-align: right;">(${fc(incomeStatement.operatingExpenses)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>OPERATING PROFIT</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.operatingProfit)}</td>
                </tr>
                <tr>
                    <td>Finance income</td>
                    <td style="text-align: right;">${fc(incomeStatement.financeIncome)}</td>
                </tr>
                <tr>
                    <td>Finance costs</td>
                    <td style="text-align: right;">(${fc(incomeStatement.financeCosts)})</td>
                </tr>
                <tr>
                    <td>Other income</td>
                    <td style="text-align: right;">${fc(incomeStatement.otherIncome)}</td>
                </tr>
                <tr>
                    <td>Other expenses</td>
                    <td style="text-align: right;">(${fc(incomeStatement.otherExpenses)})</td>
                </tr>
                <tr style="border-top: 1px solid #333; font-weight: bold;">
                    <td><strong>PROFIT BEFORE TAX</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.profitBeforeTax)}</td>
                </tr>
                <tr style="border-top: 2px solid #333; font-weight: bold; background-color: #f8f9fa;">
                    <td><strong>NET PROFIT</strong></td>
                    <td style="text-align: right;">${fc(incomeStatement.netProfit)}</td>
                </tr>
            </table>
        `;
    }

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

function showTrialBalance() {
    const contentDiv = document.getElementById('accounting-tab-content');
    const accountingSystem = getCurrentAccountingSystem();
    
    if (!accountingSystem) {
        contentDiv.innerHTML = showNoCompanyMessage();
        return;
    }
    
    const trialBalance = accountingSystem.checkTrialBalance();
    const standardInfo = ACCOUNTING_CONFIG.standards[accountingSystem.standard];
    
    let html = `
        <div class="accounting-card">
            <div class="accounting-card-header">
                🎯 Bảng Cân Đối Số Phát Sinh - ${standardInfo.name}
            </div>
            <div class="accounting-card-body">
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <strong>Tiền tệ:</strong> ${standardInfo.currency} |
                    <strong>Trạng thái:</strong> <span class="${trialBalance.isBalanced ? 'status-balanced' : 'status-unbalanced'}">${trialBalance.isBalanced ? 'Cân đối' : 'Không cân đối'}</span>
                </div>
    `;
    
    // Sử dụng window.formatCurrency để định dạng tiền tệ
    const fc = window.formatCurrency || ((v) => v.toLocaleString('en-US'));

    const hasData = Object.values(accountingSystem.generalLedger).some(account => account.debit > 0 || account.credit > 0);
    
    if (!hasData) {
        html += `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
                <h4>Chưa có số liệu kế toán</h4>
                <p style="color: #6c757d;">Dữ liệu sẽ xuất hiện khi bạn nhập hóa đơn hoặc xuất hàng.</p>
            </div>
        `;
    } else {
        html += `
            <div style="overflow-x: auto;">
                <table class="accounting-table">
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

        Object.values(accountingSystem.generalLedger).forEach(account => {
            if (account.debit > 0 || account.credit > 0) {
                html += `
                    <tr>
                        <td><strong>${account.account}</strong></td>
                        <td>${account.name}</td>
                        <td style="text-align: right;">${fc(account.debit)}</td>
                        <td style="text-align: right;">${fc(account.credit)}</td>
                    </tr>
                `;
            }
        });

        html += `
                    </tbody>
                    <tfoot style="border-top: 2px solid #333; font-weight: bold;">
                        <tr>
                            <td colspan="2"><strong>TỔNG CỘNG</strong></td>
                            <td style="text-align: right;">${fc(trialBalance.totalDebit)}</td>
                            <td style="text-align: right;">${fc(trialBalance.totalCredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 15px; background: ${trialBalance.isBalanced ? '#d4edda' : '#f8d7da'}; border-radius: 6px;">
                <strong style="color: ${trialBalance.isBalanced ? '#155724' : '#721c24'};">
                    ${trialBalance.isBalanced ? '✓ CÂN ĐỐI' : `✗ KHÔNG CÂN ĐỐI - Chênh lệch: ${fc(trialBalance.difference)}`}
                </strong>
            </div>
        `;
    }

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}


// =======================
// THỐNG KÊ VÀ BÁO CÁO
// =======================

function updateAccountingStats() {
    const totalInvoicesEl = document.getElementById('total-invoices');
    const totalInvoiceValueEl = document.getElementById('total-invoice-value');
    const totalProductsEl = document.getElementById('total-products');
    const totalStockValueEl = document.getElementById('total-stock-value');

    // Sử dụng window.currentCompany để kiểm tra công ty hiện tại
    if (!totalInvoicesEl || !window.currentCompany) return; 

    const hkd = window.hkdData?.[window.currentCompany];
    if (!hkd) return;
    
    // Sử dụng window.formatCurrency để định dạng tiền tệ
    const fc = window.formatCurrency || ((v) => v.toLocaleString('en-US'));

    // Tính tổng số hóa đơn
    const totalInvoices = (hkd.invoices || []).length;
    
    // Tính tổng giá trị hóa đơn
    let totalInvoiceValue = 0;
    (hkd.invoices || []).forEach(invoice => {
        totalInvoiceValue += invoice.summary?.calculatedTotal || 0;
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
    totalInvoiceValueEl.textContent = fc(totalInvoiceValue);
    totalProductsEl.textContent = totalProducts.toLocaleString('vi-VN');
    totalStockValueEl.textContent = fc(totalStockValue);
}

function generateMonthlyReport() {
    if (!window.currentCompany || !window.hkdData?.[window.currentCompany]) {
        alert('Vui lòng chọn công ty để tạo báo cáo.');
        return;
    }
    
    const reportMonthInput = document.getElementById('report-month');
    const reportDataEl = document.getElementById('report-data');
    const reportContainer = document.getElementById('monthly-report');

    if (!reportMonthInput || !reportDataEl || !reportContainer) return;
    
    const [yearStr, monthStr] = reportMonthInput.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    if (isNaN(year) || isNaN(month)) {
        alert('Vui lòng chọn tháng hợp lệ.');
        return;
    }

    const hkd = window.hkdData[window.currentCompany];
    
    // Lọc hóa đơn theo tháng
    const monthlyInvoices = (hkd.invoices || []).filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceInfo.date);
        return invoiceDate.getFullYear() === year && invoiceDate.getMonth() + 1 === month;
    });

    // Lọc xuất hàng theo tháng
    const monthlyExports = (hkd.exports || []).filter(exportRecord => {
        const exportDate = new Date(exportRecord.date);
        return exportDate.getFullYear() === year && exportDate.getMonth() + 1 === month;
    });

    // Tính toán thống kê
    let totalInvoiceValue = 0;
    let totalExportValue = 0;

    monthlyInvoices.forEach(invoice => {
        totalInvoiceValue += invoice.summary?.calculatedTotal || 0;
    });

    monthlyExports.forEach(exportRecord => {
        totalExportValue += exportRecord.totalValue || 0;
    });

    const grossProfit = totalInvoiceValue - totalExportValue;

    // Tạo báo cáo
    const report = {
        'Tổng số hóa đơn nhập': monthlyInvoices.length,
        'Tổng giá trị nhập kho': totalInvoiceValue,
        'Tổng số phiếu xuất': monthlyExports.length,
        'Tổng giá trị xuất kho': totalExportValue,
        'Lợi nhuận gộp (tham khảo)': grossProfit
    };
    
    // Hiển thị báo cáo
    reportDataEl.innerHTML = '';
    
    document.getElementById('report-month-display').textContent = `${month}/${year}`;
    
    // Sử dụng window.formatCurrency để định dạng tiền tệ
    const fc = window.formatCurrency || ((v) => v.toLocaleString('en-US'));

    for (const [key, value] of Object.entries(report)) {
        const row = document.createElement('tr');
        const isCalculation = key.includes('Lợi nhuận');
        
        if (isCalculation) {
            row.style.fontWeight = 'bold';
            row.style.borderTop = '2px solid var(--primary, #007bff)';
        }
        
        const displayValue = typeof value === 'number' && value >= 1000 ? 
            fc(value) : value.toLocaleString('vi-VN');

        row.innerHTML = `
            <td>${key}</td>
            <td style="text-align: right;">${displayValue}</td>
        `;
        reportDataEl.appendChild(row);
    }
    
    // Giả định reportContainer tồn tại và có thể ẩn/hiện
    if (reportContainer) {
        reportContainer.classList.remove('hidden');
    }
}

// =======================
// KHỞI TẠO MODULE
// =======================

function initAccountingModule() {
    // Sửa lỗi: Khởi tạo window.accountingSystems trước khi gọi initAccountingFromSavedData
    if (!window.accountingSystems) {
        window.accountingSystems = {};
    }
    
    // 1. Khởi tạo dữ liệu kế toán từ localStorage
    initAccountingFromSavedData();
    
    // 2. Tạo báo cáo theo tháng
    const generateReportButton = document.getElementById('generate-report');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', function() {
            generateMonthlyReport();
        });
    }

    // 3. Thiết lập tháng mặc định
    const reportMonthInput = document.getElementById('report-month');
    if (reportMonthInput) {
        const now = new Date();
        const year = now.getFullYear();
        // Lấy tháng trước
        const month = String(now.getMonth()).padStart(2, '0');
        // Nếu là tháng 1, chuyển về tháng 12 năm trước
        const defaultYear = now.getMonth() === 0 ? year - 1 : year;
        const defaultMonth = now.getMonth() === 0 ? '12' : month;
        reportMonthInput.value = `${defaultYear}-${defaultMonth}`;
    }

    // 4. Khởi tạo giao diện kế toán
    setupAccountingUI();
    
    // 5. Cập nhật thống kê
    updateAccountingStats();
    
    // 6. Cập nhật UI chuẩn kế toán hiện tại
    const currentSystem = getCurrentAccountingSystem();
    if (currentSystem) {
        updateStandardUI(currentSystem.standard);
    }
}

// =======================
// Exports toàn cục
// =======================
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
window.showStandardsComparison = showStandardsComparison;
window.saveAccountingData = saveAccountingData;
// Thêm export cho getCurrentAccountingSystem để fix lỗi ReferenceError
window.getCurrentAccountingSystem = getCurrentAccountingSystem; 
window.getAccountingSystem = getAccountingSystem;
window.changeAccountingStandard = changeAccountingStandard;
window.generateMonthlyReport = generateMonthlyReport;
window.initAccountingFromSavedData = initAccountingFromSavedData;