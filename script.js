// === State Management ===
const state = {
  tables: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Bàn ${String(i + 1).padStart(2, '0')}`,
    items: [],
    startTime: null,
    status: 'free',
    paidAmount: 0
  })),
  menu: [
    // Món chính
    { id: 1, name: "Phở Bò", price: 50000, category: "Món chính" },
    { id: 2, name: "Phở Gà", price: 45000, category: "Món chính" },
    { id: 3, name: "Bún Bò Huế", price: 55000, category: "Món chính" },
    { id: 4, name: "Bún Chả Hà Nội", price: 45000, category: "Món chính" },
    { id: 5, name: "Bún Riêu Cua", price: 40000, category: "Món chính" },
    { id: 6, name: "Hủ Tiếu Nam Vang", price: 45000, category: "Món chính" },
    { id: 7, name: "Cơm Tấm Sườn", price: 55000, category: "Món chính" },
    { id: 8, name: "Cơm Gà Xối Mỡ", price: 50000, category: "Món chính" },
    { id: 9, name: "Cơm Chiên Dương Châu", price: 45000, category: "Món chính" },
    { id: 10, name: "Mì Quảng", price: 40000, category: "Món chính" },
    { id: 11, name: "Bánh Canh Cua", price: 50000, category: "Món chính" },
    { id: 12, name: "Bún Đậu Mắm Tôm", price: 60000, category: "Món chính" },
    { id: 13, name: "Cơm Cá Kho", price: 45000, category: "Món chính" },
    { id: 14, name: "Cơm Tôm Rim", price: 50000, category: "Món chính" },
    { id: 15, name: "Cơm Gà Hải Nam", price: 55000, category: "Món chính" },

    // Ăn vặt
    { id: 16, name: "Bánh Mì Pate", price: 25000, category: "Ăn vặt" },
    { id: 17, name: "Bánh Mì Trứng", price: 20000, category: "Ăn vặt" },
    { id: 18, name: "Bánh Mì Xíu Mại", price: 30000, category: "Ăn vặt" },
    { id: 19, name: "Gỏi Cuốn", price: 35000, category: "Ăn vặt" },
    { id: 20, name: "Chả Giò", price: 40000, category: "Ăn vặt" },
    { id: 21, name: "Bánh Xèo", price: 45000, category: "Ăn vặt" },
    { id: 22, name: "Bánh Khọt", price: 50000, category: "Ăn vặt" },
    { id: 23, name: "Bánh Bèo", price: 35000, category: "Ăn vặt" },
    { id: 24, name: "Bánh Cuốn", price: 40000, category: "Ăn vặt" },
    { id: 25, name: "Nem Lụi", price: 30000, category: "Ăn vặt" },
    { id: 26, name: "Bánh Tráng Trộn", price: 25000, category: "Ăn vặt" },
    { id: 27, name: "Bánh Tráng Nướng", price: 30000, category: "Ăn vặt" },
    { id: 28, name: "Xôi Mặn", price: 25000, category: "Ăn vặt" },
    { id: 29, name: "Xôi Ngọt", price: 20000, category: "Ăn vặt" },
    { id: 30, name: "Bánh Flan", price: 25000, category: "Ăn vặt" },

    // Nước uống
    { id: 31, name: "Cà Phê Đen", price: 20000, category: "Nước uống" },
    { id: 32, name: "Cà Phê Sữa", price: 25000, category: "Nước uống" },
    { id: 33, name: "Trà Đá", price: 5000, category: "Nước uống" },
    { id: 34, name: "Trà Chanh", price: 15000, category: "Nước uống" },
    { id: 35, name: "Trà Đào", price: 20000, category: "Nước uống" },
    { id: 36, name: "Nước Cam", price: 25000, category: "Nước uống" },
    { id: 37, name: "Nước Chanh", price: 15000, category: "Nước uống" },
    { id: 38, name: "Sinh Tố Bơ", price: 30000, category: "Nước uống" },
    { id: 39, name: "Sinh Tố Dâu", price: 30000, category: "Nước uống" },
    { id: 40, name: "Sinh Tố Xoài", price: 30000, category: "Nước uống" },
    { id: 41, name: "Nước Dừa", price: 25000, category: "Nước uống" },
    { id: 42, name: "Bia Tiger", price: 25000, category: "Nước uống" },
    { id: 43, name: "Bia Heineken", price: 30000, category: "Nước uống" },
    { id: 44, name: "Rượu Vang Đỏ", price: 120000, category: "Nước uống" },
    { id: 45, name: "Rượu Vang Trắng", price: 120000, category: "Nước uống" },
    { id: 46, name: "Whisky", price: 150000, category: "Nước uống" },
    { id: 47, name: "Cocktail", price: 80000, category: "Nước uống" },
    { id: 48, name: "Nước Suối", price: 10000, category: "Nước uống" },
    { id: 49, name: "Nước Ngọt Cocacola", price: 15000, category: "Nước uống" },
    { id: 50, name: "Nước Ngọt Pepsi", price: 15000, category: "Nước uống" }
  ],
  selectedTableId: null,
  surcharge: 0,
  currentEditingItem: null,
  isEditMode: false,
  currentImage: null,
  currentImageUrl: null
};

// === Utility Functions ===
function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

function getElapsedTime(startTime) {
  if (!startTime) return '0 phút';
  const mins = Math.floor((Date.now() - startTime) / 60000);
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  return `${h} giờ ${mins % 60} phút`;
}

// === Render Functions ===
function renderTables() {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '';
  state.tables.forEach(table => {
    const currentTotal = table.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const totalAmount = table.paidAmount + currentTotal;
    const elapsed = table.startTime ? getElapsedTime(table.startTime) : 'Trống';
    const div = document.createElement('div');
    div.className = `table-card ${table.status}`;
    div.innerHTML = `
      <div class="status-badge">${table.status === 'free' ? 'Trống' : table.status === 'occupied' ? 'Đang dùng' : 'Đã TT'}</div>
      <div class="table-name">${table.name}</div>
      <div class="table-info">
        <i class="far fa-clock"></i> ${elapsed}<br>
        ${table.status !== 'free' ? `<i class="fas fa-receipt"></i> ${formatCurrency(totalAmount)}` : ''}
        ${table.paidAmount > 0 ? `<br><small>Đã TT: ${formatCurrency(table.paidAmount)}</small>` : ''}
      </div>
    `;
    div.onclick = () => openOrderPopup(table.id);
    container.appendChild(div);
  });
}

function renderMenuCategories() {
  const tabs = document.getElementById('categoryTabs');
  tabs.innerHTML = '';
  const categories = [...new Set(state.menu.map(m => m.category))];
  categories.forEach(cat => {
    const btn = document.createElement('input');
    btn.type = 'button';
    btn.value = cat;
    btn.onclick = () => {
      // Xóa active từ tất cả các tab
      document.querySelectorAll('#categoryTabs input').forEach(b => b.classList.remove('active'));
      // Thêm active cho tab được chọn
      btn.classList.add('active');
      renderMenuItems(cat);
    };
    tabs.appendChild(btn);
  });
}
// Cập nhật hàm renderMenuItems để hiển thị ảnh
function renderMenuItems(category) {
  const grid = document.getElementById('menuItems');
  grid.innerHTML = '';
  const items = state.menu.filter(item => item.category === category);
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <div class="menu-item-img">
        ${item.imageUrl ? 
          `<img src="${item.imageUrl}" alt="${item.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;">` : 
          `<i class="fas fa-utensils"></i>`}
      </div>
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">${formatCurrency(item.price)}</div>
      </div>
      ${state.isEditMode ? `
        <button class="edit-item-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
        <button class="delete-item-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
      ` : ''}
    `;
    
    // Thêm sự kiện click cho item menu
    if (!state.isEditMode) {
      div.onclick = () => {
        const table = state.tables.find(t => t.id === state.selectedTableId);
        if (table.status === 'paid') table.status = 'occupied';
        const existingItem = table.items.find(i => i.id === item.id);
        if (existingItem) existingItem.qty++;
        else table.items.push({ ...item, qty: 1 });
        if (!table.startTime) {
          table.startTime = Date.now();
          table.status = 'occupied';
        }
        document.querySelector(`#categoryTabs input[value="${item.category}"]`).click();
        renderBillItems();
        renderTables();
      };
    } else {
      // Thêm sự kiện cho nút edit
      const editBtn = div.querySelector('.edit-item-btn');
      if (editBtn) {
        editBtn.onclick = (e) => {
          e.stopPropagation();
          openEditItemPopup(item.id);
        };
      }
      
      // Thêm sự kiện cho nút delete
      const deleteBtn = div.querySelector('.delete-item-btn');
      if (deleteBtn) {
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          deleteItem(item.id);
        };
      }
    }
    
    grid.appendChild(div);
  });
}

