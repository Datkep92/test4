// =======================
// Hạch toán tự động
// =======================
function renderAccounting(taxCode){
  ensureHkdData(taxCode);
  const container = document.getElementById('accountingTableBody');
  if(!container) return;
  container.innerHTML='';
  const entries = hkdData[taxCode].accountingEntries;
  entries.forEach(entry=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${entry.invoice}</td>
      <td>${entry.date}</td>
      <td>${entry.totalBeforeTax.toFixed(2)}</td>
      <td>${entry.discount.toFixed(2)}</td>
      <td>${entry.tax.toFixed(2)}</td>
      <td>${entry.total.toFixed(2)}</td>
    `;
    container.appendChild(tr);
  });
}

window.renderAccounting = renderAccounting;