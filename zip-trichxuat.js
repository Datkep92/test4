// =======================
// HKD Data Store
// =======================
window.hkdData = {};
window.logAction = (msg) => {
  const logEl = document.getElementById('log');
  if(logEl){
    logEl.innerHTML += `<div>${msg}</div>`;
    logEl.scrollTop = logEl.scrollHeight;
  }
  console.log(msg);
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
      tonkhoCK: [],
      tonkhoKM: [],
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
    hkdData[taxCode][stock]?.some(item => item.productCode === code)
  );
}

// =======================
// Tạo mã sản phẩm chuẩn theo tên
// =======================
function generateProductCodeByName(taxCode, category, productName){
  const cleanName = removeVietnameseAccents(productName.toUpperCase())
    .replace(/[^A-Z0-9\s]/g,'');
  const words = cleanName.split(/\s+/).filter(Boolean);
  let lettersPart = '';
  if(words.length >= 2) lettersPart = words[0].substring(0,1) + words[1].substring(0,1);
  else if(words.length === 1) lettersPart = words[0].substring(0,2);
  else lettersPart = 'SP';
  
  const compactName = cleanName.replace(/\s/g,'');
  let numbersPart = '';
  const numberMatches = [...compactName.matchAll(/\d+/g)];
  
  if(numberMatches.length >=1){
    const firstMatch = numberMatches[0];
    const startIdx = firstMatch.index;
    const numStr = firstMatch[0];
    if(numberMatches.length >=3 || numStr.length >=3) numbersPart = numStr.substring(0,3);
    else if(numberMatches.length ===2 || numStr.length ===2){
      const beforeChar = startIdx>0 ? compactName[startIdx-1]:'X';
      numbersPart = (beforeChar+numStr).substring(0,3).padEnd(3,'X');
    } else if(numStr.length===1){
      const beforeChar = startIdx>0 ? compactName[startIdx-1]:'X';
      const afterChar = (startIdx+1<compactName.length)?compactName[startIdx+1]:'X';
      numbersPart = beforeChar + numStr + afterChar;
    }
  } else {
    numbersPart = compactName.slice(-3).padEnd(3,'X').substring(0,3);
  }
  
  let baseCode = lettersPart + numbersPart;
  let finalCode = baseCode;
  let suffixChar = 'A';
  
  while(isProductCodeExist(taxCode, finalCode) && suffixChar <= 'Z'){
    if(numbersPart.match(/^\d+$/)){
      finalCode = lettersPart + numbersPart.slice(0,-1) + suffixChar;
    } else {
      finalCode = baseCode.slice(0,-1) + suffixChar;
    }
    suffixChar = String.fromCharCode(suffixChar.charCodeAt(0)+1);
  }
  
  if(isProductCodeExist(taxCode, finalCode)){
    let randomSuffix='';
    do{
      randomSuffix = Math.random().toString(36).substring(2,5).toUpperCase();
      finalCode = baseCode.slice(0,3)+randomSuffix;
    } while(isProductCodeExist(taxCode, finalCode) && randomSuffix.length===3);
  }
  
  if(category==='chiet_khau') finalCode += '_CK';
  if(category==='KM') finalCode += '_KM';
  
  return finalCode.substring(0,6);
}

