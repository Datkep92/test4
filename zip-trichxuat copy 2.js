// =======================
// Xử lý nhiều ZIP (ĐƯA LÊN ĐẦU FILE)
// =======================
async function handleZipFiles(files){
    let processedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    const fileResults = [];
    
    for(const file of files){
        if(!file.name.toLowerCase().endsWith('.zip') && !file.name.toLowerCase().endsWith('.xml')) {
            fileResults.push({ file: file.name, status: 'error', message: 'File không phải ZIP/XML' });
            errorCount++;
            continue;
        }
        
        let invoice = null;
        try {
            // extractInvoiceFromZip (mới) trả về Promise
            invoice = await extractInvoiceFromZip(file);
        } catch (error) {
            fileResults.push({ file: file.name, status: 'error', message: error.message });
            errorCount++;
            continue;
        }

        if(!invoice||!invoice.products||invoice.products.length===0){
            fileResults.push({ file: file.name, status: 'error', message: 'Không có sản phẩm' });
            // Do lỗi được log trong extractInvoiceFromZip nên chỉ cần đếm lỗi ở đây
            if (!fileResults.find(r => r.file === file.name && r.message.includes('Lỗi đọc file'))) {
                 errorCount++;
            }
            continue;
        }
        
        try {
            const taxCode = invoice.buyerInfo.taxCode||'UNKNOWN';
            const companyName = invoice.buyerInfo.name || taxCode;
            
            ensureHkdData(taxCode, companyName);
            // Ký hiệu + Số HĐ, không có MCCQT, trùng với logic isDuplicate
            const uniqueKey = `${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`; 
            
            if(isDuplicate(invoice,taxCode)){
                fileResults.push({ file: file.name, status: 'duplicate', message: 'Hóa đơn trùng' });
                duplicateCount++;
                continue;
            }
            
            // CẬP NHẬT LOGIC KIỂM TRA TỔNG TIỀN: Dùng trường totalDifference mới
            const totalDiff = Math.abs(invoice.summary.totalDifference); 
            const totalValidationOK = totalDiff <= 1; // Cho phép sai lệch 1 đơn vị
            
            invoice.status = {
                validation: totalValidationOK ? 'ok' : 'error', 
                stockPosted: totalValidationOK
            };
            // Lưu uniqueKey theo format cũ, nhưng logic isDuplicate mới kiểm tra theo MCCQT
            invoice.uniqueKey = `${invoice.invoiceInfo.mccqt}_${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`; 
            invoice.extractedAt = new Date().toISOString();
            invoice.sourceFile = file.name;
            
            hkdData[taxCode].invoices.push(invoice);
            
            if(invoice.status.stockPosted) {
                updateStock(taxCode, invoice);
            }
            
            fileResults.push({ file: file.name, status: 'success', message: 'Thành công' });
            processedCount++;
            
            console.log(`[NHẬP HĐ] MST=${taxCode}, HĐ=${uniqueKey}, trạng thái=${invoice.status.validation}`);
            
        } catch (error) {
            fileResults.push({ file: file.name, status: 'error', message: error.message });
            errorCount++;
            console.error('Lỗi xử lý file (sau trích xuất):', file.name, error);
        }
    }
    
    // Cập nhật thống kê
    if (typeof updateFileStats === 'function') {
        updateFileStats(files.length, processedCount, errorCount, duplicateCount);
    }
    
    // Hiển thị kết quả chi tiết
    if (typeof showFileResults === 'function') {
        showFileResults(fileResults);
    }
    
    console.log(`Kết quả xử lý: ${processedCount} thành công, ${duplicateCount} trùng, ${errorCount} lỗi`);
    return { processedCount, duplicateCount, errorCount };
}
async function extractInvoiceFromZip(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const fileContent = e.target.result;
                let xmlText = '';
                const isXML = file.name.toLowerCase().endsWith('.xml');
                let invoice = null;
                
                if (isXML) {
                    xmlText = fileContent;
                    invoice = parseXmlInvoice(xmlText);
                } else {
                    // Xử lý file ZIP
                    if (typeof JSZip === 'undefined') {
                        reject(new Error('Vui lòng thêm thư viện JSZip để xử lý file ZIP. Thêm: <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>'));
                        return;
                    }
                    
                    const zip = await JSZip.loadAsync(fileContent);
                    const xmlFiles = Object.keys(zip.files).filter(name => name.toLowerCase().endsWith('.xml'));
                    
                    if (xmlFiles.length === 0) {
                        if (typeof window.showToast === 'function') {
                            window.showToast(`Không tìm thấy file XML trong: ${file.name}`, 3000, 'error');
                        }
                        resolve(null);
                        return;
                    }

                    // Lấy file XML đầu tiên
                    const xmlFile = xmlFiles[0];
                    xmlText = await zip.file(xmlFile).async('text');
                    
                    // Parse XML
                    invoice = parseXmlInvoice(xmlText);
                    
                    // Kiểm tra HTML preview
                    const htmlFiles = Object.keys(zip.files).filter(name => name.toLowerCase().endsWith('.html'));
                    if (htmlFiles.length > 0) {
                        const htmlFile = htmlFiles[0];
                        const htmlContent = await zip.file(htmlFile).async('text');
                        const blob = new Blob([htmlContent], { type: 'text/html' });
                        invoice.htmlUrl = URL.createObjectURL(blob);
                    }
                }
                
                // Thêm thông tin file
                invoice.originalFileId = 'local-file-' + Date.now() + '-' + (invoice.buyerInfo.taxCode || 'UNKNOWN');
                invoice.fileName = file.name;
                
                console.log('✅ Đã trích xuất hóa đơn:', {
                    number: invoice.invoiceInfo.number,
                    products: invoice.products.length,
                    total: invoice.summary.calculatedTotal
                });

                resolve(invoice);

            } catch (error) {
                console.error('❌ Lỗi đọc file:', file.name, error);
                if (typeof window.showToast === 'function') {
                    window.showToast(`Lỗi đọc file: ${file.name}`, 3000, 'error');
                }
                // Dù có lỗi, vẫn resolve null để vòng lặp handleZipFiles không bị dừng
                reject(new Error('Lỗi đọc file: ' + error.message));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Không thể đọc file'));
        };
        
        // Đọc file theo loại
        if (file.name.toLowerCase().endsWith('.xml')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}