function renderBillItems() {
  const container = document.getElementById('billItems');
  const table = state.tables.find(t => t.id === state.selectedTableId);
  container.innerHTML = '';
  table.items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'bill-item';
    div.innerHTML = `
      <div class="bill-item-name">${item.name}</div>
      <div class="bill-item-details">
        <button class="decrease-btn" data-id="${item.id}">-</button>
        <div class="bill-item-qty">${item.qty} × ${formatCurrency(item.price)}</div>
        <div class="bill-item-price">${formatCurrency(item.qty * item.price)}</div>
        <button class="delete-btn" data-id="${item.id}">X</button>
      </div>
    `;
    container.appendChild(div);
  });
  const currentTotal = table.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const totalWithSurcharge = currentTotal + (currentTotal * state.surcharge / 100);
  const grandTotal = table.paidAmount + totalWithSurcharge;
  document.getElementById('billTotal').textContent = formatCurrency(grandTotal);

  document.querySelectorAll('.decrease-btn').forEach(btn => {
    btn.onclick = () => {
      const itemId = parseInt(btn.getAttribute('data-id'));
      const item = table.items.find(i => i.id === itemId);
      if (item) {
        item.qty--;
        if (item.qty <= 0) table.items = table.items.filter(i => i.id !== itemId);
        renderBillItems();
        renderTables();
      }
    };
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const itemId = parseInt(btn.getAttribute('data-id'));
      table.items = table.items.filter(i => i.id !== itemId);
      renderBillItems();
      renderTables();
    };
  });
}

