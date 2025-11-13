window.renderHoadon = function(){
  const container = document.getElementById('hoadonTable');
  container.innerHTML='';
  for(const taxCode in hkdData){
    const hkd = hkdData[taxCode];
    const tbl = document.createElement('table');
    const header = `<tr>
      <th>STT</th><th>Số HĐ</th><th>Ngày</th><th>Người bán</th><th>Người mua</th>
      <th>Tổng trước thuế</th><th>Thuế</th><th>Tổng HĐ</th><th>Trạng thái</th>
    </tr>`;
    tbl.innerHTML = header + hkd.invoices.map((inv,idx)=>`
      <tr>
        <td>${idx+1}</td>
        <td>${inv.invoiceInfo.symbol}_${inv.invoiceInfo.number}</td>
        <td>${inv.invoiceInfo.date}</td>
        <td>${inv.sellerInfo.name}</td>
        <td>${inv.buyerInfo.name}</td>
        <td>${inv.totals.beforeTax}</td>
        <td>${inv.totals.tax}</td>
        <td>${inv.totals.total}</td>
        <td>${inv.status.validation}</td>
      </tr>
    `).join('');
    container.appendChild(document.createElement('h3')).innerText = `Công ty MST: ${taxCode}`;
    container.appendChild(tbl);
  }
};