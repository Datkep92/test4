window.renderTonkho = function(){
  const container = document.getElementById('tonkhoTable');
  container.innerHTML='';
  for(const taxCode in hkdData){
    const hkd = hkdData[taxCode];
    const tbl = document.createElement('table');
    const header = `<tr>
      <th>STT</th><th>Mã SP</th><th>Tên</th><th>ĐVT</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th>
    </tr>`;
    tbl.innerHTML = header + hkd.tonkhoMain.map((item,idx)=>`
      <tr>
        <td>${idx+1}</td>
        <td>${item.msp}</td>
        <td>${item.name}</td>
        <td>${item.unit}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td>${item.amount}</td>
      </tr>
    `).join('');
    container.appendChild(document.createElement('h3')).innerText = `Công ty MST: ${taxCode}`;
    container.appendChild(tbl);
  }
};