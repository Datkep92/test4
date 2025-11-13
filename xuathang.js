// =======================
// Xuất hàng
// =======================
function exportStock(taxCode,productMsp,quantity){
  ensureHkdData(taxCode);
  const hkd = hkdData[taxCode];
  const item = hkd.tonkhoMain.find(p=>p.msp===productMsp);
  if(!item){ window.logAction(`Hàng ${productMsp} không tồn tại`); return;}
  if(item.quantity<quantity){ window.logAction(`Hàng ${productMsp} không đủ số lượng`); return;}
  item.quantity -= quantity;
  item.amount = parseFloat((item.quantity*item.price).toFixed(2));
  hkd.exports.push({msp:productMsp,quantity,amount:parseFloat((quantity*item.price).toFixed(2)),date:new Date().toISOString()});
  window.logAction(`Xuất ${quantity} ${item.unit} của ${productMsp}`);
  renderStock(taxCode);
}

window.exportStock = exportStock;