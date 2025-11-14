// =======================
// Hàm làm tròn kế toán (theo chuẩn VND)
// =======================
function accountingRound(amount) {
    return Math.round(amount);
}



// =======================
// Hàm phân loại sản phẩm
// =======================
function getProductClassification(category) {
  const classifications = {
    'hang_hoa': 'Hàng hóa',
    'chiet_khau': 'Chiết khấu',
    'khuyen_mai': 'Khuyến mãi',
    'dich_vu': 'Dịch vụ'
  };
  return classifications[category] || 'Hàng hóa';
}

// =======================
// Hàm kiểm tra chênh lệch hóa đơn (CHUẨN KẾ TOÁN)
// =======================
function checkInvoiceDifference(invoice) {
    const summary = invoice.summary;
    
    // Tất cả giá trị đã được làm tròn trước đó, chỉ cần so sánh
    const isExactMatch = summary.totalDifference === 0;
    
    return {
        isValid: isExactMatch,
        totalDifference: summary.totalDifference,
        calculatedTotal: summary.calculatedTotal,
        xmlTotal: summary.totalAfterTax,
        amountDifference: summary.amountDifference,
        taxDifference: summary.taxDifference,
        discountDifference: summary.discountDifference
    };
}

// =======================
// Xử lý nhiều ZIP (SỬA LOGIC KIỂM TRA CHÊNH LỆCH)
// =======================
async function handleZipFiles(files){
    let processedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    let stockPostedCount = 0;
    
    const fileResults = [];
    
    for(const file of files){
        if(!file.name.toLowerCase().endsWith('.zip') && !file.name.toLowerCase().endsWith('.xml')) {
            fileResults.push({ file: file.name, status: 'error', message: 'File không phải ZIP/XML' });
            errorCount++;
            continue;
        }
        
        let invoice = null;
        try {
            invoice = await extractInvoiceFromZip(file);
        } catch (error) {
            fileResults.push({ file: file.name, status: 'error', message: error.message });
            errorCount++;
            continue;
        }

        if(!invoice||!invoice.products||invoice.products.length===0){
            fileResults.push({ file: file.name, status: 'error', message: 'Không có sản phẩm' });
            errorCount++;
            continue;
        }
        
        try {
            const taxCode = invoice.buyerInfo.taxCode||'UNKNOWN';
            const companyName = invoice.buyerInfo.name || taxCode;
            
            ensureHkdData(taxCode, companyName);
            
            // Kiểm tra trùng HĐ
            if(isDuplicate(invoice,taxCode)){
                fileResults.push({ file: file.name, status: 'duplicate', message: 'Hóa đơn trùng' });
                duplicateCount++;
                continue;
            }
            
            // KIỂM TRA CHÊNH LỆCH TRƯỚC KHI XỬ LÝ
            const differenceCheck = checkInvoiceDifference(invoice);
            
            // Thiết lập trạng thái hóa đơn
            invoice.status = {
                validation: differenceCheck.isValid ? 'ok' : 'error',
                stockPosted: false, // Mặc định chưa chuyển kho
                difference: differenceCheck.totalDifference,
                calculatedTotal: differenceCheck.calculatedTotal,
                xmlTotal: differenceCheck.xmlTotal
            };
            
            // Thêm thông tin metadata
            invoice.uniqueKey = `${invoice.invoiceInfo.mccqt}_${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
            invoice.extractedAt = new Date().toISOString();
            invoice.sourceFile = file.name;
            
            // CHỈ CHUYỂN TỒN KHO NẾU KHÔNG CÓ CHÊNH LỆCH
            if(invoice.status.validation === 'ok') {
                updateStock(taxCode, invoice);
                invoice.status.stockPosted = true;
                stockPostedCount++;
            }
            
            // LUÔN LƯU HÓA ĐƠN DÙ CÓ LỖI HAY KHÔNG
            hkdData[taxCode].invoices.push(invoice);
            
            // Thông báo kết quả
            if(invoice.status.validation === 'ok') {
                fileResults.push({ 
                    file: file.name, 
                    status: 'success', 
                    message: `Thành công - Đã chuyển tồn kho` 
                });
                processedCount++;
            } else {
                fileResults.push({ 
                    file: file.name, 
                    status: 'warning', 
                    message: `Chênh lệch ${formatCurrency(differenceCheck.totalDifference)} - Chưa chuyển tồn kho` 
                });
                processedCount++;
            }
            
            console.log(`[NHẬP HĐ] MST=${taxCode}, HĐ=${invoice.uniqueKey}, trạng thái=${invoice.status.validation}, tồn kho=${invoice.status.stockPosted}`);
            
        } catch (error) {
            fileResults.push({ file: file.name, status: 'error', message: error.message });
            errorCount++;
            console.error('Lỗi xử lý file (sau trích xuất):', file.name, error);
        }
    }
    
    // Cập nhật thống kê
    if (typeof updateFileStats === 'function') {
        updateFileStats(files.length, processedCount, errorCount, duplicateCount, stockPostedCount);
    }
    
    // Hiển thị kết quả chi tiết
    if (typeof showFileResults === 'function') {
        showFileResults(fileResults);
    }
    
    console.log(`Kết quả xử lý: ${processedCount} thành công (${stockPostedCount} đã chuyển kho), ${duplicateCount} trùng, ${errorCount} lỗi`);
    return { processedCount, duplicateCount, errorCount, stockPostedCount };
}

// =======================
// Tạo / kiểm tra HKD
// =======================
function ensureHkdData(taxCode, companyName = '') {
    if (!hkdData[taxCode]) {
        hkdData[taxCode] = {
            name: companyName || taxCode,
            invoices: [],
            tonkhoMain: [],
            tonkhoMainDefault: null,
            exports: []
        };
    } else if (companyName && hkdData[taxCode].name === taxCode) {
        // Cập nhật tên công ty nếu chưa có
        hkdData[taxCode].name = companyName;
    }
}

// =======================
// Hàm loại bỏ dấu tiếng Việt
// ============================
function removeVietnameseAccents(str) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

// ============================
// Hàm tạo mã sản phẩm theo tên (LOGIC MỚI)
// ============================
function generateProductCodeByName(taxCode, type, productName) {
  // 1. Chuẩn hóa tên sản phẩm
  const cleanName = removeVietnameseAccents(productName.toUpperCase())
    .replace(/[^A-Z0-9\s]/g, '');

  // 2. Tạo phần chữ: 2 ký tự đầu của 2 cụm từ đầu tiên
  const words = cleanName.split(/\s+/).filter(Boolean);
  let lettersPart = '';
  if (words.length >= 2) {
    lettersPart = words[0].substring(0, 1) + words[1].substring(0, 1);
  } else if (words.length === 1) {
    lettersPart = words[0].substring(0, 2);
  } else {
    lettersPart = 'SP';
  }

  // 3. Tạo phần số: theo logic mới
  const compactName = cleanName.replace(/\s/g, '');
  let numbersPart = '';

  const numberMatches = [...compactName.matchAll(/\d+/g)];
  if (numberMatches.length >= 1) {
    const firstMatch = numberMatches[0];
    const startIdx = firstMatch.index;
    const numStr = firstMatch[0];

    if (numberMatches.length >= 3 || numStr.length >= 3) {
      numbersPart = numStr.substring(0, 3);
    } else if (numberMatches.length === 2 || numStr.length === 2) {
      // lấy 1 ký tự trước số đầu tiên (nếu có)
      const beforeChar = startIdx > 0 ? compactName[startIdx - 1] : 'X';
      numbersPart = beforeChar + numStr;
      numbersPart = numbersPart.substring(0, 3).padEnd(3, 'X');
    } else if (numStr.length === 1) {
      // lấy ký tự trước và sau (nếu có)
      const beforeChar = startIdx > 0 ? compactName[startIdx - 1] : 'X';
      const afterChar = (startIdx + 1 < compactName.length) ? compactName[startIdx + 1] : 'X';
      numbersPart = beforeChar + numStr + afterChar;
    }
  } else {
    // Không có số → lấy 3 ký tự cuối
    numbersPart = compactName.slice(-3).padEnd(3, 'X').substring(0, 3);
  }

  // 4. Ghép thành mã cơ sở
  let baseCode = lettersPart + numbersPart;

  // 5. Kiểm tra trùng và xử lý
  let finalCode = baseCode;
  let suffixChar = 'A';

  while (isProductCodeExist(taxCode, finalCode) && suffixChar <= 'Z') {
    if (numbersPart.match(/^\d+$/)) {
      finalCode = lettersPart + numbersPart.slice(0, -1) + suffixChar;
    } else {
      finalCode = baseCode.slice(0, -1) + suffixChar;
    }
    suffixChar = String.fromCharCode(suffixChar.charCodeAt(0) + 1);
  }

  if (isProductCodeExist(taxCode, finalCode)) {
    let randomSuffix = '';
    do {
      randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      finalCode = baseCode.slice(0, 3) + randomSuffix;
    } while (isProductCodeExist(taxCode, finalCode) && randomSuffix.length === 3);
  }

  return finalCode.substring(0, 6);
}

// Hàm kiểm tra mã tồn tại
function isProductCodeExist(taxCode, code) {
  if (!hkdData[taxCode]) return false;
  
  const stocks = ['tonkhoMain', 'tonkhoKM', 'tonkhoCK'];
  return stocks.some(stock =>
    hkdData[taxCode][stock]?.some(item => item.productCode === code)
  );
}


// =======================
// Tạo MSP với hậu tố phân loại
// =======================
function generateMSP(code, name, unit, idx, category, taxCode = '') {
  let baseCode = '';
  
  // Nếu có code từ XML và không trống
  if (code && code.trim() !== '') {
    baseCode = code;
  } else if (taxCode && taxCode !== 'UNKNOWN') {
    // Tạo mã theo tên sản phẩm
    baseCode = generateProductCodeByName(taxCode, category, name);
  } else {
    // Fallback: dùng tên + đơn vị
    baseCode = `${removeVietnameseAccents(name)}_${unit}`.replace(/\s+/g, '_').toUpperCase().substring(0, 20);
  }
  
  // THÊM HẬU TỐ PHÂN LOẠI
  if (category === 'chiet_khau') {
    baseCode += '_CK';
  } else if (category === 'khuyen_mai') {
    baseCode += '_KM';
  }
  
  return baseCode;
}

function parseXmlInvoice(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const getText = (path, parent = xmlDoc) => {
    const node = parent.querySelector(path);
    return node ? node.textContent.trim() : '';
  };

  const getNumber = (path, parent = xmlDoc) => {
    const text = getText(path, parent);
    return text ? parseFloat(text.replace(/,/g, '')) : 0;
  };

  const getAdditionalInfo = (fieldName) => {
    const ttKhacNode = xmlDoc.querySelector('HDon > DLHDon > NDHDon > TToan > TTKhac');
    if (ttKhacNode) {
      const nodes = ttKhacNode.querySelectorAll('TTin');
      for (const node of nodes) {
        const field = node.querySelector('TTruong');
        if (field && field.textContent.trim() === fieldName) {
          return node.querySelector('DLieu')?.textContent.trim() || '';
        }
      }
    }
    return '';
  };

  const invoiceInfo = {
    title: getText('HDon > DLHDon > TTChung > THDon'),
    template: getText('HDon > DLHDon > TTChung > KHHDon'),
    symbol: getText('HDon > DLHDon > TTChung > KHMSHDon'),
    number: getText('HDon > DLHDon > TTChung > SHDon'),
    date: getText('HDon > DLHDon > TTChung > NLap'),
    paymentMethod: getText('HDon > DLHDon > TTChung > HTTToan'),
    paymentStatus: getAdditionalInfo('Trạng thái thanh toán'),
    amountInWords: getAdditionalInfo('TotalAmountInWordsByENG') || '',
    mccqt: getText('HDon > MCCQT')?.toUpperCase() || ''
  };

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
    customerCode: getText('HDon > DLHDon > NDHDon > NMua > MKHang'),
    idNumber: getText('HDon > DLHDon > NDHDon > NMua > CCCDan')
  };

  const products = [];
  const productNodes = xmlDoc.querySelectorAll('HHDVu');
  let totalManual = 0;
  let totalTaxManual = 0;

  productNodes.forEach((node, index) => {
    const stt = index + 1;

    // Thông tin cơ bản
    const tchat = parseInt(getText('TChat', node) || '1');
    const name = getText('THHDVu', node) || '';
    const code = getText('MHHDVu', node) || '';
    const unit = getText('DVTinh', node) || 'Cái';
    const quantity = getNumber('SLuong', node);
    const price = getNumber('DGia', node);
    
    // Thông tin chiết khấu
    const discountRate = getNumber('TLCKhau', node);
    const discountAmount = getNumber('STCKhau', node);
    const xmlThTien = getNumber('ThTien', node);

    // ✅ Chuẩn hóa thuế suất
    const taxRateText = getText('TSuat', node).trim();
    const rawTax = taxRateText.toLowerCase().replace('%', '').replace(' ', '');
    let taxRate = 0;
    if (rawTax === 'kct' || rawTax === 'không chịu thuế' || rawTax === '0' || rawTax === '') {
      taxRate = 0;
    } else if (!isNaN(parseFloat(rawTax))) {
      taxRate = parseFloat(rawTax);
    }

    // ✅ Tính toán amount
    let amount = quantity * price;
    if (amount === 0 && xmlThTien !== 0) {
      amount = xmlThTien;
    }

    // ✅ PHÂN LOẠI SẢN PHẨM - NHẬN DIỆN THEO CỤM TỪ
    let category = 'hang_hoa';
    let classification = 'Hàng hóa, dịch vụ';
    let productType = 'normal'; // normal, ck, km
    const lowerName = name.toLowerCase().trim();
    
    // 🔍 NHẬN DIỆN CỤM TỪ CK/KM TRONG TÊN SẢN PHẨM
    const ckPatterns = [
      'chiết khấu', 'chiet khau', 'cktm', 'ck', 'chiết_khấu', 'chiet_khau',
      'ck thương mại', 'ck tm', 'chiết khấu tm', 'chiet khau tm'
    ];
    
    const kmPatterns = [
      'khuyến mãi', 'khuyen mai', 'km', 'khuyến_mãi', 'khuyen_mai',
      'quà tặng', 'qua tang', 'tặng kèm', 'tang kem', 'free', 'miễn phí', 'mien phi'
    ];

    const isCK = ckPatterns.some(pattern => lowerName.includes(pattern));
    const isKM = kmPatterns.some(pattern => lowerName.includes(pattern));
    
    console.log(`🔍 Phân loại: "${name}" -> isCK: ${isCK}, isKM: ${isKM}, TChat: ${tchat}, Price: ${price}, Quantity: ${quantity}`);

    // LOGIC PHÂN LOẠI CHÍNH
    if (isCK || tchat === 3) {
      // ƯU TIÊN 1: Có cụm từ CK hoặc TChat = 3 -> Chiết khấu
      category = 'chiet_khau';
      classification = 'Chiết khấu thương mại';
      productType = 'ck';
      
      // Xử lý số âm cho chiết khấu
      if (amount > 0) {
        amount = -Math.abs(amount);
      }
      
    } else if (isKM || price === 0) {
      // ƯU TIÊN 2: Có cụm từ KM hoặc giá = 0 -> Khuyến mãi
      category = 'khuyen_mai';
      classification = 'Khuyến mãi';
      productType = 'km';
      
      // Khuyến mãi: không tính vào tổng
      amount = 0;
      
    } else if (quantity > 0 && amount > 0) {
      // Mặc định: Hàng hóa thường
      category = 'hang_hoa';
      classification = 'Hàng hóa, dịch vụ';
      productType = 'normal';
    }

    // Tính thuế
    const taxAmount = accountingRound(amount * taxRate / 100);

    // Cộng dồn tổng (chỉ cộng hàng hóa thường và chiết khấu)
    if (category === 'hang_hoa' || category === 'chiet_khau') {
      totalManual += amount;
      totalTaxManual += taxAmount;
    }

    // TẠO MSP VỚI HẬU TỐ PHÂN LOẠI VÀ ID ĐỂ LỌC
    const msp = generateMSP(code, name, unit, index, category, buyerInfo.taxCode);
    const productId = `${productType}_${msp}_${Date.now()}`;

    products.push({
      stt,
      msp,
      productId, // 🔥 THÊM ID ĐỂ LỌC RIÊNG
      code,
      name,
      unit,
      quantity: quantity.toString(),
      price: price.toString(),
      discount: discountAmount.toString(),
      discountRate: discountRate.toString(),
      amount,
      amountWithoutTax: Math.abs(amount),
      taxRate,
      taxRateText: taxRate + '%',
      taxAmount,
      totalAmount: amount + taxAmount,
      category,
      classification,
      productType, // 🔥 THÊM productType ĐỂ LỌC
      tchat,
      hasDifference: Math.abs(amount - xmlThTien) >= 1,
      xmlAmount: xmlThTien,
      isFree: price === 0,
      // 🔥 THÊM CÁC TRƯỜNG NHẬN DIỆN
      isCK: isCK,
      isKM: isKM,
      matchedPatterns: {
        ck: isCK ? ckPatterns.filter(p => lowerName.includes(p)) : [],
        km: isKM ? kmPatterns.filter(p => lowerName.includes(p)) : []
      }
    });

    console.log(`✅ Phân loại: "${name}" -> ${category} (${classification}) | Amount: ${amount}`);
  });

  // =========================================================================
  // TỔNG HỢP THANH TOÁN
  // =========================================================================
  const ttCKTMai = getNumber('HDon > DLHDon > NDHDon > TToan > TTCKTMai');
  const tgTThue = getNumber('HDon > DLHDon > NDHDon > TToan > TgTThue');
  const tgTTTBSo = getNumber('HDon > DLHDon > NDHDon > TToan > TgTTTBSo');
  const tgTCThue = getNumber('HDon > DLHDon > NDHDon > TToan > TgTCThue');

  const calculatedTotal = accountingRound(totalManual + totalTaxManual);

  const summary = {
    totalAmount: accountingRound(tgTCThue),
    totalTax: accountingRound(tgTThue),
    totalAfterTax: accountingRound(tgTTTBSo),
    totalDiscount: accountingRound(ttCKTMai),
    
    calculatedAmountAfterDiscount: accountingRound(totalManual),
    calculatedTax: accountingRound(totalTaxManual),
    calculatedTotal: calculatedTotal,
    
    amountDifference: accountingRound(totalManual - tgTCThue),
    taxDifference: accountingRound(totalTaxManual - tgTThue),
    totalDifference: accountingRound(calculatedTotal - tgTTTBSo),
    
    hasData: tgTTTBSo > 0 || tgTCThue > 0
  };

  // XÁC ĐỊNH LOẠI HÓA ĐƠN
  const hasCK = products.some(p => p.category === 'chiet_khau');
  const hasKM = products.some(p => p.category === 'khuyen_mai');
  
  if (hasCK) invoiceInfo.type = 'Chiết khấu';
  else if (hasKM) invoiceInfo.type = 'Khuyến mãi';
  else invoiceInfo.type = 'Hàng hóa';

  // DEBUG: Hiển thị kết quả phân loại chi tiết
  console.log('🎯 KẾT QUẢ PHÂN LOẠI SẢN PHẨM:');
  products.forEach((p, i) => {
    console.log(`${i + 1}. "${p.name}"`);
    console.log(`   → Category: ${p.category} | Type: ${p.productType} | Amount: ${p.amount}`);
    console.log(`   → isCK: ${p.isCK} | isKM: ${p.isKM} | TChat: ${p.tchat}`);
    if (p.matchedPatterns.ck.length > 0) {
      console.log(`   → CK Patterns: ${p.matchedPatterns.ck.join(', ')}`);
    }
    if (p.matchedPatterns.km.length > 0) {
      console.log(`   → KM Patterns: ${p.matchedPatterns.km.join(', ')}`);
    }
  });

  return { 
    invoiceInfo, 
    sellerInfo, 
    buyerInfo, 
    products, 
    totals: summary,
    summary
  };
}

// =======================
// Cập nhật tồn kho với phân loại CHÍNH XÁC
// (ĐÃ XÓA BỘ LỌC, LƯU TẤT CẢ SẢN PHẨM)
// =======================
function updateStock(taxCode, invoice) {
  ensureHkdData(taxCode);
  const hkd = hkdData[taxCode];
  
  console.log('🔄 Bắt đầu cập nhật tồn kho với phân loại:');
  
  invoice.products.forEach(item => {
    console.log(`📦 Xử lý: ${item.name} | Category: ${item.category} | Classification: ${item.classification}`);
    
    // 🔥 ĐÃ XÓA BỘ LỌC CHỈ LƯU 'hang_hoa'. LƯU TẤT CẢ SẢN PHẨM.
    // Logic hiển thị (quantity, amount) cho CK/KM sẽ được xử lý trong renderStock.
    
    const consistentMSP = item.msp;
    
    let stockItem = hkd.tonkhoMain.find(p => p.msp === consistentMSP);
    
    if (stockItem) {
      // Cộng dồn số lượng, giá trị và chiết khấu
      stockItem.quantity += parseFloat(item.quantity);
      stockItem.amount += item.amount;
      stockItem.discount = (parseFloat(stockItem.discount) || 0) + (parseFloat(item.discount) || 0);
      
      console.log(`✅ Cộng dồn tồn kho: ${item.name} | SL: +${item.quantity} | CK: +${item.discount}`);
    } else {
      // Thêm mới với đầy đủ thông tin phân loại và các trường cần thiết cho renderStock
      hkd.tonkhoMain.push({
        msp: consistentMSP,
        code: item.code,
        name: item.name,
        unit: item.unit,
        quantity: parseFloat(item.quantity),
        amount: item.amount,
        discount: parseFloat(item.discount) || 0,
        category: item.category,           // 🟡 Lưu category
        classification: item.classification, // 🟡 Lưu classification
        tchat: item.tchat,
        // 🔥 THÊM CÁC TRƯỜNG BỊ THIẾU cho filtering/aggregation
        productType: item.productType, 
        productId: item.productId,
      });
      console.log(`✅ Thêm mới tồn kho: ${item.name} | Phân loại: ${item.classification}`);
    }
  });
  
  console.log('📊 Tồn kho sau cập nhật:', hkd.tonkhoMain);
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
// Trích xuất hóa đơn từ ZIP
// =======================
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
window.generateProductCodeByName = generateProductCodeByName;
window.removeVietnameseAccents = removeVietnameseAccents;
window.isProductCodeExist = isProductCodeExist;