// === Order Functions ===
function openOrderPopup(tableId) {
  state.selectedTableId = tableId;
  document.getElementById('orderPopup').style.display = 'flex'; // Thay 'block' bằng 'flex'
  state.surcharge = 0;
  
  // Render danh mục
  renderMenuCategories();
  
  // Render ngay danh sách món ăn của danh mục đầu tiên
  const categories = [...new Set(state.menu.map(m => m.category))];
  if (categories.length > 0) {
    renderMenuItems(categories[0]);
    
    // Đặt danh mục đầu tiên là active
    const firstTab = document.querySelector('#categoryTabs input');
    if (firstTab) firstTab.classList.add('active');
  }
  
  renderBillItems();
}
function closePopup() {
  document.getElementById('orderPopup').style.display = 'none';
  renderTables();
}

// === Bill Functions ===
function handleConfirm() { closePopup(); }

function handlePay() {
  const table = state.tables.find(t => t.id === state.selectedTableId);
  const currentTotal = table.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const totalWithSurcharge = currentTotal + (currentTotal * state.surcharge / 100);
  if (totalWithSurcharge <= 0) {
    alert('Không có món nào để thanh toán!');
    return;
  }
  const paymentType = confirm(`Bàn ${table.name} - Tổng: ${formatCurrency(totalWithSurcharge)}\nKhách thanh toán tại quầy? (OK = tại quầy, Cancel = mang đi)`)
    ? 'tại quầy' : 'mang đi';
  if (paymentType === 'mang đi') {
    table.items = []; table.startTime = null; table.status = 'free'; table.paidAmount = 0;
    alert(`Đã thanh toán mang đi: ${formatCurrency(totalWithSurcharge)}`);
  } else {
    table.paidAmount += totalWithSurcharge; table.items = []; table.status = 'paid';
    alert(`Đã thanh toán tại quầy: ${formatCurrency(totalWithSurcharge)}\nTổng đã TT: ${formatCurrency(table.paidAmount)}`);
  }
  state.surcharge = 0;
  closePopup();
}