// =======================
// Parse XML hóa đơn
// =======================
function parseXmlInvoice(xmlContent, taxCode){
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent,"text/xml");
  const getText = (sel,p=xmlDoc)=>{ const n=p.querySelector(sel); return n?n.textContent.trim():''; };
  
  const invoiceInfo = {
    title:getText('HDon > DLHDon > TTChung > THDon'),
    symbol:getText('HDon > DLHDon > TTChung > KHMSHDon'),
    number:getText('HDon > DLHDon > TTChung > SHDon'),
    date:getText('HDon > DLHDon > TTChung > NLap'),
    mccqt:getText('HDon > MCCQT')?.toUpperCase()||''
  };
  
  const sellerInfo = {
    name:getText('HDon > DLHDon > NDHDon > NBan > Ten'),
    taxCode:getText('HDon > DLHDon > NDHDon > NBan > MST')
  };
  
  const buyerInfo = {
    name:getText('HDon > DLHDon > NDHDon > NMua > Ten'),
    taxCode:getText('HDon > DLHDon > NDHDon > NMua > MST')
  };
  
  const products=[];
  const productNodes = xmlDoc.querySelectorAll('HHDVu');
  productNodes.forEach((node,idx)=>{
    const tchat=parseInt(getText('TChat',node)||'1');
    const name=getText('THHDVu',node)||'';
    const code=getText('MaSP',node)||'';
    const unit=getText('DVTinh',node)||'';
    const quantity=parseFloat(getText('SLuong',node)||'0');
    const price=parseFloat(getText('DGia',node)||'0');
    const discount=parseFloat(getText('CKhau',node)||'0');
    const xmlAmount=parseFloat(getText('ThTien',node)||'0');
    let taxRate=0; const rawTax=getText('TSuat',node).replace('%','').trim();
    if(!isNaN(parseFloat(rawTax))) taxRate=parseFloat(rawTax);
    
    let category='hang_hoa';
    const lower = name.toLowerCase();
    const isCK = lower.includes('chiết khấu')||lower.includes('ck');
    if(quantity===0 && price===0) category='KM';
    else if(tchat===3 && isCK) category='chiet_khau';
    
    const msp = generateProductCodeByName(taxCode, category, name);
    const amount = quantity*price-discount;
    
    products.push({stt:idx+1, msp, code, name, unit, quantity, price, discount, amount, taxRate, category, xmlAmount});
  });
  
  const totals = {
    beforeTax: products.reduce((s,p)=>s+p.amount,0),
    tax: Math.round(products.reduce((s,p)=>s + (p.amount*p.taxRate/100),0))
  };
  totals.total = totals.beforeTax + totals.tax;
  
  return {invoiceInfo, sellerInfo, buyerInfo, products, totals};
}

// =======================
// Kiểm tra trùng HĐ
// =======================
function isDuplicate(invoice,taxCode){
  ensureHkdData(taxCode);
  const key=`${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
  return hkdData[taxCode].invoices.some(inv=>inv.uniqueKey===key);
}

// =======================
// Cập nhật tồn kho
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
        msp: item.msp, code: item.code, name: item.name, unit: item.unit,
        quantity: item.quantity, price: item.price, amount: item.amount
      });
    }
  });
}

// =======================
// Xử lý ZIP
// =======================
async function extractInvoiceFromZip(file){
  const zip = await JSZip.loadAsync(file);
  const xmlFile = Object.values(zip.files).find(f=>f.name.toLowerCase().endsWith('.xml'));
  if(!xmlFile) throw new Error('Không tìm thấy file XML trong ZIP');
  const xmlContent = await xmlFile.async('text');
  const taxCode = 'UNKNOWN'; // tạm, sẽ set khi parse
  return parseXmlInvoice(xmlContent, taxCode);
}

async function handleZipFiles(files){
  for(const file of files){
    if(!file.name.toLowerCase().endsWith('.zip')) continue;
    try{
      const invoice = await extractInvoiceFromZip(file);
      const taxCode = invoice.buyerInfo.taxCode||'UNKNOWN';
      ensureHkdData(taxCode);
      const uniqueKey = `${invoice.invoiceInfo.symbol}_${invoice.invoiceInfo.number}`;
      if(isDuplicate(invoice,taxCode)){
        window.logAction(`Trùng HĐ, bỏ qua: ${uniqueKey}`); continue;
      }
      
      const computedTotal = invoice.products.reduce((s,p)=>s+p.amount,0) +
        Math.round(invoice.products.reduce((s,p)=>s + (p.amount*p.taxRate/100),0));
      const totalDiff = Math.abs(computedTotal - invoice.totals.total);
      
      invoice.status = {validation: totalDiff<=1?'ok':'error', stockPosted: totalDiff<=1};
      invoice.uniqueKey = uniqueKey;
      invoice.extractedAt = new Date().toISOString();
      
      hkdData[taxCode].invoices.push(invoice);
      if(invoice.status.stockPosted) updateStock(taxCode, invoice);
      
      window.logAction(`[NHẬP HĐ] MST=${taxCode}, HĐ=${uniqueKey}, trạng thái=${invoice.status.validation}`);
      
    } catch(err){
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
window.generateProductCodeByName = generateProductCodeByName;