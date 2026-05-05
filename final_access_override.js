
<!-- ===== YNEA OVERRIDE FINAL: profesionales reales para acceso y panel ===== -->
<style id="ynea-final-prof-access-override-css">
#yneaAccessPanelOverride .ynea-access-row{display:grid;grid-template-columns:1fr 150px 190px;gap:8px;align-items:center;border:1px solid #e5e7eb;border-radius:12px;padding:8px;margin-top:8px;background:#fff;}
#yneaAccessPanelOverride input,#yneaAccessPanelOverride select{width:100%;}
.ynea-login-card .ynea-login-syncbox{border:1px solid #f3cfe0;background:#fff7fb;border-radius:14px;padding:12px;margin:12px 0;}
.ynea-login-card .ynea-login-syncbox input,.ynea-login-card .ynea-login-syncbox textarea{width:100%;font-size:13px;padding:8px;margin:5px 0 8px;border:1px solid #dbe3ee;border-radius:10px;}
.ynea-login-card .ynea-login-syncbox button{width:100%;padding:9px 10px;min-height:36px;font-size:13px;}
@media(max-width:900px){#yneaAccessPanelOverride .ynea-access-row{grid-template-columns:1fr}.ynea-login-card{max-height:92vh;overflow:auto}}
</style>
<script id="ynea-final-prof-access-override-js">
(function(){
  const URL_KEY='yneaSupabaseUrl';
  const API_KEY='yneaSupabaseAnonKey';
  const ACCESS_CONFIGURED='yneaAccessConfigured';
  const DISABLED_BOOT='yneaDefault1234Disabled';
  const DEFAULT_URL='https://vadohvwjoxghubceffpn.supabase.co';
  const ROLE_LABELS={usuario:'Usuario profesional',recepcion:'Recepción',admin:'Administrador'};
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const cleanUrl=u=>String(u||'').trim().replace(/\/rest\/v1\/?$/,'').replace(/\/+$/,'');
  const cleanKey=k=>String(k||'').replace(/\s+/g,'').trim();
  function getData(){try{return data}catch(e){return null}}
  function saveData(){try{save()}catch(e){try{localStorage.setItem('agendaClinicaSemanal',JSON.stringify(getData()))}catch(_){}}}
  function getCreds(){
    const url=cleanUrl($('loginSupabaseUrl')?.value || $('supabaseUrlInput')?.value || localStorage.getItem(URL_KEY) || DEFAULT_URL);
    const key=cleanKey($('loginSupabaseKey')?.value || $('supabaseKeyInput')?.value || localStorage.getItem(API_KEY) || '');
    return {url,key};
  }
  function setCreds(url,key){
    url=cleanUrl(url); key=cleanKey(key);
    if(url) localStorage.setItem(URL_KEY,url);
    if(key) localStorage.setItem(API_KEY,key);
    ['supabaseUrlInput','loginSupabaseUrl'].forEach(id=>{if($(id)) $(id).value=url;});
    ['supabaseKeyInput','loginSupabaseKey'].forEach(id=>{if($(id)) $(id).value=key;});
  }
  function pickName(row){return String(row?.nombre??row?.name??row?.titulo??row?.title??row?.descripcion??row?.label??'').trim();}
  function active(row){return !(row?.activo===false||row?.active===false||String(row?.estado||'').toLowerCase()==='inactivo');}
  function unique(arr){return [...new Set((arr||[]).map(x=>String(x||'').trim()).filter(Boolean))];}
  async function fetchTable(table){
    const {url,key}=getCreds();
    if(!url||!key) throw new Error('Faltan URL o clave de Supabase.');
    const r=await fetch(url+'/rest/v1/'+table+'?select=*',{headers:{apikey:key,Authorization:'Bearer '+key}});
    if(!r.ok) throw new Error(table+': HTTP '+r.status+' '+(await r.text()).slice(0,220));
    return await r.json();
  }
  function ensureAccess(){
    const d=getData(); if(!d) return {};
    if(!Array.isArray(d.profesionales)) d.profesionales=[];
    if(!d.accesosProfesionales||typeof d.accesosProfesionales!=='object') d.accesosProfesionales={};
    const a=d.accesosProfesionales;
    d.profesionales.forEach(p=>{if(!a[p]) a[p]={codigo:'',rol:'usuario'}; if(!a[p].rol) a[p].rol='usuario';});
    Object.keys(a).forEach(p=>{if(!d.profesionales.includes(p)) delete a[p];});
    const configured=localStorage.getItem(ACCESS_CONFIGURED)==='1'||localStorage.getItem(DISABLED_BOOT)==='1';
    if(configured){d.profesionales.forEach(p=>{if(String(a[p]?.codigo||'')==='1234') a[p].codigo='';});}
    const hasAnyCode=d.profesionales.some(p=>String(a[p]?.codigo||'').trim());
    if(!hasAnyCode && !configured && d.profesionales[0]) a[d.profesionales[0]]={codigo:'1234',rol:'admin'};
    return a;
  }
  function refreshAllSelectsLocal(){
    const d=getData(); if(!d) return;
    const ps=d.profesionales||[];
    function fill(id, first=''){
      const el=$(id); if(!el) return; const old=el.value;
      el.innerHTML=first+ps.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
      if([...el.options].some(o=>o.value===old)) el.value=old;
    }
    fill('weekProf','<option value="">Todos</option>');
    fill('monthProf','<option value="">Todos</option>');
    fill('filtroProf','<option value="">Todos</option>');
    fill('avisosProfesional','<option value="">Todos</option>');
    fill('bloqProfesionalNuevo','<option value="todos">Todos los profesionales</option>');
    fill('profesionalCita'); fill('editCitaProfesional'); fill('enlaceProfesional'); fill('enlazadaProfesional');
    try{if(typeof refreshAllSelects==='function') refreshAllSelects();}catch(_){ }
  }
  async function cargarProfesionalesReales(statusEl){
    const d=getData(); if(!d) return false;
    try{
      const rows=await fetchTable('profesionales');
      const names=unique((rows||[]).filter(active).map(pickName));
      if(!names.length) throw new Error('Supabase responde, pero la tabla profesionales no devuelve nombres activos.');
      d.profesionales=names;
      ensureAccess();
      saveData();
      refreshAllSelectsLocal();
      renderAccessPanel();
      refreshLogin();
      if(statusEl) statusEl.textContent='Profesionales cargados: '+names.length;
      return true;
    }catch(e){
      console.warn('Ynea profesionales Supabase:',e);
      if(statusEl) statusEl.textContent='Error cargando profesionales: '+e.message;
      return false;
    }
  }
  function renderAccessPanel(){
    const d=getData(); if(!d) return;
    const cfg=$('configView'); if(!cfg) return;
    let card=$('yneaAccessPanelOverride');
    if(!card){card=document.createElement('div'); card.id='yneaAccessPanelOverride'; card.className='card'; cfg.insertBefore(card,cfg.firstChild);} 
    const a=ensureAccess(); const ps=d.profesionales||[];
    card.innerHTML=`<h2>Accesos de profesionales</h2><p class="small">Los accesos se crean sobre los profesionales existentes. Profesional normal: solo su calendario. Recepción/Administrador: todos los calendarios.</p><div id="yneaAccessRowsOverride"></div><div style="margin-top:12px"><button type="button" class="secondary" id="yneaReloadProfessionalsOverride">Recargar profesionales desde Supabase</button></div>`;
    const rows=$('yneaAccessRowsOverride');
    rows.innerHTML=ps.length?ps.map(p=>{const r=a[p]||{codigo:'',rol:'usuario'};return `<div class="ynea-access-row"><b>${esc(p)}</b><input placeholder="Código" value="${esc(r.codigo||'')}" data-ynea-prof="${esc(p)}" data-ynea-field="codigo"><select data-ynea-prof="${esc(p)}" data-ynea-field="rol"><option value="usuario" ${r.rol==='usuario'?'selected':''}>Usuario profesional</option><option value="recepcion" ${r.rol==='recepcion'?'selected':''}>Recepción</option><option value="admin" ${r.rol==='admin'?'selected':''}>Administrador</option></select></div>`}).join(''):'<p class="small">No hay profesionales cargados. Pulsa “Recargar profesionales desde Supabase”.</p>';
    $('yneaReloadProfessionalsOverride').onclick=()=>cargarProfesionalesReales();
    // Ocultar paneles antiguos para evitar datos desfasados
    ['yneaUsuariosPanel','yneaAccessPanelFinal'].forEach(id=>{const el=$(id); if(el&&el!==card) el.style.display='none';});
  }
  function refreshLogin(){
    const d=getData(); if(!d) return;
    const sel=$('yneaLoginUser'); if(!sel) return;
    const a=ensureAccess(); const old=sel.value;
    sel.innerHTML=(d.profesionales||[]).map(p=>`<option value="${esc(p)}">${esc(p)} · ${ROLE_LABELS[a[p]?.rol||'usuario']}</option>`).join('');
    if([...sel.options].some(o=>o.value===old)) sel.value=old;
  }
  function injectSyncBox(){
    const card=document.querySelector('#yneaLoginOverlay .ynea-login-card'); if(!card) return;
    card.querySelectorAll('p.small').forEach(p=>{if((p.textContent||'').includes('primer profesional')||(p.textContent||'').includes('Primer acceso')) p.remove();});
    let box=$('yneaLoginSupabaseBox');
    const {url,key}=getCreds();
    if(!box){
      box=document.createElement('div'); box.id='yneaLoginSupabaseBox'; box.className='ynea-login-syncbox';
      box.innerHTML=`<b>Cargar profesionales</b><input id="loginSupabaseUrl" placeholder="https://xxxx.supabase.co"><textarea id="loginSupabaseKey" placeholder="Publishable / anon key" style="min-height:68px"></textarea><button type="button" id="loginSupabaseLoadBtn">Guardar y cargar profesionales</button><p class="small" id="loginSupabaseStatus" style="margin-top:6px"></p>`;
      const btn=$('yneaLoginBtn')||card.querySelector('button'); card.insertBefore(box,btn||card.lastChild);
    }
    if($('loginSupabaseUrl')) $('loginSupabaseUrl').value=url||DEFAULT_URL;
    if($('loginSupabaseKey')) $('loginSupabaseKey').value=key||'';
    const load=$('loginSupabaseLoadBtn');
    if(load) load.onclick=async()=>{setCreds($('loginSupabaseUrl').value,$('loginSupabaseKey').value); await cargarProfesionalesReales($('loginSupabaseStatus'));};
  }
  function loginHandler(e){
    if(!e.target||e.target.id!=='yneaLoginBtn') return;
    const sel=$('yneaLoginUser'), codeEl=$('yneaLoginCode'); if(!sel||!codeEl) return;
    const d=getData(); if(!d) return;
    const a=ensureAccess(); const prof=sel.value; const code=String(codeEl.value||'').trim();
    if(!prof || !a[prof] || String(a[prof].codigo||'')!==code){
      e.preventDefault(); e.stopImmediatePropagation();
      const er=$('yneaLoginError'); if(er){er.textContent='Profesional o código incorrecto.'; er.style.display='block';}
      return;
    }
    e.preventDefault(); e.stopImmediatePropagation();
    sessionStorage.setItem('yneaCurrentUser',JSON.stringify({nombre:prof,rol:a[prof].rol||'usuario'}));
    $('yneaLoginOverlay')?.remove();
    try{if(typeof setView==='function') setView('semana');}catch(_){ }
  }
  document.addEventListener('change',e=>{
    const el=e.target; if(!el||!el.matches||!el.matches('[data-ynea-prof][data-ynea-field]')) return;
    localStorage.setItem(ACCESS_CONFIGURED,'1'); localStorage.setItem(DISABLED_BOOT,'1');
    const a=ensureAccess(); const p=el.getAttribute('data-ynea-prof'); const f=el.getAttribute('data-ynea-field');
    if(!a[p]) a[p]={codigo:'',rol:'usuario'}; a[p][f]=String(el.value||'').trim();
    saveData(); refreshLogin();
  },true);
  document.addEventListener('click',loginHandler,true);
  function tick(){
    refreshLogin(); injectSyncBox(); renderAccessPanel();
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    const d=getData(); if(d){ensureAccess(); renderAccessPanel(); refreshLogin(); injectSyncBox();}
    // Si hay credenciales guardadas, recargar siempre desde Supabase al entrar.
    const {key}=getCreds(); if(key) await cargarProfesionalesReales();
    setInterval(tick,1500);
  });
  // Si el usuario crea/elimina/renombra profesionales en PC, el panel se reconstruye al momento.
  ['addItem','removeItem','renameItemDirect','guardarProfesionalEditado'].forEach(fn=>{
    const old=window[fn]; if(typeof old==='function') window[fn]=function(){const r=old.apply(this,arguments); setTimeout(()=>{ensureAccess(); renderAccessPanel(); refreshLogin(); refreshAllSelectsLocal();},80); return r;};
  });
  window.yneaForceLoadProfessionals=cargarProfesionalesReales;
})();
</script>