function ensureHkdData(taxCode, companyName = '') {
  if (!hkdData[taxCode]) {
    hkdData[taxCode] = {
      name: companyName || taxCode,
      invoices: [],
      tonkhoMain: [],
      tonkhoMainDefault: null,
      exports: []
    };
  }
}
// =======================
// Tạo MSP chuẩn (DÙNG TÊN + ĐƠN VỊ làm key chính)
// =======================
function generateMSP(code, name, unit, idx, category) {
  // Ưu tiên dùng code nếu có và không trống, nếu không dùng tên + đơn vị
  let baseCode = code && code.trim() !== '' ? code : `${name}_${unit}`.replace(/\s+/g, '_').toUpperCase();
  let msp = baseCode;
  
  // Thêm hậu tố nếu là chiết khấu hoặc khuyến mãi
  if (category === 'chiet_khau') msp += '_CK';
  if (category === 'khuyen_mai') msp += '_KM';
  
  return msp;
}

// =======================
// Parse XML (PHIÊN BẢN HOÀN CHỈNH - ĐÃ SỬA MSP)
// =======================
function parseXmlInvoice(xmlContent) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('XML không hợp lệ');
    }

    const getText = (path, parent = xmlDoc) => {
      const node = parent.querySelector(path);
      return node ? node.textContent.trim() : '';
    };

    const getNumber = (path, parent = xmlDoc) => {
      const text = getText(path, parent);
      return text ? parseFloat(text.replace(/,/g, '')) : 0;
    };

    // =========================================================================
    // 1. THÔNG TIN HÓA ĐƠN
    // =========================================================================
    const invoiceInfo = {
      title: getText('HDon > DLHDon > TTChung > THDon'),
      template: getText('HDon > DLHDon > TTChung > KHHDon'),
      symbol: getText('HDon > DLHDon > TTChung > KHMSHDon'),
      number: getText('HDon > DLHDon > TTChung > SHDon'),
      date: getText('HDon > DLHDon > TTChung > NLap'),
      paymentMethod: getText('HDon > DLHDon > TTChung > HTTToan') || 'CK',
      paymentStatus: getText('HDon > DLHDon > NDHDon > TToan > HTTToan') || '',
      amountInWords: getText('HDon > DLHDon > NDHDon > TToan > TienBangChu') || '',
      mccqt: getText('HDon > MCCQT')?.toUpperCase() || '',
      pattern: getText('HDon > DLHDon > TTChung > MSo') || '01GTKT0/001'
    };

    // Xác định loại hóa đơn từ sản phẩm đầu tiên
    const firstProductNode = xmlDoc.querySelector('HHDVu');
    let invoiceType = 'Hàng hóa';
    if (firstProductNode) {
      const tchat = parseInt(getText('TChat', firstProductNode) || '1');
      const name = getText('THHDVu', firstProductNode) || '';
      const lowerName = name.toLowerCase();
      
      if (tchat === 3 || lowerName.includes('chiết khấu') || lowerName.includes('chiet khau')) {
        invoiceType = 'Chiết khấu';
      } else if (lowerName.includes('khuyến mãi') || lowerName.includes('khuyen mai')) {
        invoiceType = 'Khuyến mãi';
      } else if (lowerName.includes('dịch vụ') || lowerName.includes('dich vu')) {
        invoiceType = 'Dịch vụ';
      }
    }
    invoiceInfo.type = invoiceType;

    // =========================================================================
    // 2. THÔNG TIN BÊN BÁN & BÊN MUA
    // =========================================================================
    const sellerInfo = {
      name: getText('HDon > DLHDon > NDHDon > NBan > Ten'),
      taxCode: getText('HDon > DLHDon > NDHDon > NBan > MST'),
      address: getText('HDon > DLHDon > NDHDon > NBan > DChi'),
      phone: getText('HDon > DLHDon > NDHDon > NBan > SDThoai'),
      email: getText('HDon > DLHDon > NDHDon > NBan > DCTDTu')
    };

    const buyerInfo = {
      name: getText('HDon > DLHDon > NDHDon > NMua > Ten'),
      taxCode: getText('HDon > DLHDon > NDHDon > NMua > MST'),
      address: getText('HDon > DLHDon > NDHDon > NMua > DChi'),
      customerCode: getText('HDon > DLHDon > NDHDon > NMua > MKHang')
    };

    // =========================================================================
    // 3. TRÍCH XUẤT DANH SÁCH SẢN PHẨM
    // =========================================================================
    const products = [];
    const productNodes = xmlDoc.querySelectorAll('HHDVu');
    
    let totalAmountWithoutTax = 0;      // Tổng tiền trước thuế (SL * Đơn giá)
    let totalDiscount = 0;              // Tổng chiết khấu
    let totalAmountAfterDiscount = 0;   // Tổng tiền sau chiết khấu
    let totalTax = 0;                   // Tổng thuế

    productNodes.forEach((node, index) => {
      const stt = index + 1;

      // Thông tin cơ bản
      const tchat = parseInt(getText('TChat', node) || '1');
      const name = getText('THHDVu', node) || '';
      const code = getText('MaSP', node) || '';
      const unit = getText('DVTinh', node) || 'Cái';
      const quantity = getNumber('SLuong', node);
      const price = getNumber('DGia', node);
      const discount = getNumber('CKhau', node); // Chiết khấu
      const xmlThTien = getNumber('ThTien', node); // Thành tiền từ XML

      // Xử lý thuế suất
      const taxRateText = getText('TSuat', node).trim();
      const rawTax = taxRateText.toLowerCase().replace('%', '').replace(' ', '');
      let taxRate = 0;
      
      if (rawTax === 'kct' || rawTax === 'không chịu thuế' || rawTax === '0' || rawTax === '') {
        taxRate = 0;
      } else if (!isNaN(parseFloat(rawTax))) {
        taxRate = parseFloat(rawTax);
      }

      // TÍNH TOÁN THEO LOGIC: TỔNG TIỀN HÀNG - CHIẾT KHẤU
      const amountWithoutTax = quantity * price;                    // Thành tiền trước chiết khấu
      const amountAfterDiscount = amountWithoutTax - discount;      // Thành tiền sau chiết khấu (TIỀN HÀNG - CK)
      const taxAmount = amountAfterDiscount * taxRate / 100;        // Tiền thuế (tính trên tiền sau CK)
      const totalAmount = amountAfterDiscount + taxAmount;          // Tổng tiền sau thuế

      // Phân loại sản phẩm
      let category = 'hang_hoa';
      const lowerName = name.toLowerCase();
      
      const isCKText = lowerName.includes('chiết khấu') || lowerName.includes('chiet khau') || 
                      lowerName.includes('ck') || lowerName.includes('giảm giá');
      const isCKTMByAmount = (quantity === 0 && tchat === 3 && amountWithoutTax !== 0);
      const isChietKhau = isCKTMByAmount || isCKText;

      const isKMText = lowerName.includes('khuyến mãi') || lowerName.includes('khuyen mai') || 
                      lowerName.includes('km') || lowerName.includes('quà tặng');

      if (isChietKhau) {
        category = 'chiet_khau';
      } else if (isKMText || price === 0) {
        category = 'khuyen_mai';
      } else if (lowerName.includes('dịch vụ') || lowerName.includes('dich vu')) {
        category = 'dich_vu';
      }

      // SỬA: Tạo MSP dựa trên TÊN + ĐƠN VỊ để đảm bảo nhất quán
      const msp = generateMSP(code, name, unit, index, category);

      // Chuẩn hóa số âm cho chiết khấu
      let finalAmount = amountAfterDiscount;
      let finalTaxAmount = taxAmount;
      if (category === 'chiet_khau') {
        finalAmount = -Math.abs(amountAfterDiscount);
        finalTaxAmount = -Math.abs(taxAmount);
        // Đối với chiết khấu, discount chính là số tiền chiết khấu
        totalDiscount += Math.abs(amountAfterDiscount);
      } else {
        // Đối với hàng hóa thường, cộng chiết khấu vào tổng chiết khấu
        totalDiscount += discount;
      }

      // Cộng dồn tổng (chỉ cộng hàng hóa thường, không cộng chiết khấu)
      if (category !== 'chiet_khau') {
        totalAmountWithoutTax += amountWithoutTax;
        totalTax += finalTaxAmount;
      }
      // Luôn cộng dồn finalAmount cho mục đích tổng tiền sau chiết khấu (dù là số âm)
      totalAmountAfterDiscount += finalAmount;

      products.push({
        stt,
        msp, // DÙNG MSP MỚI (TÊN + ĐƠN VỊ)
        productCode: code,
        name,
        unit,
        quantity: quantity.toString(),
        price: price.toString(),
        discount: discount.toString(),
        discountRate: discount > 0 && amountWithoutTax > 0 ? 
                     ((discount / amountWithoutTax) * 100).toFixed(2) : '0',
        amount: finalAmount, // Thành tiền sau chiết khấu
        amountWithoutTax: amountWithoutTax,
        taxRate,
        taxRateText: taxRate + '%',
        taxAmount: finalTaxAmount,
        totalAmount: totalAmount, // Thành tiền sau thuế (tính trên từng dòng)
        category,
        tchat,
        hasDifference: Math.abs(amountAfterDiscount - xmlThTien) >= 1,
        xmlAmount: xmlThTien,
        isFree: price === 0
      });
    });

    // =========================================================================
    // 4. TỔNG HỢP THANH TOÁN
    // =========================================================================
    const ttCKTMai = getNumber('HDon > DLHDon > NDHDon > TToan > TTCKTMai');
    const tgTThue = getNumber('HDon > DLHDon > NDHDon > TToan > TgTThue');
    const tgTTTBSo = getNumber('HDon > DLHDon > NDHDon > TToan > TgTTTBSo');
    const tgTCThue = getNumber('HDon > DLHDon > NDHDon > TToan > TgTCThue');

    // TÍNH TOÁN CUỐI CÙNG: Dùng tổng đã cộng dồn từ sản phẩm
    const calculatedTotalTax = Math.round(totalTax); 
    const calculatedTotal = Math.round(totalAmountAfterDiscount + calculatedTotalTax); 

    const summary = {
      // Từ XML
      totalAmount: tgTCThue,                    // Tổng tiền trước thuế từ XML
      totalTax: tgTThue,                        // Tổng thuế từ XML
      totalAfterTax: tgTTTBSo,                  // Tổng tiền sau thuế từ XML
      totalDiscount: ttCKTMai,                  // Tổng chiết khấu từ XML
      
      // Tính toán thủ công
      calculatedAmountWithoutTax: totalAmountWithoutTax,
      calculatedDiscount: totalDiscount,
      calculatedAmountAfterDiscount: totalAmountAfterDiscount,
      calculatedTax: calculatedTotalTax,
      calculatedTotal: calculatedTotal,
      
      // Chênh lệch (Tổng tiền sau thuế)
      amountDifference: totalAmountAfterDiscount - tgTCThue,
      taxDifference: calculatedTotalTax - tgTThue,
      totalDifference: calculatedTotal - tgTTTBSo,
      discountDifference: totalDiscount - ttCKTMai,
      
      hasData: tgTTTBSo > 0 || tgTCThue > 0
    };

    return {
      invoiceInfo,
      sellerInfo,
      buyerInfo,
      products,
      summary,
      rawXml: xmlContent
    };

  } catch (error) {
    console.error('❌ Lỗi parse XML:', error);
    throw new Error('Không thể đọc file XML: ' + error.message);
  }
}

