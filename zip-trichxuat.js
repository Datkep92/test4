window.hkdData = {};

// =======================
// Log hiển thị trên UI
// =======================
window.logAction = function(msg) {
  const logEl = document.getElementById('logOutput');
  if (logEl) {
    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  } else {
    console.log(msg);
  }
};

// =======================
// Tạo / kiểm tra HKD
// =======================
function ensureHkdData(taxCode){
  if(!hkdData[taxCode]){
    hkdData[taxCode] = {
      name: taxCode,
      invoices: [],
      tonkhoMain: [],
      tonkhoKM: [],
      tonkhoCK: [],
      accountingEntries: [], // ghi sổ kế toán
      tonkhoMainDefault: null,
      exports: []
    };
  }
}

// =======================
// Loại bỏ dấu tiếng Việt
// =======================
function removeVietnameseAccents(str){
  return str.normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/đ/g,"d").replace(/Đ/g,"D");
}

// =======================
// Kiểm tra mã sản phẩm tồn tại
// =======================
function isProductCodeExist(taxCode, code){
  const stocks = ['tonkhoMain', 'tonkhoKM', 'tonkhoCK'];
  return stocks.some(stock =>
    hkdData[taxCode][stock]?.some(item => item.msp === code)
  );
}

// =======================
// Tạo mã sản phẩm chuẩn (MSP)
// =======================
function generateMSP(code, idx, category, taxCode, productName){
  if(productName){
    // tạo theo tên sản phẩm + kiểm tra trùng
    const cleanName = removeVietnameseAccents(productName.toUpperCase()).replace(/[^A-Z0-9\s]/g,'');
    let lettersPart = '';
    const words = cleanName.split(/\s+/).filter(Boolean);
    if(words.length >= 2) lettersPart = words[0].substring(0,1)+words[1].substring(0,1);
    else if(words.length===1) lettersPart = words[0].substring(0,2);
    else lettersPart = 'SP';
    let numbersPart = cleanName.replace(/\s/g,'').slice(-3).padEnd(3,'X').substring(0,3);
    let baseCode = lettersPart + numbersPart;
    let finalCode = baseCode;
    let suffixChar = 'A';
    while(isProductCodeExist(taxCode, finalCode) && suffixChar <= 'Z'){
      finalCode = baseCode.slice(0, -1) + suffixChar;
      suffixChar = String.fromCharCode(suffixChar.charCodeAt(0)+1);
    }
    code = finalCode;
  } else {
    code = code || `MSP${String(idx+1).padStart(5,'0')}`;
  }
  if(category==='chiet_khau') code+='_CK';
  if(category==='KM') code+='_KM';
  return code;
}

// =======================
// Parse XML hóa đơn
// =======================
function parseXmlInvoice(xmlContent){
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent,"text/xml");
  const getText = (sel,p=xmlDoc)=>{const n=p.querySelector(sel); return n?n.textContent.trim():'';};

  const invoiceInfo = {
    title: getText('HDon > DLHDon > TTChung > THDon'),
    symbol: getText('HDon > DLHDon > TTChung > KHMSHDon'),
    number: getText('HDon > DLHDon > TTChung > SHDon'),
    date: getText('HDon > DLHDon > TTChung > NLap'),
    mccqt: getText('HDon > MCCQT')?.toUpperCase()||''
  };
  const sellerInfo = {
    name: getText('HDon > DLHDon > NDHDon > NBan > Ten'),
    taxCode: getText('HDon > DLHDon > NDHDon > NBan > MST')
  };
  const buyerInfo = {
    name: getText('HDon > DLHDon > NDHDon > NMua > Ten'),
    taxCode: getText('HDon > DLHDon > NDHDon > NMua > MST')
  };

  const products = [];
  const productNodes = xmlDoc.querySelectorAll('HHDVu');
  productNodes.forEach((node, idx) => {
    const tchat = parseInt(getText('TChat', node) || '1');
    const name = getText('THHDVu', node) || '';
    const code = getText('MaSP', node) || '';
    const unit = getText('DVTinh', node) || '';
    const quantity = parseFloat(getText('SLuong', node) || '0');
    const price = parseFloat(getText('DGia', node) || '0');
    const discount = parseFloat(getText('CKhau', node) || '0');
    const xmlAmount = parseFloat(getText('ThTien', node) || '0');
    let taxRate = 0; 
    const rawTax = getText('TSuat', node).replace('%','').trim(); 
    if(!isNaN(parseFloat(rawTax))) taxRate = parseFloat(rawTax);

    let category = 'hang_hoa';
    const lower = name.toLowerCase();
    const isCK = lower.includes('chiết khấu')||lower.includes('ck'); 
    if(quantity===0 && price===0) category='KM';
    else if(tchat===3 && isCK) category='chiet_khau';

    const msp = generateMSP(code, idx, category, buyerInfo.taxCode, name);
    const amount = quantity*price - discount;
    const totalWithTax = amount + Math.round(amount*taxRate/100);

    products.push({
      stt: idx+1,
      msp,
      code,
      name,
      unit,
      quantity,
      price,
      discount,
      amount,
      taxRate,
      totalWithTax,
      category,
      xmlAmount
    });
  });

  const totals = {
    beforeTax: products.reduce((s,p)=>s+p.amount,0),
    discount: products.reduce((s,p)=>s.discount,0),
    tax: Math.round(products.reduce((s,p)=>s + (p.amount*p.taxRate/100),0)),
  };
  totals.total = totals.beforeTax - totals.discount + totals.tax;

  return {invoiceInfo, sellerInfo, buyerInfo, products, totals};
}

