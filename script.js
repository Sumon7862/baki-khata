let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentCustomer = null;
let editingTransaction = null;

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
  if (customers.find(c=>c.key===key)) { alert("Customer already exists"); return; }

  customers.push({id:Date.now(), name, key, transactions:[]});
  save();
  e.target.reset();
  renderList();
};

/* RENDER CUSTOMER LIST + GRAND TOTAL */
function renderList(filter=""){
  customerList.innerHTML = "";
  let grandTotal = 0;
  customers.filter(c=>c.name.toLowerCase().includes(filter.toLowerCase())).forEach((c,i)=>{
    const balance = c.transactions.reduce((s,t)=>t.type==="baki"?s+t.amount:s-t.amount,0);
    grandTotal+=balance;

    const row = document.createElement("div");
    row.className="customer-row";
    row.innerHTML = `
      <span>${i+1}. ${c.name} - ${balance} Taka</span>
      <span class="del-customer" onclick="deleteCustomer(event,${c.id})">🗑️</span>
    `;
    row.onclick = ()=>openCustomer(c.id);
    customerList.appendChild(row);
  });
  document.getElementById("grandTotal").innerText=`Total Due: ${grandTotal} Taka`;
}
document.getElementById("search").oninput=e=>renderList(e.target.value);

/* DELETE CUSTOMER 1st page */
function deleteCustomer(e,id){
  e.stopPropagation();
  if(confirm("Delete this customer?")){
    customers = customers.filter(c=>c.id!==id);
    save();
    renderList();
  }
}

/* OPEN CUSTOMER DETAILS PAGE */
function openCustomer(id){
  currentCustomer = customers.find(c=>c.id===id);
  editingTransaction=null;
  listPage.style.display="none";
  detailPage.style.display="block";
  renderDetail();
}

/* RENDER CUSTOMER DETAILS */
function renderDetail(){
  let balance = 0;
  currentCustomer.transactions.forEach(t => balance += t.type==="baki"?t.amount:-t.amount);
  detailName.innerText = currentCustomer.name;
  detailBalance.innerText=`Total Due: ${balance} Taka`;

  // If total due is 0, clear all transactions
  if(balance === 0 && currentCustomer.transactions.length > 0){
    currentCustomer.transactions = [];
    save();
  }

  historyBox.innerHTML=""; 
  [...currentCustomer.transactions].reverse().forEach((t, revIndex) => {
    const index = currentCustomer.transactions.length - 1 - revIndex;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td class="${t.type}">${t.type==="baki"?"Due":"Payment"}</td>
      <td>${t.amount} Tk</td>
      <td>${t.note || "-"}</td>
      <td class="tx-btn edit" onclick="editTransaction(event,${index})">✏️</td>
      <td class="tx-btn delete" onclick="deleteTransaction(event,${index})">🗑️</td>
    `;
    historyBox.appendChild(row);
  });

  renderList(); // Update 1st page balances
}

/* ADD / EDIT TRANSACTION */
detailForm.onsubmit = e=>{
  e.preventDefault();
  const tx = {
    amount:Number(amount.value),
    type:type.value,
    note:note.value.trim(),
    date:formatDate()
  };

  if(editingTransaction!==null){
    currentCustomer.transactions[editingTransaction]=tx;
    editingTransaction=null;
  } else {
    currentCustomer.transactions.push(tx);
  }

  detailForm.reset();
  save();
  renderDetail();
}

/* EDIT TRANSACTION */
function editTransaction(e,index){
  e.stopPropagation();
  editingTransaction=index;
  const t=currentCustomer.transactions[index];
  amount.value=t.amount;
  type.value=t.type;
  note.value=t.note;
}

/* DELETE TRANSACTION */
function deleteTransaction(e,index){
  e.stopPropagation();
  if(confirm("Delete this entry?")){
    currentCustomer.transactions.splice(index,1);
    save();
    renderDetail();
  }
}

/* NAVIGATION */
function goBack(){
  detailPage.style.display="none";
  listPage.style.display="block";
  renderList();
}

/* LOCALSTORAGE SAVE */
function save(){ localStorage.setItem("customers",JSON.stringify(customers)) }

/* INITIAL RENDER */
renderList();
