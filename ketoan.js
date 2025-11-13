function renderKeToan(){
  const container = document.getElementById('ketoan');
  container.innerHTML = '';
  for(const tax in hkdData){
    const comp = hkdData[tax];
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm';
    const header = document.createElement('tr');
    header.innerHTML = '<th>STT</th><th>Mã HĐ</th><th>Ngày</th><th>Tổng trước thuế</th><th>Chiết khấu</th><th>Thuế</th><th>Tổng cộng</th>';
    table.appendChild(header);
    comp.accountingEntries.forEach((entry,i)=>{
      const row = document.createElement('tr');
      row.innerHTML = `<td>${i+1}</td><td>${entry.invoice}</td><td>${entry.date}</td>
      <td>${entry.totalBeforeTax.toLocaleString()}</td><td>${entry.discount.toLocaleString()}</td>
      <td>${entry.tax.toLocaleString()}</td><td>${entry.total.toLocaleString()}</td>`;
      table.appendChild(row);
    });
    const title = document.createElement('h5'); title.textContent = `Kế toán công ty: ${tax}`;
    container.appendChild(title);
    container.appendChild(table);
  }
}