// =======================
// Kiểm tra trùng HĐ
// =======================
function isDuplicate(invoice, taxCode){
  ensureHkdData(taxCode);
  const key = `${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
  return hkdData[taxCode].invoices.some(inv => inv.uniqueKey===key);
}

// =======================
// Cập nhật tồn kho delta
// =======================
function updateStock(taxCode, invoice){
  ensureHkdData(taxCode);
  const hkd = hkdData[taxCode];
  invoice.products.forEach(item=>{
    if(item.category!=='hang_hoa') return;
    let stockItem = hkd.tonkhoMain.find(p=>p.msp===item.msp);
    if(stockItem){
      stockItem.quantity += item.quantity;
      stockItem.amount += item.amount;
    } else {
      hkd.tonkhoMain.push({
        msp: item.msp,
        code: item.code,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount
      });
    }
  });
  // Ghi sổ kế toán tự động
  const accountingEntry = {
    invoice: `${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`,
    date: invoice.invoiceInfo.date,
    totalBeforeTax: invoice.totals.beforeTax,
    discount: invoice.totals.discount,
    tax: invoice.totals.tax,
    total: invoice.totals.total
  };
  hkd.accountingEntries.push(accountingEntry);
}

// =======================
// Xử lý ZIP
// =======================
async function extractInvoiceFromZip(file){
  const zip = await JSZip.loadAsync(file);
  const xmlFile = Object.values(zip.files).find(f=>f.name.toLowerCase().endsWith('.xml'));
  if(!xmlFile) throw new Error('Không tìm thấy file XML trong ZIP');
  const xmlContent = await xmlFile.async('text');
  return parseXmlInvoice(xmlContent);
}

async function handleZipFiles(files){
  for(const file of files){
    if(!file.name.toLowerCase().endsWith('.zip')) continue;
    try{
      const invoice = await extractInvoiceFromZip(file);
      if(!invoice || !invoice.products || invoice.products.length===0){
        window.logAction(`Bỏ qua file ${file.name}`);
        continue;
      }
      const taxCode = invoice.buyerInfo.taxCode || 'UNKNOWN';
      ensureHkdData(taxCode);
      const uniqueKey = `${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
      if(isDuplicate(invoice, taxCode)){
        window.logAction(`Trùng HĐ, bỏ qua: ${uniqueKey}`);
        continue;
      }
      const computedTotal = invoice.products.reduce((s,p)=>s+p.amount,0) - invoice.products.reduce((s,p)=>s+p.discount,0) + Math.round(invoice.products.reduce((s,p)=>s + (p.amount*p.taxRate/100),0));
      const totalDiff = Math.abs(computedTotal - invoice.totals.total);
      invoice.status = {validation: totalDiff<=1?'ok':'error', stockPosted: totalDiff<=1};
      invoice.uniqueKey = uniqueKey;
      invoice.extractedAt = new Date().toISOString();
      hkdData[taxCode].invoices.push(invoice);
      if(invoice.status.stockPosted) updateStock(taxCode, invoice);
      window.logAction(`[NHẬP HĐ] MST=${taxCode}, HĐ=${uniqueKey}, trạng thái=${invoice.status.validation}`);
    }catch(err){
      window.logAction(`Lỗi file ${file.name}: ${err.message}`);
    }
  }
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