function printBill() {
  const table = state.tables.find(t => t.id === state.selectedTableId);
  const currentTotal = table.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const totalWithSurcharge = currentTotal + (currentTotal * state.surcharge / 100);
  const grandTotal = table.paidAmount + totalWithSurcharge;
  let billContent = `BÀN: ${table.name}\nThời gian: ${new Date().toLocaleString('vi-VN')}\nTrạng thái: ${table.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}\n----------------------------\n`;
  table.items.forEach(item => billContent += `${item.name} x${item.qty}: ${formatCurrency(item.qty * item.price)}\n`);
  if (state.surcharge > 0) billContent += `Phụ phí ${state.surcharge}%: ${formatCurrency(currentTotal * state.surcharge / 100)}\n`;
  billContent += `----------------------------\nTỔNG CỘNG: ${formatCurrency(grandTotal)}\n${table.paidAmount > 0 ? `Đã thanh toán: ${formatCurrency(table.paidAmount)}\nCòn lại: ${formatCurrency(totalWithSurcharge)}` : ''}`;
  console.log('=== HÓA ĐƠN IN ===\n' + billContent);
  alert('Đã gửi hóa đơn đến máy in!');
}

function splitBill() { alert('Tính năng tách bill sẽ được triển khai sau!'); }
function addSurcharge() {
  const percent = prompt('Nhập % phụ phí (ví dụ: 10):', '10');
  if (percent && !isNaN(percent)) { state.surcharge = parseInt(percent); renderBillItems(); }
}
function openManagementPopup(type) { alert(`Tính năng quản lý ${type} sẽ được triển khai sau!`); }

// === New Functions for Product and Table Management ===
// Cập nhật hàm openAddProductPopup
function openAddProductPopup() {
  // Reset image state
  state.currentImage = null;
  state.currentImageUrl = null;

  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.style.display = 'flex';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-header">
        <div class="popup-title">Thêm sản phẩm mới</div>
        <button class="popup-close" onclick="this.closest('.popup-overlay').remove()">&times;</button>
      </div>
      
      <div class="image-upload-container">
        <img id="imagePreview" class="image-preview" alt="Ảnh sản phẩm">
        <button class="upload-btn" onclick="handleImageUpload()">
          <i class="fas fa-camera camera-icon"></i> Chọn ảnh
        </button>
        <button class="remove-image-btn" onclick="removeImage()">Xóa ảnh</button>
      </div>
      
      <div class="popup-form-group">
        <label for="newProductName">Tên sản phẩm</label>
        <input type="text" id="newProductName" placeholder="Nhập tên sản phẩm">
      </div>
      <div class="popup-form-group">
        <label for="newProductPrice">Giá (đồng)</label>
        <input type="number" id="newProductPrice" placeholder="Nhập giá">
      </div>
      <div class="popup-form-group">
        <label for="newProductCategory">Danh mục</label>
        <select id="newProductCategory">
          <option value="Món chính">Món chính</option>
          <option value="Ăn vặt">Ăn vặt</option>
          <option value="Nước uống">Nước uống</option>
        </select>
      </div>
      <div class="popup-actions">
        <button class="popup-btn popup-btn-cancel" onclick="this.closest('.popup-overlay').remove()">Hủy</button>
        <button class="popup-btn popup-btn-primary" onclick="saveNewProduct()">Lưu</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}

