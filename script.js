let customers = JSON.parse(localStorage.getItem("customers")) || [];
let deleteId = null;

const form = document.getElementById("form");
const list = document.getElementById("list");
const totalText = document.getElementById("total");
const search = document.getElementById("search");
const modal = document.getElementById("modal");

form.addEventListener("submit", e => {
  e.preventDefault();

  const nameInput = form.name.value.trim();
  const key = nameInput.toLowerCase(); // case-insensitive
  const amount = Number(form.amount.value);
  const type = form.type.value;
  const note = form.note.value.trim();

  let customer = customers.find(c => c.key === key);

  if (!customer) {
    customer = {
      id: Date.now(),
      key,
      name: nameInput,
      transactions: []
    };
    customers.push(customer);
  }

  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  customer.transactions.push({
    type,
    amount,
    note,
    date
  });

  save();
  form.reset();
  render();
});

function render(filter = "") {
  list.innerHTML = "";
  let totalBaki = 0;

  customers
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach((c, index) => {

      let balance = 0;
      let historyHTML = "";
      let noteHTML = "";

      c.transactions.forEach(t => {
        balance += t.type === "baki" ? t.amount : -t.amount;
      });

      [...c.transactions].reverse().forEach(t => {
        historyHTML += `
          <div class="${t.type}">
            ${t.date} - ${t.type === "baki" ? "Due" : "Payment"}: ৳${t.amount}
          </div>
        `;
        if (t.note) {
          noteHTML += `<div>${t.note}</div>`;
        }
      });

      totalBaki += balance;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${c.name}</td>
        <td>৳${balance}</td>
        <td class="history">${historyHTML}</td>
        <td class="history">${noteHTML || "-"}</td>
        <td>
          <span class="delete" onclick="openModal(${c.id})">Delete</span>
        </td>
      `;

      tr.onclick = () => form.name.value = c.name;
      list.appendChild(tr);
    });

  totalText.innerText = `Total Baki: ৳${totalBaki}`;
}

function openModal(id) {
  deleteId = id;
  modal.style.display = "flex";
}

document.getElementById("confirmDelete").onclick = () => {
  customers = customers.filter(c => c.id !== deleteId);
  save();
  modal.style.display = "none";
  render();
};

document.getElementById("cancelDelete").onclick = () => {
  modal.style.display = "none";
};

search.addEventListener("input", e => render(e.target.value));

function save() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

render();