// =======================
// Cập nhật tồn kho delta (SỬA LẠI để tổng hợp theo MSP nhất quán)
// =======================
function updateStock(taxCode, invoice) {
  ensureHkdData(taxCode);
  const hkd = hkdData[taxCode];
  
  invoice.products.forEach(item => {
    if (item.category !== 'hang_hoa') return;
    
    // MSP đã được tạo nhất quán từ tên + đơn vị trong parseXmlInvoice
    const consistentMSP = item.msp;
    
    // Tìm sản phẩm trong tồn kho theo MSP nhất quán
    let stockItem = hkd.tonkhoMain.find(p => p.msp === consistentMSP);
    
    if (stockItem) {
      // Cộng dồn nếu trùng MSP (đã đảm bảo cùng tên + đơn vị)
      stockItem.quantity += parseFloat(item.quantity);
      stockItem.amount += item.amount;
      console.log(`✅ Cộng dồn tồn kho: ${item.name} (${consistentMSP}) - SL: +${item.quantity}`);
    } else {
      // Thêm mới với MSP nhất quán
      hkd.tonkhoMain.push({
        msp: consistentMSP,
        code: item.productCode,
        name: item.name,
        unit: item.unit,
        quantity: parseFloat(item.quantity),
        amount: item.amount
      });
      console.log(`✅ Thêm mới tồn kho: ${item.name} (${consistentMSP}) - SL: ${item.quantity}`);
    }
  });
  
  // Log để debug
  console.log(`📊 Tồn kho sau cập nhật:`, hkd.tonkhoMain);
}

// =======================
// Kiểm tra trùng HĐ
// =======================
function isDuplicate(invoice, taxCode) {
    ensureHkdData(taxCode);
    const key = `${invoice.invoiceInfo.mccqt}_${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
    return hkdData[taxCode].invoices.some(inv => 
        inv.uniqueKey === key ||
        (inv.invoiceInfo.mccqt === invoice.invoiceInfo.mccqt &&
         inv.invoiceInfo.symbol === invoice.invoiceInfo.symbol &&
         inv.invoiceInfo.number === invoice.invoiceInfo.number)
    );
}

// =======================
// Exports toàn cục
// =======================
window.handleZipFiles = handleZipFiles;
window.extractInvoiceFromZip = extractInvoiceFromZip;
window.parseXmlInvoice = parseXmlInvoice;
window.ensureHkdData = ensureHkdData;
window.isDuplicate = isDuplicate;
window.updateStock = updateStock;
window.generateMSP = generateMSP;