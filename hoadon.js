// =======================
// Hiển thị danh sách Hóa đơn
// =======================
function renderInvoices(taxCode){
  ensureHkdData(taxCode);
  const container = document.getElementById('hoadonTableBody');
  if(!container) return;
  container.innerHTML = '';
  const invoices = hkdData[taxCode].invoices;
  invoices.forEach(inv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${inv.invoiceInfo.symbol}</td>
      <td>${inv.invoiceInfo.number}</td>
      <td>${inv.invoiceInfo.date}</td>
      <td>${inv.sellerInfo.name}</td>
      <td>${inv.buyerInfo.name}</td>
      <td>${inv.totals.beforeTax.toFixed(2)}</td>
      <td>${inv.totals.tax.toFixed(2)}</td>
      <td>${inv.totals.total.toFixed(2)}</td>
      <td>${inv.status.validation}</td>
      <td>${inv.extractedAt}</td>
    `;
    container.appendChild(tr);
  });
}

// =======================
// Render danh sách tất cả công ty
// =======================
function renderCompanyList(){
  const container = document.getElementById('companyList');
  if(!container) return;
  container.innerHTML='';
  Object.keys(hkdData).forEach(tax=>{
    const btn = document.createElement('button');
    btn.textContent=tax;
    btn.onclick = ()=>renderInvoices(tax);
    container.appendChild(btn);
  });
}

window.renderInvoices = renderInvoices;
window.renderCompanyList = renderCompanyList;