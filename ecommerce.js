/* Yuiop Optik - modul e-commerce (Supabase). Dimuat SETELAH script utama. */
(()=>{
const SB=supabase.createClient("https://bmoupdwjcoxcchlhscxx.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtb3VwZHdqY294Y2NobGhzY3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTM1NTcsImV4cCI6MjEwNzcyOTU1N30.pV9TB634nFEjcoz1ZRgeX57X0IUMF9W-BczhbrTrIG8");
const st=document.createElement("style");
st.textContent=".xf{display:grid;gap:1rem;max-width:30rem;margin-top:1.5rem}.xf label{display:grid;gap:.3rem;font-size:.85rem;font-weight:600;color:var(--hd)}.xf input,.xf textarea,.xf select{font:inherit;font-weight:400;width:100%;padding:.6rem .8rem;border:1px solid var(--line);border-radius:12px;background:var(--bg2);color:var(--tx)}";
document.head.appendChild(st);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ST={menunggu_pembayaran:"Menunggu pembayaran",menunggu_verifikasi:"Menunggu verifikasi",dibayar:"Dibayar",diproses:"Diproses",dikirim:"Dikirim",selesai:"Selesai",dibatalkan:"Dibatalkan"};
const H=(t,s)=>`<h1 class="pt">${t}</h1><p class="sub">${s||""}</p>`;
let user=null,role="customer",nama="";
const cart=()=>{try{return JSON.parse(localStorage.getItem("cart")||"[]")}catch(_){return[]}};
const save=c=>{try{localStorage.setItem("cart",JSON.stringify(c))}catch(_){}nav()};
const go2=h=>{if(location.hash==h)route();else location.hash=h};
const normWa=s=>{let n=String(s||"").replace(/\D/g,"");if(n.startsWith("0"))n="62"+n.slice(1);else if(n.startsWith("8"))n="62"+n;return n};

async function me(){
  const {data:{session}}=await SB.auth.getSession();user=session?.user||null;role="customer";nama="";
  if(user){const {data}=await SB.from("profiles").select("nama,role").eq("id",user.id).single();if(data){role=data.role;nama=data.nama||""}}
  nav()}
function nav(){
  if(!$("#nk"))$("#menu .btn").insertAdjacentHTML("beforebegin",'<a href="#/keranjang" id="nk"></a><a href="#/akun" id="na"></a><a href="#/admin" id="nad" hidden>Admin</a>');
  $("#nk").textContent="Keranjang ("+cart().reduce((a,x)=>a+x.jumlah,0)+")";
  $("#na").textContent=user?"Akun":"Masuk";$("#nad").hidden=role!="admin"}

function pMasuk(mode){
  const d=mode=="daftar";
  app.innerHTML=H(d?"Daftar Akun":"Masuk","Akun diperlukan untuk checkout dan melihat riwayat pesanan.")+`<form id="af" class="xf"><label ${d?"":"hidden"}>Nama<input name="nama" ${d?"required":""}></label><label>Email<input type="email" name="email" required autocomplete="email"></label><label>Password<input type="password" name="pw" minlength="6" required autocomplete="${d?"new-password":"current-password"}"></label><p class="meta" id="am" style="margin:0"></p><button class="btn b-ac">${d?"Daftar":"Masuk"}</button><button type="button" class="btn b-ln" data-a="mode" data-m="${d?"masuk":"daftar"}">${d?"Sudah punya akun? Masuk":"Belum punya akun? Daftar"}</button></form>`;
  $("#af").onsubmit=async e=>{
    e.preventDefault();const f=new FormData(e.target),m=$("#am");m.textContent="Memproses...";
    const r=d?await SB.auth.signUp({email:f.get("email"),password:f.get("pw"),options:{data:{nama:(f.get("nama")||"").trim()}}}):await SB.auth.signInWithPassword({email:f.get("email"),password:f.get("pw")});
    if(r.error){m.textContent=r.error.message;return}
    if(!r.data.session){m.textContent="Cek email Anda untuk konfirmasi, lalu masuk.";return}
    await me();go2(cart().length?"#/keranjang":"#/akun")}}

function addCart(s){const c=cart(),x=c.find(i=>i.slug==s);if(x)x.jumlah=Math.min(99,x.jumlah+1);else c.push({slug:s,jumlah:1});save(c)}

function pKeranjang(){
  const c=cart().map(x=>({...x,p:P.find(p=>p.slug==x.slug)})).filter(x=>x.p);
  if(!c.length){app.innerHTML=H("Keranjang")+'<p>Keranjang masih kosong.</p><a class="btn b-ac" href="#/produk">Lihat produk</a>';return}
  const tot=c.reduce((a,x)=>a+x.p.harga*x.jumlah,0);
  const items=c.map(x=>`<div class="tag" style="margin-bottom:.75rem;flex-direction:row;align-items:center;justify-content:space-between"><div><b>${esc(x.p.nama)}</b><br><span class="meta">${rp(x.p.harga)}</span></div><div class="row" style="align-items:center"><input type="number" min="1" max="99" value="${x.jumlah}" data-q="${x.slug}" style="width:4.5rem;padding:.4rem;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--tx)"><button class="btn b-ln" data-a="rm" data-s="${x.slug}">Hapus</button></div></div>`).join("");
  const form=user?`<form id="cf" class="xf" style="margin-top:0"><h3>Data pengiriman</h3><label>Nama<input name="nama" required value="${esc(nama)}"></label><label>Usia<input type="number" name="usia" min="1" max="120" required></label><label>Nomor WhatsApp<input type="tel" name="wa" required inputmode="tel" autocomplete="tel" placeholder="08123456789" pattern="[0-9+ -]{9,16}"></label><label>Alamat<textarea name="alamat" rows="3" required></textarea></label><p class="meta" style="margin:0">Untuk lensa atau frame berlensa resep, biaya akhir dapat berbeda dan akan dikonfirmasi tim kami.</p><button class="btn b-ac">Buat pesanan</button></form>`:`<div class="tag"><h3>Login untuk checkout</h3><span class="meta">Masuk atau daftar dulu agar pesanan tercatat di akun Anda.</span><a class="btn b-ac" href="#/masuk">Masuk / Daftar</a></div>`;
  app.innerHTML=H("Keranjang","Periksa pesanan Anda sebelum checkout.")+`<div class="g2" style="align-items:start"><div>${items}<div class="price">Total: ${rp(tot)}</div></div>${form}</div>`;
  const cf=$("#cf");if(cf)cf.onsubmit=async e=>{
    e.preventDefault();const f=new FormData(cf),b=cf.querySelector("button");b.disabled=true;
    const {data,error}=await SB.rpc("buat_pesanan",{p_nama:f.get("nama").trim(),p_usia:+f.get("usia"),p_alamat:f.get("alamat").trim(),p_items:cart().map(x=>({slug:x.slug,jumlah:x.jumlah}))});
        if(error){alert(error.message);b.disabled=false;return}
    const w=await SB.rpc("simpan_wa",{p_order:data,p_wa:normWa(f.get("wa"))});
    if(w.error)console.warn(w.error.message);
    save([]);pPay(data)}}
async function pPay(id){
  const {data:o,error}=await SB.from("orders").select("*").eq("id",id).single();
  if(error||!o){app.innerHTML=H("Pesanan tidak ditemukan");return}
  app.innerHTML=H("Pembayaran Pesanan #"+o.id,"Total: <b>"+rp(o.total)+"</b>")+`<div class="xf">${img(BAYAR.qris,"QRIS Yuiop Optik","","style=\"max-width:16rem;background:#fff;border-radius:12px\"")}<p class="meta" style="margin:0">Scan QRIS (nominal ${rp(o.total)}) atau transfer ke:</p>${BAYAR.bank.map(x=>`<div class="tag"><b>${esc(x.b)} ${esc(x.no)}</b><span class="meta">a.n. ${esc(x.an)}</span></div>`).join("")}<label>Upload bukti pembayaran<input type="file" id="bf" accept="image/*"></label><button class="btn b-wa" id="bs">Kirim bukti pembayaran</button><a class="btn b-ln" href="#/akun">Bayar nanti</a></div>`;
  $("#bs").onclick=async()=>{
    const f=$("#bf").files[0];if(!f)return alert("Pilih foto bukti pembayaran dulu.");
    const ext=(f.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
    const path=`${user.id}/${o.id}-${Date.now()}.${ext}`;
    $("#bs").disabled=true;$("#bs").textContent="Mengunggah...";
    const u=await SB.storage.from("bukti-bayar").upload(path,f,{contentType:f.type});
    if(u.error){alert(u.error.message);$("#bs").disabled=false;return}
    const r=await SB.rpc("kirim_bukti",{p_order:o.id,p_path:path});
    if(r.error){alert(r.error.message);$("#bs").disabled=false;return}
    alert("Bukti terkirim. Admin akan memverifikasi pembayaran Anda.");go2("#/akun")}}

const oc=(o,adm,url)=>`<div class="tag" style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem"><b>Pesanan #${o.id}</b><span class="k">${ST[o.status]||o.status}</span></div><span class="meta">${new Date(o.created_at).toLocaleString("id-ID")}</span>${adm?`<span class="meta">${esc(o.nama)} · usia ${esc(o.usia)} · ${esc(o.alamat)}${o.wa?` · <a href="https://wa.me/${esc(o.wa)}" target="_blank" rel="noopener noreferrer" style="color:var(--ac);text-decoration:underline">WA ${esc(o.wa)}</a>`:""}</span>`:""}<div>${(o.order_items||[]).map(i=>`${esc(i.nama_produk)} × ${i.jumlah}`).join("<br>")}</div><div class="price" style="font-size:1.1rem">${rp(o.total)}</div>${adm?`<div class="row" style="align-items:center"><select data-st="${o.id}" style="padding:.4rem;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--tx)">${Object.entries(ST).map(([k,l])=>`<option value="${k}"${k==o.status?" selected":""}>${l}</option>`).join("")}</select>${url?`<a class="btn b-ln" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Lihat bukti</a>`:""}</div>`:(o.status=="menunggu_pembayaran"?`<button class="btn b-wa" data-a="pay" data-o="${o.id}">Bayar / upload bukti</button>`:"")}</div>`;

async function pAkun(){
  if(!user)return pMasuk();
  const {data:os}=await SB.from("orders").select("*,order_items(*)").order("id",{ascending:false});
  app.innerHTML=H("Akun Saya",esc(user.email))+`<div class="row" style="margin-bottom:1.5rem"><button class="btn b-ln" data-a="out">Keluar</button></div><h2 style="margin-bottom:1rem">Riwayat Pesanan</h2>`+(os&&os.length?os.map(o=>oc(o)).join(""):"<p>Belum ada pesanan.</p>")}

async function pAdmin(){
  if(role!="admin"){app.innerHTML=H("Akses ditolak","Halaman ini khusus admin.");return}
  const {data:os,error}=await SB.from("orders").select("*,order_items(*)").order("id",{ascending:false});
  if(error){app.innerHTML=H("Admin",esc(error.message));return}
  const paths=os.filter(o=>o.bukti_bayar).map(o=>o.bukti_bayar),m={};
  if(paths.length){const {data}=await SB.storage.from("bukti-bayar").createSignedUrls(paths,3600);(data||[]).forEach(x=>m[x.path]=x.signedUrl)}
  app.innerHTML=H("Admin: Pesanan Masuk",os.length+" pesanan")+(os.length?os.map(o=>oc(o,true,m[o.bukti_bayar])).join(""):"<p>Belum ada pesanan.</p>")}

async function route(){
  const h=location.hash.replace(/^#\/?/,"").split("/"),R={masuk:pMasuk,keranjang:pKeranjang,akun:pAkun,admin:pAdmin};
  if(R[h[0]]){document.title=h[0][0].toUpperCase()+h[0].slice(1)+" | Yuiop Optik";await R[h[0]]();window.scrollTo(0,0)}
  else if(h[0]=="produk"&&h[1]){const b=$(".wf");if(b){b.textContent="+ Tambah ke Keranjang";b.removeAttribute("href");b.removeAttribute("target")}}}

document.addEventListener("click",e=>{
  const w=e.target.closest(".wf");
  if(w){e.preventDefault();e.stopImmediatePropagation();addCart(location.hash.split("/")[2]);w.textContent="Ditambahkan ✓";setTimeout(()=>{w.textContent="+ Tambah ke Keranjang"},1200)}},true);
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a=="mode")pMasuk(b.dataset.m);
  if(a=="rm"){save(cart().filter(x=>x.slug!=b.dataset.s));pKeranjang()}
  if(a=="out"){await SB.auth.signOut();user=null;role="customer";nav();go2("#/")}
  if(a=="pay")pPay(+b.dataset.o)});
document.addEventListener("change",async e=>{
  const q=e.target.dataset.q,s=e.target.dataset.st;
  if(q){const c=cart(),x=c.find(i=>i.slug==q);if(x){x.jumlah=Math.max(1,Math.min(99,+e.target.value||1));save(c);pKeranjang()}}
  if(s){const r=await SB.rpc("admin_set_status",{p_order:+s,p_status:e.target.value});if(r.error)alert(r.error.message);else pAdmin()}});
addEventListener("hashchange",route);
me().then(route);
})();
