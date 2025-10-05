/* script.js
 - PRODUCTS: edit names/prices/images to match your real products
 - Cart stored at localStorage key: nova_cart_v1
 - EmailJS: replace SERVICE_ID, TEMPLATE_ID, USER_ID with your EmailJS values
*/

const PRODUCTS = [
  { id:1, title:"Athletic Runner", price:59.99, category:"men", images:["men.jpg"], desc:"Lightweight breathable runner."},
  { id:2, title:"Everyday Loafer", price:49.99, category:"women", images:["wonem shoe.jpg"], desc:"Casual loafers for daily use."},
  { id:3, title:"School Shoe", price:39.99, category:"kids", images:["school shoe.jpg"], desc:"Durable and comfortable for kids."},
  { id:4, title:"Street Sneakers", price:69.99, category:"women", images:["women.jpg"], desc:"Stylish sneakers for city life."},
  { id:5, title:"Classic Oxford", price:79.99, category:"men", images:["Formal shoe.jpg"], desc:"Premium leather formal shoe."}
];

const CART_KEY = "nova_cart_v1";

/* --- cart helpers --- */
function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCartCount(); }

/* add to cart by product id */
function addToCart(id, qty=1){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  const cart = getCart();
  const it = cart.find(i=>i.id===id);
  if(it) it.qty += qty; else cart.push({ id, qty });
  saveCart(cart);
  toast(`${p.title} added to cart`);
}

/* remove */
function removeFromCart(id){
  const cart = getCart().filter(i=>i.id!==id);
  saveCart(cart);
  renderCart(); renderCartPage();
}

/* update qty */
function updateQty(id, qty){
  const cart = getCart();
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty = Number(qty);
  if(it.qty <= 0) removeFromCart(id);
  else { saveCart(cart); renderCart(); renderCartPage(); }
}

/* toast */
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',right:'18px',bottom:'18px',background:'var(--primary)',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:2000});
  document.body.appendChild(t); setTimeout(()=>t.remove(),1400);
}

/* render cart count in header */
function renderCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('.cart-count').forEach(e=>e.textContent = count);
}

/* render products into a grid (targetId) */
function renderProductsGrid(targetId, items){
  const container = document.getElementById(targetId); if(!container) return;
  container.innerHTML = items.map(p=>`
    <div class="card">
      <img src="${p.images[0]}" alt="${p.title}">
      <div class="card-body">
        <h3>${p.title}</h3>
        <div class="small">${p.category}</div>
        <div class="price">$${p.price.toFixed(2)}</div>
        <p class="small" style="margin-top:8px">${p.desc}</p>
        <div class="actions">
          <button class="btn" onclick="addToCart(${p.id})">Add to cart</button>
          <a class="btn-ghost" href="product.html?id=${p.id}">View</a>
        </div>
      </div>
    </div>
  `).join('');
  renderCartCount();
}

/* cart drawer display */
function renderCart(){
  const wrap = document.getElementById('cart-drawer'); if(!wrap) return;
  const cart = getCart();
  if(cart.length === 0){
    wrap.innerHTML = `<div class="info"><p class="small">Your cart is empty.</p><a href="products.html" class="btn">Shop products</a></div>`;
    return;
  }
  let total = 0; let html = '<div style="display:grid;gap:12px">';
  cart.forEach(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id);
    const line = p.price * i.qty; total += line;
    html += `<div style="display:flex;gap:12px;align-items:center">
      <img src="${p.images[0]}" style="width:80px;height:60px;object-fit:cover;border-radius:8px">
      <div style="flex:1"><strong>${p.title}</strong><div class="small">$${p.price} × ${i.qty} = $${line.toFixed(2)}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn-ghost" onclick="removeFromCart(${p.id})">Remove</button>
      </div>
    </div>`;
  });
  html += `</div><div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center"><strong>Total: $${total.toFixed(2)}</strong><a href="cart.html" class="btn">Go to Cart</a></div>`;
  wrap.innerHTML = html;
}

/* cart page renderer */
function renderCartPage(){
  const wrap = document.getElementById('cart-list'); if(!wrap) return;
  const cart = getCart();
  if(cart.length === 0){
    wrap.innerHTML = `<p>Your cart is empty. <a href="products.html">Start shopping</a></p>`;
    document.getElementById('cart-actions') && (document.getElementById('cart-actions').innerHTML = '');
    return;
  }
  let html = '<div style="display:grid;gap:12px">'; let total = 0;
  cart.forEach(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id);
    const line = p.price * i.qty; total += line;
    html += `<div style="display:flex;gap:12px;align-items:center;background:var(--card);padding:12px;border-radius:8px">
      <img src="${p.images[0]}" style="width:100px;height:80px;object-fit:cover;border-radius:6px">
      <div style="flex:1">
        <strong>${p.title}</strong>
        <div class="small">$${p.price} × ${i.qty} = $${line.toFixed(2)}</div>
        <div style="margin-top:8px"><label>Qty: <input type="number" value="${i.qty}" min="1" style="width:70px" onchange="updateQty(${p.id}, this.value)"></label></div>
      </div>
      <div><button class="btn-ghost" onclick="removeFromCart(${p.id})">Remove</button></div>
    </div>`;
  });
  html += `</div><div style="margin-top:14px"><strong>Total: $${total.toFixed(2)}</strong></div>`;
  wrap.innerHTML = html;
  document.getElementById('cart-actions') && (document.getElementById('cart-actions').innerHTML = `<a href="checkout.html" class="btn">Proceed to Checkout</a>`);
}

