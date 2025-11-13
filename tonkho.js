// =======================
// Hiển thị tồn kho
// =======================
function renderStock(taxCode){
  ensureHkdData(taxCode);
  const container = document.getElementById('tonkhoTableBody');
  if(!container) return;
  container.innerHTML='';
  const stocks = hkdData[taxCode].tonkhoMain;
  stocks.forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${item.msp}</td>
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td>${item.quantity.toFixed(2)}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${item.amount.toFixed(2)}</td>
    `;
    container.appendChild(tr);
  });
}

// =======================
// Render toàn bộ công ty tồn kho
// =======================
function renderAllStock(){
  const container = document.getElementById('companyStockList');
  if(!container) return;
  container.innerHTML='';
  Object.keys(hkdData).forEach(tax=>{
    const btn = document.createElement('button');
    btn.textContent=tax;
    btn.onclick = ()=>renderStock(tax);
    container.appendChild(btn);
  });
}

window.renderStock = renderStock;
window.renderAllStock = renderAllStock;