function removeImage() {
  state.currentImage = null;
  state.currentImageUrl = null;
  
  const preview = document.getElementById('imagePreview');
  if (preview) {
    preview.src = '';
    preview.style.display = 'none';
    document.querySelector('.remove-image-btn').style.display = 'none';
  }
  
  // Reset file input
  document.getElementById('fileInput').value = '';
}

// Thêm các hàm mới
function handleImageUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.capture = 'camera'; // Cho phép chụp ảnh trực tiếp
  fileInput.style.display = 'none';
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.currentImage = file;
        state.currentImageUrl = event.target.result;
        
        // Hiển thị ảnh preview
        const preview = document.getElementById('imagePreview');
        if (preview) {
          preview.src = state.currentImageUrl;
          preview.style.display = 'block';
          const removeBtn = preview.nextElementSibling.nextElementSibling;
          if (removeBtn) removeBtn.style.display = 'inline-block';
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  document.body.appendChild(fileInput);
  fileInput.click();
  setTimeout(() => fileInput.remove(), 1000);
}

// Cập nhật hàm openEditItemPopup
function openEditItemPopup(itemId) {
  const item = state.menu.find(i => i.id === itemId);
  if (!item) return;
  
  // Reset image state
  state.currentImage = null;
  state.currentImageUrl = item.imageUrl || null;
  
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.style.display = 'flex';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-header">
        <div class="popup-title">Chỉnh sửa sản phẩm</div>
        <button class="popup-close" onclick="this.closest('.popup-overlay').remove()">&times;</button>
      </div>
      
      <div class="image-upload-container">
        <img id="imagePreview" class="image-preview" src="${item.imageUrl || ''}" 
             style="display: ${item.imageUrl ? 'block' : 'none'}" alt="Ảnh sản phẩm">
        <button class="upload-btn" onclick="handleImageUpload()">
          <i class="fas fa-camera camera-icon"></i> ${item.imageUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
        </button>
        <button class="remove-image-btn" onclick="removeImage()" 
                style="display: ${item.imageUrl ? 'inline-block' : 'none'}">Xóa ảnh</button>
      </div>
      
      <div class="popup-form-group">
        <label for="editProductName">Tên sản phẩm</label>
        <input type="text" id="editProductName" value="${item.name}">
      </div>
      <div class="popup-form-group">
        <label for="editProductPrice">Giá (đồng)</label>
        <input type="number" id="editProductPrice" value="${item.price}">
      </div>
      <div class="popup-form-group">
        <label for="editProductCategory">Danh mục</label>
        <select id="editProductCategory">
          <option value="Món chính" ${item.category === 'Món chính' ? 'selected' : ''}>Món chính</option>
          <option value="Ăn vặt" ${item.category === 'Ăn vặt' ? 'selected' : ''}>Ăn vặt</option>
          <option value="Nước uống" ${item.category === 'Nước uống' ? 'selected' : ''}>Nước uống</option>
        </select>
      </div>
      <div class="popup-actions">
        <button class="popup-btn popup-btn-cancel" onclick="this.closest('.popup-overlay').remove()">Hủy</button>
        <button class="popup-btn popup-btn-primary" onclick="saveEditedProduct(${item.id})">Lưu thay đổi</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}
// Cập nhật hàm saveNewProduct
function saveNewProduct() {
  const name = document.getElementById('newProductName').value;
  const price = parseInt(document.getElementById('newProductPrice').value);
  const category = document.getElementById('newProductCategory').value;
  
  if (!name || !price || price <= 0) {
    alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
    return;
  }
  
  const newProduct = { 
    id: Date.now(), 
    name, 
    price, 
    category,
    imageUrl: state.currentImageUrl || null
  };
  
  state.menu.push(newProduct);
  
  // Đóng popup
  document.querySelector('.popup-overlay:last-child').remove();
  
  // Cập nhật giao diện
  const activeCategory = document.querySelector('#categoryTabs .active')?.value;
  renderMenuItems(activeCategory || category);
  renderTables();
  
  // Reset state ảnh
  state.currentImage = null;
  state.currentImageUrl = null;
}


// Cập nhật hàm saveEditedProduct
function saveEditedProduct(itemId) {
  const item = state.menu.find(i => i.id === itemId);
  if (!item) return;
  
  item.name = document.getElementById('editProductName').value;
  item.price = parseInt(document.getElementById('editProductPrice').value);
  item.category = document.getElementById('editProductCategory').value;
  
  // Cập nhật ảnh nếu có
  if (state.currentImageUrl) {
    item.imageUrl = state.currentImageUrl;
    // Trong thực tế, bạn cần upload ảnh lên server và lưu URL thật
    // item.imageUrl = await uploadImageToServer(state.currentImage);
  } else if (document.querySelector('.remove-image-btn').style.display === 'inline-block' && !state.currentImageUrl) {
    // Nếu người dùng xóa ảnh
    item.imageUrl = null;
  }
  
  // Đóng popup
  document.querySelector('.popup-overlay:last-child').remove();
  
  // Cập nhật giao diện
  const activeCategory = document.querySelector('#categoryTabs .active')?.value;
  renderMenuItems(activeCategory || item.category);
  renderTables();
}

function deleteItem(itemId) {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    state.menu = state.menu.filter(i => i.id !== itemId);
    const activeCategory = document.querySelector('#categoryTabs .active')?.value;
    renderMenuItems(activeCategory || state.menu[0]?.category || 'Món chính');
  }
}

