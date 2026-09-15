(() => {
  const $ = (id) => document.getElementById(id);

  // These endpoints are served beside this Admin page (backend/api/Admin/).
  const MENU_API = "./menu_items.php";
  const CATEGORY_API = "./categories.php";
  const UPLOAD_API = "./upload_image.php";
  const IMAGE_BASE = "../../uploads/";
  let categoriesFromApi = [];
  let menuLoading = false;

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(
        `Server returned an invalid response (${response.status}).`,
      );
    }
    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Request failed (${response.status}).`);
    }
    return result.data;
  }

  function imageUrl(filename) {
    if (!filename) return "";
    // Accept an already-complete URL for legacy records.
    return /^https?:\/\//i.test(filename) || filename.startsWith("data:")
      ? filename
      : IMAGE_BASE + encodeURIComponent(filename);
  }

  function normalizeMenuItem(row) {
    return {
      id: Number(row.menu_item_id),
      sku: `M${String(row.menu_item_id).padStart(3, "0")}`,
      name: row.product_name || "",
      cat: row.category_name || "Uncategorized",
      categoryId: Number(row.category_id),
      price: Number(row.price || 0),
      desc: row.description || "",
      image: row.image || "",
      available: Number(row.is_available) === 1 || row.is_available === true,
    };
  }

  async function loadMenuFromApi() {
    if (menuLoading) return;
    menuLoading = true;
    try {
      const [menuData, categoryData] = await Promise.all([
        apiRequest(MENU_API),
        apiRequest(CATEGORY_API),
      ]);
      items = (Array.isArray(menuData) ? menuData : []).map(normalizeMenuItem);
      categoriesFromApi = Array.isArray(categoryData) ? categoryData : [];
      cats = categoriesFromApi.map((c) => c.category_name).filter(Boolean);
      if (
        page === "Menu Items" ||
        page === "Categories" ||
        page === "Dashboard"
      )
        render();
    } catch (error) {
      console.error("Menu API load failed:", error);
      const content = $("content");
      if (content && page === "Menu Items") {
        const warning = document.createElement("p");
        warning.className = "sub";
        warning.textContent = `Could not load menu from PHP API: ${error.message}`;
        content.prepend(warning);
      }
    } finally {
      menuLoading = false;
    }
  }

  async function uploadMenuImage(file) {
    const data = new FormData();
    data.append("image", file);
    const result = await apiRequest(UPLOAD_API, { method: "POST", body: data });
    if (!result || !result.image)
      throw new Error("Image upload did not return a filename.");
    return result.image;
  }

  let role = "";
  let page = "Dashboard";
  let inventoryPage = 1;
  let menuPageNo = 1;
  let categoryPageNo = 1;
  let transactionPageNo = 1;
  let transactionPayFilter = "All";
  const PAGINATION_PAGE_SIZE = 6;
  const INVENTORY_PAGE_SIZE = PAGINATION_PAGE_SIZE;

  let items = [
    {
      sku: "M001",
      name: "Americano",
      cat: "Coffee",
      price: 109,
      desc: "Bold espresso with water",
      image: "",
      available: true,
    },
    {
      sku: "M002",
      name: "Hazelnut Americano",
      cat: "Coffee",
      price: 119,
      desc: "Americano with hazelnut",
      image: "",
      available: true,
    },
    {
      sku: "M003",
      name: "Latte",
      cat: "Coffee",
      price: 150,
      desc: "Espresso with steamed milk",
      image: "",
      available: true,
    },
    {
      sku: "M004",
      name: "Spanish Latte",
      cat: "Coffee",
      price: 159,
      desc: "Espresso, condensed milk",
      image: "",
      available: true,
    },
    {
      sku: "M005",
      name: "Salted Caramel",
      cat: "Non-Espresso",
      price: 129,
      desc: "Blended salted caramel",
      image: "",
      available: true,
    },
    {
      sku: "M006",
      name: "Mocha",
      cat: "Coffee",
      price: 129,
      desc: "Espresso with chocolate",
      image: "",
      available: true,
    },
  ];

  let cats = ["Coffee", "Non-Espresso", "Frappe", "Food", "Desserts"];

  let stockHistory = [];

  let stock = [
    {
      sku: "INV-001",
      name: "12oz Cups",
      cat: "Packaging",
      qty: 42,
      par: 20,
      unit: "pcs",
    },
    {
      sku: "INV-002",
      name: "16oz Cups",
      cat: "Packaging",
      qty: 18,
      par: 20,
      unit: "pcs",
    },
    {
      sku: "INV-003",
      name: "Cup Lids (hot)",
      cat: "Packaging",
      qty: 55,
      par: 15,
      unit: "pcs",
    },
    {
      sku: "INV-004",
      name: "Dome Lids (cold)",
      cat: "Packaging",
      qty: 8,
      par: 20,
      unit: "pcs",
    },
    {
      sku: "INV-005",
      name: "Espresso Beans",
      cat: "Ingredients",
      qty: 3,
      par: 5,
      unit: "bags",
    },
    {
      sku: "INV-006",
      name: "Whole Milk",
      cat: "Ingredients",
      qty: 12,
      par: 4,
      unit: "liters",
    },
  ];

  let tx = [
    {
      id: "TXN-5521",
      order: "ORD-0838",
      customer: "Reena Cruz",
      type: "Take-out",
      method: "GCash",
      amount: 280,
      date: "Sep 14, 2026",
      time: "10:12 AM",
    },
    {
      id: "TXN-5522",
      order: "ORD-0839",
      customer: "Mark Dizon",
      type: "Dine-in",
      method: "Cash",
      amount: 109,
      date: "Sep 14, 2026",
      time: "10:28 AM",
    },
    {
      id: "TXN-5523",
      order: "ORD-0840",
      customer: "Sofia Tan",
      type: "Dine-in",
      method: "GCash",
      amount: 467,
      date: "Sep 14, 2026",
      time: "10:41 AM",
    },
    {
      id: "TXN-5524",
      order: "ORD-0841",
      customer: "Juan dela Cruz",
      type: "Take-out",
      method: "GCash",
      amount: 280,
      date: "Sep 14, 2026",
      time: "10:47 AM",
    },
  ];

  const money = (n) => "₱" + Number(n).toLocaleString("en-PH");
  function escapeHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  }

  const admin = [
    "Dashboard",
    "Menu Items",
    "Categories",
    "Transactions",
    "Inventory",
    "Sales Reports",
  ];

  const staff = ["Order Queue", "Transactions"];

  const navIcons = {
    "Dashboard": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/><path d="M9 20v-6h6v6"/></svg>`,
    "Menu Items": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 15 9-9 4 4-9 9H3z"/><path d="m14 5 2-2 4 4-2 2"/><path d="m6 18 4-4"/></svg>`,
    "Categories": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M7 4h10v3H7z"/><path d="M8 11h8M8 15h5"/></svg>`,
    "Transactions": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M7 9h10M7 13h6M7 17h4"/></svg>`,
    "Inventory": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>`,
    "Sales Reports": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V10M12 20V4M19 20v-7"/><path d="M3 20h18"/></svg>`,
    "Order Queue": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h6"/></svg>`,
  };

  function nav() {
    const pages = role === "Administrator" ? admin : staff;

    $("sideNav").innerHTML = pages
      .map(
        (p) =>
          `<button class="${page === p ? "active" : ""}" data-page="${p}"><span class="nav-icon">${navIcons[p] || ""}</span><span class="nav-label">${p}</span></button>`,
      )
      .join("");

    $("tabs").innerHTML = `<div class="top-user"><span class="top-user-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.9-3.5 3.1-5.2 6.5-5.2s5.6 1.7 6.5 5.2"/></svg></span><span>Hello, ${role === "Administrator" ? "Admin" : "Staff"}</span></div>`;

    document.querySelectorAll("[data-page]").forEach((button) => {
      button.onclick = () => {
        page = button.dataset.page;
        if (page === "Inventory") inventoryPage = 1;
        if (page === "Menu Items") menuPageNo = 1;
        if (page === "Categories") categoryPageNo = 1;
        if (page === "Transactions") transactionPageNo = 1;
        render();
      };
    });
  }

  function table(headers, rows) {
    return `
      <div class="tablebox">
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="${headers.length}" class="empty">No records found.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function paginationMarkup(currentPage, totalPages, totalItems, noun, dataAttr) {
    const safeTotalPages = Math.max(1, totalPages);
    return `
      <div class="inventory-pagination shared-pagination">
        <div class="inventory-count">Showing ${totalItems ? ((currentPage - 1) * PAGINATION_PAGE_SIZE) + 1 : 0} to ${Math.min(currentPage * PAGINATION_PAGE_SIZE, totalItems)} of ${totalItems} ${noun}</div>
        <div class="pagination-controls">
          <button class="page-btn" ${dataAttr}="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>
          <button class="page-btn current" aria-current="page">${currentPage}</button>
          <button class="page-btn" ${dataAttr}="${Math.min(safeTotalPages, currentPage + 1)}" ${currentPage === safeTotalPages ? "disabled" : ""} aria-label="Next page">›</button>
        </div>
      </div>
    `;
  }

  function tableWithPagination(headers, rows, currentPage, totalItems, noun, dataAttr) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGINATION_PAGE_SIZE));
    return table(headers, rows) + paginationMarkup(currentPage, totalPages, totalItems, noun, dataAttr);
  }

  function pageHead(title, sub, button = "") {
    return `
      <div class="pagehead">
        <div>
          <h1>${title}</h1>
          <div class="sub">${sub}</div>
        </div>
        ${button}
      </div>
    `;
  }

  function inventory() {
    const low = stock.filter((item) => item.qty <= item.par).length;

    return (
      pageHead(
        "Inventory",
        `${low} items below par level · ${stock.length} total SKUs`,
        `<div class="inventory-head-actions"><button class="outline" id="stockHistoryBtn">Stock History</button><button class="primary" id="addStock">+ Add Item</button></div>`,
      ) +
      `
        <div class="toolbar">
          <input id="searchStock" placeholder="Search items...">
          <button class="outline filter active" data-filter="All">All</button>
          <button class="outline filter" data-filter="In Stock">In Stock</button>
          <button class="outline filter" data-filter="Low Stock">Low Stock</button>
          <button class="outline filter" data-filter="Out of Stock">Out of Stock</button>
        </div>
        <div id="stockForm"></div>
        <div id="stockTable">${stockTable(stock)}</div>
      `
    );
  }

  function stockTable(arr) {
    const total = arr.length;
    const totalPages = Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE));
    inventoryPage = Math.min(inventoryPage, totalPages);
    const startIndex = (inventoryPage - 1) * INVENTORY_PAGE_SIZE;
    const visible = arr.slice(startIndex, startIndex + INVENTORY_PAGE_SIZE);

    const rows = visible.map(
      (item) => `
        <tr>
          <td class="sku">${item.sku}</td>
          <td>${item.name}</td>
          <td>${item.cat}</td>
          <td>
            ${item.qty}
            <span class="qtybar">
              <i style="width:${Math.min(100, (item.qty / Math.max(item.par, 1)) * 100)}%"></i>
            </span>
          </td>
          <td class="new-stock-qty">${(() => { const latest = stockHistory.slice().reverse().find((entry) => entry.item === item.name && entry.action === "Received"); return latest ? latest.change.replace(/^\+/, "").replace(/\s+\S+$/, "") : "—"; })()}</td>
          <td class="sku">${item.par}</td>
          <td>${item.unit}</td>
          <td>
            <span class="status ${item.qty === 0 || item.qty <= item.par ? "low" : ""}">
              ${item.qty === 0 ? "Out of Stock" : item.qty <= item.par ? "Low Stock" : "In Stock"}
            </span>
          </td>
          <td>
            <div class="row-actions">
              <button class="outline" data-adjust="${item.sku}" data-delta="1">Receive</button>
              <button class="outline" data-adjust="${item.sku}" data-delta="-1">Use</button>
              <button class="outline" data-stock-adjust="${item.sku}">Adjust</button>
            </div>
          </td>
        </tr>
      `,
    ).join("");

    const empty = !rows
      ? `<tr><td colspan="9" class="empty">No records found.</td></tr>`
      : rows;

    return `
      <div class="tablebox inventory-tablebox">
        <table>
          <thead>
            <tr>
              ${["SKU","ITEM","CATEGORY","QTY","NEW STOCK","PAR LEVEL","UNIT","STATUS","ACTIONS"].map((header) => `<th>${header}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${empty}</tbody>
        </table>
        <div class="inventory-pagination">
          <div class="inventory-count">Showing ${total ? startIndex + 1 : 0} to ${Math.min(startIndex + INVENTORY_PAGE_SIZE, total)} of ${total} items</div>
          <div class="pagination-controls">
            <button class="page-btn" data-inventory-page="${Math.max(1, inventoryPage - 1)}" ${inventoryPage === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>
            <button class="page-btn current" aria-current="page">${inventoryPage}</button>
            <button class="page-btn" data-inventory-page="${Math.min(totalPages, inventoryPage + 1)}" ${inventoryPage === totalPages ? "disabled" : ""} aria-label="Next page">›</button>
          </div>
        </div>
      </div>
    `;
  }

  function menuPage() {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGINATION_PAGE_SIZE));
    menuPageNo = Math.min(menuPageNo, totalPages);
    const startIndex = (menuPageNo - 1) * PAGINATION_PAGE_SIZE;
    const visible = items.slice(startIndex, startIndex + PAGINATION_PAGE_SIZE);

    const rows = visible
      .map(
        (item) => `
          <tr>
            <td class="sku">${item.sku}</td>
            <td>
              ${
                item.image
                  ? `<img src="${imageUrl(item.image)}" alt="${item.name}" style="width:56px;height:56px;object-fit:cover;border-radius:8px">`
                  : "No image"
              }
            </td>
            <td>${item.name}</td>
            <td>${item.cat}</td>
            <td>${money(item.price)}</td>
            <td class="sub">${item.desc}</td>
            <td>
              <button
                class="toggle ${item.available ? "on" : ""}"
                data-toggle="${item.sku}"
                role="switch"
                aria-checked="${item.available}"
                aria-label="${item.name} availability"
              ><i></i></button>
            </td>
            <td>
              <div class="row-actions">
                <button class="outline" data-edit="${item.sku}">Edit</button>
                <button class="outline" data-remove="${item.sku}">Remove</button>
              </div>
            </td>
          </tr>
        `,
      )
      .join("");

    const content = tableWithPagination(
      ["ID","IMAGE","NAME","CATEGORY","PRICE","DESCRIPTION","AVAILABLE","ACTIONS"],
      rows,
      menuPageNo,
      total,
      "items",
      "data-menu-page",
    );

    return (
      pageHead(
        "Menu Items",
        `${items.length} items · ${items.filter((item) => !item.available).length} unavailable`,
        `<button class="primary" id="addMenu">+ Add Menu Item</button>`,
      ) +
      `<div id="menuForm"></div>${content}`
    );
  }

  function categories() {
    const total = cats.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGINATION_PAGE_SIZE));
    categoryPageNo = Math.min(categoryPageNo, totalPages);
    const startIndex = (categoryPageNo - 1) * PAGINATION_PAGE_SIZE;
    const visibleCats = cats.slice(startIndex, startIndex + PAGINATION_PAGE_SIZE);

    const categoryRows = visibleCats.length
      ? visibleCats.map((cat) => `
          <div class="category-row">
            <span>
              ${cat}
              <small class="sub">${items.filter((item) => item.cat === cat).length} items</small>
            </span>
            <button class="outline" data-catremove="${cat}">Remove</button>
          </div>
        `).join("")
      : `<div class="empty">No categories found.</div>`;

    return (
      pageHead("Product Categories", `${cats.length} categories`) +
      `
        <div class="category-layout">
          <div>
            <form class="toolbar" id="catForm">
              <input id="catInput" placeholder="New category name..." required>
              <button class="primary">Add</button>
            </form>

            <div class="category-list">
              ${categoryRows}
            </div>
            ${paginationMarkup(categoryPageNo, totalPages, total, "categories", "data-category-page")}
          </div>

          <div class="usage">
            <b style="font-size:11px;letter-spacing:1.5px">CATEGORY USAGE</b>
            ${cats
              .map(
                (cat) => `
              <div class="usage-row">
                ${cat}
                <span style="float:right">${items.filter((item) => item.cat === cat).length} items</span>
                <div class="track">
                  <i style="width:${items.length ? (items.filter((item) => item.cat === cat).length / items.length) * 100 : 0}%"></i>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `
    );
  }

  function transactions() {
    const filteredTx = transactionPayFilter === "All" ? tx : tx.filter((item) => item.method === transactionPayFilter);
    const total = tx.reduce((sum, item) => sum + item.amount, 0);

    return (
      pageHead("Transactions", `${tx.length} records · ${money(total)} total`) +
      `
        <div class="toolbar" style="justify-content:flex-end">
          <button class="outline filter ${transactionPayFilter === "All" ? "active" : ""}" data-pay="All">All</button>
          <button class="outline filter ${transactionPayFilter === "Cash" ? "active" : ""}" data-pay="Cash">Cash</button>
          <button class="outline filter ${transactionPayFilter === "GCash" ? "active" : ""}" data-pay="GCash">GCash</button>
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="label">TOTAL REVENUE</div>
            <strong>${money(total)}</strong>
          </div>
          <div class="metric">
            <div class="label">CASH SALES</div>
            <strong>${money(tx.filter((item) => item.method === "Cash").reduce((sum, item) => sum + item.amount, 0))}</strong>
          </div>
          <div class="metric">
            <div class="label">GCASH SALES</div>
            <strong>${money(tx.filter((item) => item.method === "GCash").reduce((sum, item) => sum + item.amount, 0))}</strong>
          </div>
        </div>

        <div id="txTable">${txTable(filteredTx)}</div>
      `
    );
  }

  function txTable(arr) {
    const total = arr.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGINATION_PAGE_SIZE));
    transactionPageNo = Math.min(transactionPageNo, totalPages);
    const startIndex = (transactionPageNo - 1) * PAGINATION_PAGE_SIZE;
    const visible = arr.slice(startIndex, startIndex + PAGINATION_PAGE_SIZE);
    const rows = visible
      .map(
        (item) => `
        <tr>
          <td class="sku">${item.id}</td>
          <td class="sku">${item.order}</td>
          <td>${item.customer}</td>
          <td>${item.type}</td>
          <td>${item.method}</td>
          <td>${money(item.amount)}</td>
          <td class="sku">${item.date}</td>
          <td class="sku">${item.time}</td>
        </tr>
      `,
      )
      .join("");

    return tableWithPagination(
      ["TXN ID","ORDER","CUSTOMER","TYPE","METHOD","AMOUNT","DATE","TIME"],
      rows,
      transactionPageNo,
      total,
      "records",
      "data-tx-page",
    );
  }

  function dashboard() {
    return (
      pageHead("Dashboard", "Today · Café Pepita") +
      `
        <div class="metrics">
          <div class="metric">
            <div class="label">ACTIVE ORDERS</div>
            <strong>6</strong>
          </div>
          <div class="metric">
            <div class="label">REVENUE TODAY</div>
            <strong>₱1,136</strong>
          </div>
          <div class="metric">
            <div class="label">LOW STOCK ALERTS</div>
            <strong>${stock.filter((item) => item.qty <= item.par).length}</strong>
          </div>
        </div>

        <div class="category-layout">
          <div class="metric">
            <b>ORDER QUEUE</b>
            <p>Pending · 4</p>
            <p>Preparing · 1</p>
            <p>Ready for Pickup · 1</p>
            <p>Completed · 0</p>
          </div>

          <div class="metric">
            <b>QUICK ACTIONS</b>
            <p><button class="outline" data-page="Inventory">→ Go to Inventory</button></p>
            <p><button class="outline" data-page="Menu Items">→ Manage Menu Items</button></p>
            <p><button class="outline" data-page="Transactions">→ View Transactions</button></p>
          </div>
        </div>
      `
    );
  }

  function reports() {
    return (
      pageHead("Sales Reports", "View sales performance by date range") +
      `
        <div class="toolbar">
          <label>From <input type="date" id="from"></label>
          <label>To <input type="date" id="to"></label>
          <button class="primary" id="generate">Generate</button>
          <button class="outline" id="csv">Export CSV</button>
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="label">TOTAL SALES</div>
            <strong>${money(tx.reduce((sum, item) => sum + item.amount, 0))}</strong>
          </div>
          <div class="metric">
            <div class="label">COMPLETED ORDERS</div>
            <strong>4</strong>
          </div>
          <div class="metric">
            <div class="label">PRODUCTS SOLD</div>
            <strong>12</strong>
          </div>
        </div>

        <div class="metric">
          <b>BEST-SELLING PRODUCTS</b>
          <p>Americano · 5 sold</p>
          <p>Spanish Latte · 4 sold</p>
          <p>Mocha · 3 sold</p>
        </div>
      `
    );
  }

  function render() {
    nav();

    $("topTitle").innerHTML =
      (role === "Administrator" ? "Admin Panel" : "Staff / Cashier") +
      ` <span>· Café Pepita</span>`;

    $("content").innerHTML =
      page === "Inventory"
        ? inventory()
        : page === "Menu Items"
          ? menuPage()
          : page === "Categories"
            ? categories()
            : page === "Transactions"
              ? transactions()
              : page === "Sales Reports"
                ? reports()
                : page === "Order Queue"
                  ? pageHead("Order Queue", "Manage customer orders") +
                    `<div class="metric">Order queue demo: Pending → Preparing → Ready for Pickup → Completed.</div>`
                  : dashboard();

    wire();
  }

  function showStockModal(title, body, onReady) {
    document.getElementById("stockActionModal")?.remove();
    const modal = document.createElement("div");
    modal.id = "stockActionModal";
    modal.className = "stock-modal-backdrop";
    modal.innerHTML = `
      <section class="stock-modal" role="dialog" aria-modal="true" aria-labelledby="stockModalTitle">
        <header class="stock-modal-header"><h2 id="stockModalTitle">${title}</h2><button type="button" class="stock-modal-close" aria-label="Close">×</button></header>
        <div class="stock-modal-body">${body}</div>
      </section>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector(".stock-modal-close").addEventListener("click", close);
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    onReady?.(modal, close);
  }

  function openStockHistory() {
    const recent = stockHistory.slice().reverse();
    const tableFor = (entries, emptyText) => {
      const rows = entries.length ? entries.map((entry) => `
        <tr><td>${entry.date}</td><td>${entry.item}</td><td><span class="stock-history-type">${entry.change}</span></td><td>${entry.before} → ${entry.after}</td><td>${entry.note || "—"}</td></tr>`).join("") : `<tr><td colspan="5" class="stock-empty">${emptyText}</td></tr>`;
      return `<div class="stock-history-table-wrap"><table class="stock-history-table"><thead><tr><th>Date & time</th><th>Item</th><th>Quantity</th><th>Balance</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };
    const received = recent.filter((entry) => entry.action === "Received");
    const used = recent.filter((entry) => entry.action === "Used");
    const adjustments = recent.filter((entry) => entry.action === "Adjustment");
    const sections = `
      <section class="stock-history-section"><h3>Stocked In <span>${received.length}</span></h3>${tableFor(received, "No stock-in transactions recorded yet.")}</section>
      <section class="stock-history-section"><h3>Used Stock <span>${used.length}</span></h3>${tableFor(used, "No stock usage recorded yet.")}</section>
      <section class="stock-history-section"><h3>Stock Adjustments <span>${adjustments.length}</span></h3>${tableFor(adjustments, "No stock adjustments recorded yet.")}</section>`;
    showStockModal("Stock History", `<p class="stock-modal-hint">Inventory activity grouped by stock movement.</p>${sections}`, null);
  }

  function openStockAdjust(item) {
    showStockModal("Stock Adjustment", `
      <p class="stock-modal-hint">Set the correct on-hand quantity for <strong>${item.name}</strong> (${item.sku}). Current quantity: <strong>${item.qty} ${item.unit}</strong>.</p>
      <form id="stockAdjustForm" class="stock-modal-form">
        <label>Actual quantity on hand <input name="quantity" type="number" min="0" step="any" value="${item.qty}" required></label>
        <label>Reason for adjustment <select name="reason" required><option value="">Choose a reason</option><option>Physical stock count</option><option>Damaged or expired</option><option>Data correction</option><option>Other</option></select></label>
        <label>Notes (optional) <textarea name="notes" rows="2" placeholder="Add details..."></textarea></label>
        <div class="stock-modal-actions"><button type="button" class="outline" data-stock-cancel>Cancel</button><button type="submit" class="primary">Save adjustment</button></div>
      </form>`, (modal, close) => {
        modal.querySelector("[data-stock-cancel]").addEventListener("click", close);
        modal.querySelector("#stockAdjustForm").addEventListener("submit", (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const next = Number(form.get("quantity"));
          if (!Number.isFinite(next) || next < 0) return;
          const before = item.qty;
          item.qty = next;
          stockHistory.push({ date: new Date().toLocaleString(), item: item.name, action: "Adjustment", change: `${next - before >= 0 ? "+" : ""}${next - before} ${item.unit}`, before: `${before} ${item.unit}`, after: `${next} ${item.unit}`, note: [form.get("reason"), form.get("notes")].filter(Boolean).join(" — ") });
          close();
          render();
          showStockModal("Stock updated", `<div class="stock-success-mark">✓</div><p><strong>${item.name}</strong> quantity updated to <strong>${next} ${item.unit}</strong>.</p><div class="stock-modal-actions"><button type="button" class="primary" data-stock-done>Done</button></div>`, (successModal, done) => successModal.querySelector("[data-stock-done]").addEventListener("click", done));
        });
      });
  }

  function wire() {
    $("stockHistoryBtn")?.addEventListener("click", openStockHistory);
    $("addStock")?.addEventListener("click", () => {
      $("stockForm").innerHTML = `
        <form id="newStock" class="toolbar">
          <input name="name" placeholder="Item name" required>
          <input name="cat" placeholder="Category" required>
          <input name="qty" type="number" min="0" placeholder="Quantity" required>
          <input name="par" type="number" min="0" placeholder="Par level" required>
          <input name="unit" placeholder="Unit (pcs, bags...)" required>
          <button class="primary">Save item</button>
        </form>
      `;

      $("newStock").onsubmit = (event) => {
        event.preventDefault();

        const form = new FormData(event.target);

        stock.push({
          sku: "INV-" + String(stock.length + 1).padStart(3, "0"),
          name: form.get("name"),
          cat: form.get("cat"),
          qty: Number(form.get("qty")),
          par: Number(form.get("par")),
          unit: form.get("unit"),
        });

        render();
      };
    });

    let filter = "All";

    function filterStock() {
      const query = ($("searchStock")?.value || "").toLowerCase();

      const filtered = stock
        .filter((item) =>
          (item.name + " " + item.cat + " " + item.sku)
            .toLowerCase()
            .includes(query),
        )
        .filter(
          (item) =>
            filter === "All" ||
            (filter === "Low Stock" && item.qty > 0 && item.qty <= item.par) ||
            (filter === "Out of Stock" && item.qty === 0) ||
            (filter === "In Stock" && item.qty > item.par),
        );

      inventoryPage = 1;
      $("stockTable").innerHTML = stockTable(filtered);
      wireStock();
    }

    $("searchStock")?.addEventListener("input", filterStock);

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.onclick = () => {
        filter = button.dataset.filter;

        document.querySelectorAll("[data-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
        });

        filterStock();
      };
    });

    wireStock();

    function wireStock() {
      document.querySelectorAll("[data-stock-adjust]").forEach((button) => {
        button.onclick = () => { const item = stock.find((entry) => entry.sku === button.dataset.stockAdjust); if (item) openStockAdjust(item); };
      });
      document.querySelectorAll("[data-inventory-page]").forEach((button) => {
        button.onclick = () => {
          const nextPage = Number(button.dataset.inventoryPage);
          if (!Number.isFinite(nextPage)) return;
          inventoryPage = Math.max(1, nextPage);
          const query = ($("searchStock")?.value || "").toLowerCase();
          const filtered = stock
            .filter((item) => (item.name + " " + item.cat + " " + item.sku).toLowerCase().includes(query));
          // Re-apply the currently selected filter without changing its state.
          const activeFilter = document.querySelector(".filter.active")?.dataset.filter || "All";
          const finalFiltered = filtered.filter((item) =>
            activeFilter === "All" ||
            (activeFilter === "Low Stock" && item.qty > 0 && item.qty <= item.par) ||
            (activeFilter === "Out of Stock" && item.qty === 0) ||
            (activeFilter === "In Stock" && item.qty > item.par)
          );
          $("stockTable").innerHTML = stockTable(finalFiltered);
          wireStock();
        };
      });

      document.querySelectorAll("[data-adjust]").forEach((button) => {
        button.onclick = () => {
          const item = stock.find(
            (stockItem) => stockItem.sku === button.dataset.adjust,
          );

          const delta = Number(button.dataset.delta);
          showStockModal(delta === 1 ? "Receive Stock" : "Use Stock", `
            <p class="stock-modal-hint"><strong>${item.name}</strong> · Current: ${item.qty} ${item.unit}</p>
            <form id="stockMovementForm" class="stock-modal-form">
              <label>Quantity to ${delta === 1 ? "receive" : "use"} <input name="quantity" type="number" min="0.01" step="any" value="1" required></label>
              <label>Notes (optional) <textarea name="notes" rows="2" placeholder="Add a note..."></textarea></label>
              <div class="stock-modal-actions"><button type="button" class="outline" data-stock-cancel>Cancel</button><button type="submit" class="primary">Confirm ${delta === 1 ? "receive" : "use"}</button></div>
            </form>`, (modal, close) => {
              modal.querySelector("[data-stock-cancel]").addEventListener("click", close);
              modal.querySelector("#stockMovementForm").addEventListener("submit", (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const quantity = Number(form.get("quantity"));
                if (!Number.isFinite(quantity) || quantity <= 0 || (delta < 0 && quantity > item.qty)) {
                  modal.querySelector("[name=quantity]").setCustomValidity("Enter a valid quantity within the available stock.");
                  modal.querySelector("[name=quantity]").reportValidity();
                  return;
                }
                const before = item.qty;
                item.qty += delta * quantity;
                stockHistory.push({ date: new Date().toLocaleString(), item: item.name, action: delta === 1 ? "Received" : "Used", change: `${delta > 0 ? "+" : "−"}${quantity} ${item.unit}`, before: `${before} ${item.unit}`, after: `${item.qty} ${item.unit}`, note: form.get("notes") || "—" });
                close();
                render();
                showStockModal("Stock updated", `<div class="stock-success-mark">✓</div><p>${quantity} ${item.unit} ${delta === 1 ? "received into" : "used from"} <strong>${item.name}</strong>.</p><div class="stock-modal-actions"><button type="button" class="primary" data-stock-done>Done</button></div>`, (successModal, done) => successModal.querySelector("[data-stock-done]").addEventListener("click", done));
              });
            });
        };
      });
    }

    // Add and edit use a full inline form (no browser prompt dialogs).
    const openMenuForm = (item = null) => {
      const editing = Boolean(item);
      const categoryOptions = categoriesFromApi.length
        ? categoriesFromApi
            .map(
              (c) =>
                `<option value="${Number(c.category_id)}" ${Number(c.category_id) === Number(item?.categoryId) ? "selected" : ""}>${c.category_name}</option>`,
            )
            .join("")
        : cats
            .map((cat, i) => `<option value="${i + 1}">${cat}</option>`)
            .join("");
      $("menuForm").innerHTML = `
        <form id="menuItemForm" class="toolbar" enctype="multipart/form-data">
          <input name="name" placeholder="Product name" value="${editing ? escapeHtml(item.name) : ""}" required>
          <select name="category_id" required>${categoryOptions}</select>
          <input name="price" type="number" min="0" step=".01" placeholder="Price" value="${editing ? Number(item.price) : ""}" required>
          <input name="description" placeholder="Description" value="${editing ? escapeHtml(item.desc) : ""}">
          <label class="sub">Product image
            <input id="menuImage" name="image" type="file" accept="image/jpeg,image/png,image/webp">
          </label>
          <div class="menu-image-preview-wrap">
            <img id="menuImagePreview" alt="Product image preview" src="${editing && item.image ? imageUrl(item.image) : ""}" style="${editing && item.image ? "" : "display:none;"}width:100px;height:100px;object-fit:cover;border-radius:8px">
            <small class="sub">${editing ? "Choose a new image only if you want to replace the current one." : "Choose a JPG, PNG, or WEBP image (max 5 MB)."}</small>
          </div>
          <label class="sub"><input name="is_available" type="checkbox" ${!editing || item.available ? "checked" : ""}> Available for ordering</label>
          <button class="primary" type="submit">${editing ? "Save Changes" : "Add Menu Item"}</button>
          <button class="outline" type="button" id="cancelMenu">Cancel</button>
          <p id="menuFormMessage" class="sub" role="status"></p>
        </form>`;

      const formEl = $("menuItemForm");
      const imageInput = $("menuImage");
      const preview = $("menuImagePreview");
      imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) {
          preview.src = editing && item.image ? imageUrl(item.image) : "";
          preview.style.display = preview.src ? "block" : "none";
          return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          alert("Please choose a JPG, PNG, or WEBP image.");
          imageInput.value = "";
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert("Image must be 5 MB or smaller.");
          imageInput.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          preview.src = reader.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      });
      $("cancelMenu").addEventListener("click", () => {
        $("menuForm").innerHTML = "";
      });
      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = formEl.querySelector('button[type="submit"]');
        const message = $("menuFormMessage");
        submit.disabled = true;
        message.textContent = "Saving...";
        try {
          const form = new FormData(formEl);
          let image = editing ? item.image : null;
          const file = imageInput.files[0];
          if (file) image = await uploadMenuImage(file);
          const payload = {
            category_id: Number(form.get("category_id")),
            product_name: String(form.get("name")).trim(),
            description: String(form.get("description") || "").trim(),
            price: Number(form.get("price")),
            image,
            is_available: formEl.elements.is_available.checked ? 1 : 0,
          };
          if (
            !payload.product_name ||
            !Number.isFinite(payload.price) ||
            payload.price < 0 ||
            !payload.category_id
          ) {
            throw new Error("Please enter a valid name, category, and price.");
          }
          if (editing) {
            payload.menu_item_id = item.id;
            await apiRequest(MENU_API, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } else {
            await apiRequest(MENU_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }
          $("menuForm").innerHTML = "";
          menuPageNo = 1;
          await loadMenuFromApi();
          render();
        } catch (error) {
          message.textContent = `Could not save: ${error.message}`;
          submit.disabled = false;
        }
      });
    };

    $("addMenu")?.addEventListener("click", () => openMenuForm());

    document.querySelectorAll("[data-toggle]").forEach((button) => {
      button.onclick = async () => {
        const item = items.find((row) => row.sku === button.dataset.toggle);
        if (!item) return;
        try {
          await apiRequest(MENU_API, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              menu_item_id: item.id,
              is_available: item.available ? 0 : 1,
            }),
          });
          await loadMenuFromApi();
          render();
        } catch (error) {
          alert(`Could not update availability: ${error.message}`);
        }
      };
    });

    document.querySelectorAll("[data-remove]").forEach((button) => {
      button.onclick = async () => {
        const item = items.find((row) => row.sku === button.dataset.remove);
        if (!item || !confirm(`Remove ${item.name} from the menu?`)) return;
        try {
          await apiRequest(
            `${MENU_API}?menu_item_id=${encodeURIComponent(item.id)}`,
            { method: "DELETE" },
          );
          await loadMenuFromApi();
          render();
        } catch (error) {
          alert(`Could not remove item: ${error.message}`);
        }
      };
    });

    document.querySelectorAll("[data-edit]").forEach((button) => {
      button.onclick = () => {
        const item = items.find((row) => row.sku === button.dataset.edit);
        if (item) openMenuForm(item);
      };
    });

    $("catForm")?.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = $("catInput").value.trim();

      if (name && !cats.includes(name)) {
        cats.push(name);
        categoryPageNo = 1;
        render();
      }
    });

    document.querySelectorAll("[data-catremove]").forEach((button) => {
      button.onclick = () => {
        if (items.some((item) => item.cat === button.dataset.catremove)) {
          alert("Reassign or remove products in this category first.");
          return;
        }

        cats = cats.filter((cat) => cat !== button.dataset.catremove);
        categoryPageNo = 1;
        render();
      };
    });

    document.querySelectorAll("[data-pay]").forEach((button) => {
      button.onclick = () => {
        transactionPayFilter = button.dataset.pay;
        transactionPageNo = 1;
        render();
      };
    });

    document.querySelectorAll("[data-menu-page]").forEach((button) => {
      button.onclick = () => {
        const nextPage = Number(button.dataset.menuPage);
        if (!Number.isFinite(nextPage)) return;
        menuPageNo = Math.max(1, nextPage);
        render();
      };
    });

    document.querySelectorAll("[data-category-page]").forEach((button) => {
      button.onclick = () => {
        const nextPage = Number(button.dataset.categoryPage);
        if (!Number.isFinite(nextPage)) return;
        categoryPageNo = Math.max(1, nextPage);
        render();
      };
    });

    document.querySelectorAll("[data-tx-page]").forEach((button) => {
      button.onclick = () => {
        const nextPage = Number(button.dataset.txPage);
        if (!Number.isFinite(nextPage)) return;
        transactionPageNo = Math.max(1, nextPage);
        render();
      };
    });

    $("generate")?.addEventListener("click", () => {
      if ($("from").value && $("to").value && $("from").value > $("to").value) {
        alert("From date must be before To date.");
      } else {
        alert(
          "Date range selected. Sample transactions are shown in this prototype.",
        );
      }
    });

    $("csv")?.addEventListener("click", () => {
      const csv = [
        ["TXN ID", "Order", "Customer", "Method", "Amount"],
        ...tx.map((item) => [
          item.id,
          item.order,
          item.customer,
          item.method,
          item.amount,
        ]),
      ]
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n");

      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "cafe-pepita-sales.csv";
      a.click();

      URL.revokeObjectURL(a.href);
    });
  }

  async function restoreSession() {
    try {
      const data = await apiRequest("./auth.php", {
        method: "GET",
        credentials: "same-origin",
      });

      role = data.role === "admin" ? "Administrator" : "Staff";
      $("login").classList.add("hidden");
      $("app").classList.remove("hidden");
      page = role === "Administrator" ? "Dashboard" : "Order Queue";
      render();
      if (role === "Administrator") loadMenuFromApi();
    } catch {
      // No active session: keep the login screen visible.
    }
  }

  $("loginForm").onsubmit = async (event) => {
    event.preventDefault();

    const username = $("user").value.trim();
    const password = $("pass").value;
    const err = $("err");
    err.textContent = "Signing in…";

    try {
      const data = await apiRequest("./auth.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      role = data.role === "admin" ? "Administrator" : "Staff";
      err.textContent = "";
      $("login").classList.add("hidden");
      $("app").classList.remove("hidden");
      page = role === "Administrator" ? "Dashboard" : "Order Queue";
      render();
      if (role === "Administrator") loadMenuFromApi();
    } catch (error) {
      err.textContent = error.message || "Invalid login details.";
    }
  };

  $("logout").onclick = async () => {
    try {
      await apiRequest("./auth.php", {
        method: "DELETE",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      role = "";
      page = "Dashboard";
      $("app").classList.add("hidden");
      $("login").classList.remove("hidden");
      $("pass").value = "";
      $("err").textContent = "";
    }
  };

  restoreSession();
})();
