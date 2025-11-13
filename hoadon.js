function renderHoadon(){
  const container = document.getElementById('hoadon');
  container.innerHTML = '';
  for(const tax in hkdData){
    const comp = hkdData[tax];
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm';
    const header = document.createElement('tr');
    header.innerHTML = '<th>STT</th><th>Mã HĐ</th><th>Ngày</th><th>Người mua</th><th>Trạng thái</th><th>Tổng tiền</th>';
    table.appendChild(header);
    comp.invoices.forEach((inv,i)=>{
      const row = document.createElement('tr');
      row.innerHTML = `<td>${i+1}</td>
      <td>${inv.invoiceInfo.symbol}_${inv.invoiceInfo.number}</td>
      <td>${inv.invoiceInfo.date}</td>
      <td>${inv.buyerInfo.name}</td>
      <td>${inv.status.validation}</td>
      <td>${inv.totals.total.toLocaleString()}</td>`;
      table.appendChild(row);
    });
    const title = document.createElement('h5'); title.textContent = `Công ty: ${tax}`;
    container.appendChild(title);
    container.appendChild(table);
  }
}