function renderXuatHang(){
  const container = document.getElementById('xuathang');
  container.innerHTML = '';
  for(const tax in hkdData){
    const comp = hkdData[tax];
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm';
    const header = document.createElement('tr');
    header.innerHTML = '<th>STT</th><th>MSP</th><th>Tên hàng</th><th>Số lượng xuất</th><th>Đơn giá</th><th>Thành tiền</th>';
    table.appendChild(header);
    comp.tonkhoMain.forEach((item,i)=>{
      const row = document.createElement('tr');
      row.innerHTML = `<td>${i+1}</td><td>${item.msp}</td><td>${item.name}</td>
      <td>${item.quantity}</td><td>${item.price.toLocaleString()}</td><td>${item.amount.toLocaleString()}</td>`;
      table.appendChild(row);
    });
    const title = document.createElement('h5'); title.textContent = `Xuất kho công ty: ${tax}`;
    container.appendChild(title);
    container.appendChild(table);
  }
}