/* checkout summary */
function renderCheckoutSummary(){
  const wrap = document.getElementById('checkout-summary'); if(!wrap) return;
  const cart = getCart(); if(cart.length === 0){ wrap.innerHTML = "<p>Your cart is empty.</p>"; return; }
  let html = ""; let total = 0;
  cart.forEach(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id); total += p.price * i.qty;
    html += `<div style="display:flex;justify-content:space-between"><div>${p.title} × ${i.qty}</div><div>$${(p.price * i.qty).toFixed(2)}</div></div>`;
  });
  html += `<hr><div style="display:flex;justify-content:space-between"><strong>Total</strong><strong>$${total.toFixed(2)}</strong></div>`;
  wrap.innerHTML = html;
}

/* cart overlay open/close */
function openCart(){ document.getElementById('cart-overlay').style.display = 'flex'; renderCart(); }
function closeCart(){ document.getElementById('cart-overlay').style.display = 'none'; }

/* --- EmailJS integration (Contact + Checkout) ---
   Steps for you:
   1. Create account at https://www.emailjs.com/
   2. Add an Email Service (e.g., Gmail)
   3. Create an Email Template with fields you want (e.g., name, email, message)
   4. Copy SERVICE_ID, TEMPLATE_ID, USER_ID (or PUBLIC_KEY) and paste below
*/
const EMAILJS_SERVICE = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_CONTACT = "YOUR_TEMPLATE_ID_CONTACT";
const EMAILJS_TEMPLATE_ORDER = "YOUR_TEMPLATE_ID_ORDER";
const EMAILJS_USER = "YOUR_USER_ID_OR_PUBLIC_KEY";

/* helper: send contact form via EmailJS */
function sendContactForm(e){
  e.preventDefault();
  const form = e.target;
  const data = {
    from_name: form.name.value,
    from_email: form.email.value,
    message: form.message.value
  };
  if (typeof emailjs === "undefined"){
    alert("EmailJS not loaded. Replace placeholders or include EmailJS SDK.");
    form.reset();
    return;
  }
  emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_CONTACT, data, EMAILJS_USER)
    .then(()=>{ alert("Message sent — thank you!"); form.reset(); })
    .catch(err=>{ console.error(err); alert("Failed to send message. Check console for details."); });
}

/* helper: send order details via EmailJS (checkout) */
function sendOrderEmail(formData){
  if (typeof emailjs === "undefined"){
    alert("EmailJS not loaded. Replace placeholders or include EmailJS SDK.");
    return Promise.resolve();
  }
  return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_ORDER, formData, EMAILJS_USER);
}

/* init on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', ()=>{
  renderCartCount();
  const grid = document.getElementById('products-grid'); if(grid) renderProductsGrid('products-grid', PRODUCTS);

  const search = document.getElementById('site-search');
  if(search) search.addEventListener('input', e=>{ const q = e.target.value.toLowerCase(); renderProductsGrid('products-grid', PRODUCTS.filter(p=>p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))); });

  document.getElementById('open-cart')?.addEventListener('click', openCart);
  document.getElementById('close-cart')?.addEventListener('click', closeCart);

  /* product page rendering */
  const prodTitle = document.getElementById('prod-title');
  if(prodTitle){
    const params = new URLSearchParams(window.location.search); const id = Number(params.get('id'));
    const prod = PRODUCTS.find(p=>p.id === id);
    if(!prod){ document.getElementById('product-page').innerHTML = `<p>Product not found. <button class="back-btn" onclick="history.back()">Back</button></p>`; }
    else {
      document.getElementById('prod-title').textContent = prod.title;
      document.getElementById('prod-img').src = prod.images[0];
      document.getElementById('prod-desc').textContent = prod.desc;
      document.getElementById('prod-price').textContent = '$' + prod.price.toFixed(2);
      document.getElementById('prod-add')?.addEventListener('click', ()=> addToCart(prod.id));
    }
  }

  /* pages: cart & checkout */
  renderCartPage();
  renderCheckoutSummary();

  /* wire contact form if present */
  const contactForm = document.getElementById('contact-form');
  if(contactForm) contactForm.addEventListener('submit', sendContactForm);

  /* checkout form handling */
  const checkoutForm = document.getElementById('checkout-form');
  if(checkoutForm){
    checkoutForm.addEventListener('submit', function(e){
      e.preventDefault();
      // collect form values and cart summary
      const cart = getCart(); if(!cart.length){ alert('Cart is empty'); return; }
      let orderItems = cart.map(i => {
        const p = PRODUCTS.find(x=>x.id===i.id); return `${p.title} x ${i.qty}`;
      }).join(', ');
      const total = cart.reduce((s,i)=>s + PRODUCTS.find(p=>p.id===i.id).price * i.qty, 0);
      const formData = {
        customer_name: this.name.value,
        customer_email: this.email.value,
        address: this.address.value,
        payment_method: this.payment.value,
        order_items: orderItems,
        order_total: '$' + total.toFixed(2)
      };
      // send via EmailJS (if configured), then clear cart and redirect
      sendOrderEmail(formData).then(()=>{ localStorage.removeItem(CART_KEY); renderCartCount(); alert('Order sent — thanks!'); location.href='index.html'; }).catch(err=>{
        console.error(err);
        // still simulate success
        localStorage.removeItem(CART_KEY); renderCartCount(); alert('Order placed (simulation).'); location.href='index.html';
      });
    });
  }
});
