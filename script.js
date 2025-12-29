let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentCustomer = null;

const listPage = document.getElementById("page-list");
const detailPage = document.getElementById("page-detail");
const customerList = document.getElementById("customerList");
const historyBox = document.getElementById("history");

/* FORMAT DATE */
function formatDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

/* ADD CUSTOMER */
document.getElementById("addCustomerForm").onsubmit = e => {
  e.preventDefault();

  const name = customerName.value.trim();
  if (!name) return;

  const key = name.toLowerCase();
  const exists = customers.find(c => c.key === key);
  if (exists) {
    alert("Customer already exists");
    return;
  }

  customers.push({
    id: Date.now(),
    name,
    key,
    transactions: []
  });

  save();
  e.target.reset();
  renderList();
};

/* RENDER CUSTOMER LIST + GRAND TOTAL */
function renderList(filter = "") {
  customerList.innerHTML = "";
  let grandTotal = 0;

  customers
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((c, i) => {
      const balance = c.transactions.reduce((s, t) => t.type==="baki"?s+t.amount:s-t.amount,0);
      grandTotal += balance;

      const row = document.createElement("div");
      row.className = "customer-row";
      row.innerHTML = `<span>${i+1}. ${c.name}</span><span class="balance">৳ ${balance}</span>`;
      row.onclick = () => openCustomer(c.id);
      customerList.appendChild(row);
    });

  document.getElementById("grandTotal").innerText = `Total Due: ৳ ${grandTotal}`;
}

document.getElementById("search").oninput = e => renderList(e.target.value);

/* OPEN CUSTOMER DETAILS PAGE */
function openCustomer(id) {
  currentCustomer = customers.find(c => c.id === id);
  listPage.style.display = "none";
  detailPage.style.display = "block";
  renderDetail();
}

/* RENDER CUSTOMER DETAILS */
function renderDetail() {
  let balance = 0;
  historyBox.innerHTML = "";

  currentCustomer.transactions.forEach(t => {
    balance += t.type==="baki"?t.amount:-t.amount;
  });

  detailName.innerText = currentCustomer.name;
  detailBalance.innerText = `Total Due: ৳ ${balance}`;

  [...currentCustomer.transactions].reverse().forEach(t => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="${t.type}">${t.date} - ${t.type==="baki"?"Due":"Payment"}: ৳${t.amount}</div>
      ${t.note?`<small>${t.note}</small>`:""}
    `;
    historyBox.appendChild(div);
  });
}

/* ADD TRANSACTION */
detailForm.onsubmit = e => {
  e.preventDefault();

  currentCustomer.transactions.push({
    amount: Number(amount.value),
    type: type.value,
    note: note.value.trim(),
    date: formatDate()
  });

  save();
  e.target.reset();
  renderDetail();
};

/* NAVIGATION */
function goBack() {
  detailPage.style.display = "none";
  listPage.style.display = "block";
  renderList();
}

/* DELETE CUSTOMER */
function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

confirmDelete.onclick = () => {
  customers = customers.filter(c => c.id !== currentCustomer.id);
  save();
  closeModal();
  goBack();
};

/* LOCALSTORAGE SAVE */
function save() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

/* INITIAL RENDER */
renderList();