function addTable() {
  const maxId = state.tables.reduce((max, table) => Math.max(max, table.id), 0);
  const newTable = {
    id: maxId + 1,
    name: `Bàn ${String(maxId + 1).padStart(2, '0')}`,
    items: [],
    startTime: null,
    status: 'free',
    paidAmount: 0
  };
  state.tables.push(newTable);
  renderTables();
}

function removeTable() {
  if (state.tables.length > 1) {
    state.tables.pop();
    if (state.selectedTableId === state.tables[state.tables.length - 1]?.id) {
      state.selectedTableId = null;
      closePopup();
    }
    renderTables();
  } else {
    alert('Phải giữ ít nhất 1 bàn!');
  }
}

// === Toggle Edit Mode ===
function toggleEditMode() {
  state.isEditMode = !state.isEditMode;
  const activeCategory = document.querySelector('#categoryTabs .active')?.value;
  renderMenuItems(activeCategory || state.menu[0]?.category || 'Món chính');
  
  // Thay đổi icon khi ở chế độ edit
  const settingBtn = document.getElementById('settingBtn');
  if (state.isEditMode) {
    settingBtn.innerHTML = '<i class="fas fa-edit"></i> Đang chỉnh sửa';
    settingBtn.style.color = '#e74c3c';
  } else {
    settingBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingBtn.style.color = '#2ecc71';
  }
}

// Xóa hàm openAddProductPopup từ phần order popup
// (đã di chuyển ra main controls)

// === Initialize ===
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('confirmBtn').onclick = handleConfirm;
  document.getElementById('payBtn').onclick = handlePay;
  document.getElementById('printBtn').onclick = printBill;
  document.getElementById('splitBillBtn').onclick = splitBill;
  document.getElementById('addSurchargeBtn').onclick = addSurcharge;
  document.getElementById('settingBtn').onclick = toggleEditMode;
  document.getElementById('settingBtn').onclick = toggleEditMode;
  document.getElementById('addTableBtn').onclick = addTable;
  document.getElementById('removeTableBtn').onclick = removeTable;

  renderTables();

  function updateClock() {
    document.getElementById('currentTime').textContent = new Date().toLocaleTimeString('vi-VN');
  }
  setInterval(updateClock, 1000);
  updateClock();
});