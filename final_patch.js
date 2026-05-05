<style id="ynea-fix-iphone-login-access-final">
/* Ajuste definitivo móvil: controles de semana/mes compactos y sin desbordes */
@media(max-width:900px){
  #semanaView .weekbar,
  #mensualView .weekbar{
    display:grid !important;
    grid-template-columns:0.78fr 1.1fr 0.72fr 0.82fr !important;
    gap:3px !important;
    align-items:end !important;
    width:100% !important;
    max-width:100% !important;
    overflow:hidden !important;
    margin:0 0 4px !important;
  }
  #semanaView .weekbar > *,
  #mensualView .weekbar > *{
    min-width:0 !important;
    max-width:100% !important;
    width:100% !important;
    box-sizing:border-box !important;
  }
  #semanaView .weekbar > div,
  #mensualView .weekbar > div{min-width:0 !important;}
  #semanaView .weekbar label,
  #mensualView .weekbar label{
    font-size:8px !important;
    line-height:1 !important;
    margin:0 0 1px !important;
    white-space:nowrap !important;
  }
  #semanaView .weekbar input,
  #semanaView .weekbar select,
  #mensualView .weekbar input,
  #mensualView .weekbar select{
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
    height:24px !important;
    min-height:24px !important;
    padding:2px 4px !important;
    font-size:10px !important;
    border-radius:7px !important;
    box-sizing:border-box !important;
  }
  #semanaView .weekbar button,
  #mensualView .weekbar button{
    width:100% !important;
    max-width:100% !important;
    min-width:0 !important;
    height:24px !important;
    min-height:24px !important;
    padding:2px 2px !important;
    font-size:9px !important;
    border-radius:7px !important;
    white-space:nowrap !important;
    overflow:hidden !important;
    text-overflow:clip !important;
  }
  #semanaView .weekbar > div:has(#weekProf),
  #semanaView .weekbar > div:has(#weekConsulta),
  #mensualView .weekbar > div:has(#monthProf){
    grid-column:1 / -1 !important;
  }
  #semanaView .weekbar > div:has(#weekProf),
  #semanaView .weekbar > div:has(#weekConsulta){
    margin-top:1px !important;
  }
  #mensualView .weekbar > div:has(#monthProf){margin-top:1px !important;}
  #semanaView .card,#mensualView .card{padding:5px !important;}
  #weekTitle,#monthTitle{font-size:8px !important;margin:1px 0 3px !important;white-space:normal !important;overflow:hidden !important;}
  #semanaView .weekbar + p.small + p.small{display:none !important;}
  #semanaView .tableWrap{overflow-x:hidden !important;}
  #weekTable{table-layout:fixed !important;width:100% !important;min-width:0 !important;}
}
</style>
<script id="ynea-fix-login-professionals-supabase-final">
(function(){
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function getData(){try{return data}catch(e){return null}}
  function persist(){try{save()}catch(e){try{localStorage.setItem('agendaClinicaSemanal',JSON.stringify(data))}catch(_){}}}
  function cleanUrl(url){return String(url||'').trim().replace(/\/+rest\/v1\/?$/,'').replace(/\/+$/,'');}
  function creds(){return {url:cleanUrl(localStorage.getItem('yneaSupabaseUrl')||''),key:String(localStorage.getItem('yneaSupabaseAnonKey')||'').trim()};}
  function pickName(row){return String(row?.nombre??row?.name??row?.titulo??row?.title??row?.descripcion??row?.label??'').trim();}
  function unique(arr){return [...new Set((arr||[]).map(x=>String(x||'').trim()).filter(Boolean))];}
  function active(row){return !(row?.activo===false||row?.active===false||row?.estado==='inactivo');}
  function accessObj(){const d=getData(); if(!d) return {}; if(!d.accesosProfesionales||typeof d.accesosProfesionales!=='object') d.accesosProfesionales={}; return d.accesosProfesionales;}
  function syncAccessWithProfessionals({allowBootstrap=false}={}){
    const d=getData(); if(!d) return {};
    const acc=accessObj();
    const profs=Array.isArray(d.profesionales)?d.profesionales:[];
    profs.forEach(p=>{ if(!acc[p]) acc[p]={codigo:'',rol:'usuario'}; if(!acc[p].rol) acc[p].rol='usuario'; });
    Object.keys(acc).forEach(p=>{ if(!profs.includes(p)) delete acc[p]; });
    const hasAdmin=profs.some(p=>acc[p]?.rol==='admin' && String(acc[p]?.codigo||'').trim());
    const configured=localStorage.getItem('yneaAccessConfigured')==='1';
    if(!hasAdmin && allowBootstrap && !configured && profs[0]){
      acc[profs[0]]={codigo:'1234',rol:'admin'};
    }
    if(configured && profs[0] && acc[profs[0]]?.codigo==='1234'){
      const otherAdmin=profs.some(p=>p!==profs[0] && acc[p]?.rol==='admin' && String(acc[p]?.codigo||'').trim());
      if(otherAdmin){ acc[profs[0]].codigo=''; acc[profs[0]].rol='usuario'; }
    }
    persist();
    return acc;
  }
  async function loadProfessionalsBeforeLogin(){
    const d=getData(); const c=creds();
    if(!d||!c.url||!c.key||!window.supabase||typeof window.supabase.createClient!=='function') return false;
    try{
      const sb=window.supabase.createClient(c.url,c.key);
      const [pRes,tRes,cRes]=await Promise.all([
        sb.from('profesionales').select('*'),
        sb.from('tipos_cita').select('*'),
        sb.from('consultas').select('*')
      ]);
      if(!pRes.error){ const ps=unique((pRes.data||[]).filter(active).map(pickName)); if(ps.length) d.profesionales=ps; }
      if(!tRes.error){ const ts=unique((tRes.data||[]).filter(active).map(pickName)); if(ts.length) d.tipos=ts; }
      if(!cRes.error){ const cs=unique((cRes.data||[]).filter(active).map(pickName)); if(cs.length) d.consultas=cs; }
      syncAccessWithProfessionals({allowBootstrap:true});
      persist();
      try{refreshAllSelects&&refreshAllSelects()}catch(e){}
      return true;
    }catch(e){ console.warn('No se pudieron cargar profesionales antes del login',e); return false; }
  }
  function rebuildLoginSelect(){
    const d=getData(); const sel=$('yneaLoginUser');
    if(!d||!sel) return;
    const acc=syncAccessWithProfessionals({allowBootstrap:true});
    const roleLabels={usuario:'Usuario profesional',recepcion:'Recepción',admin:'Administrador'};
    const profs=Array.isArray(d.profesionales)?d.profesionales:[];
    const old=sel.value;
    sel.innerHTML=profs.map(p=>`<option value="${esc(p)}">${esc(p)} · ${roleLabels[acc[p]?.rol||'usuario']}</option>`).join('');
    if(profs.includes(old)) sel.value=old;
  }
  // Si ya se ha configurado cualquier código/rol desde el panel, ya no se mantiene el acceso bootstrap 1234.
  const prevSet=window.yneaSetProfessionalAccess;
  window.yneaSetProfessionalAccess=function(prof,field,value){
    localStorage.setItem('yneaAccessConfigured','1');
    if(typeof prevSet==='function') prevSet.apply(this,arguments);
    syncAccessWithProfessionals({allowBootstrap:false});
    rebuildLoginSelect();
  };
  const prevLogout=window.yneaLogout;
  window.yneaLogout=function(){
    syncAccessWithProfessionals({allowBootstrap:false});
    if(typeof prevLogout==='function') return prevLogout.apply(this,arguments);
    sessionStorage.removeItem('yneaCurrentUser'); location.reload();
  };
  const prevCargar=window.cargarCatalogosSupabaseYnea;
  window.cargarCatalogosSupabaseYnea=async function(){
    const r=typeof prevCargar==='function'?await prevCargar.apply(this,arguments):undefined;
    syncAccessWithProfessionals({allowBootstrap:true});
    rebuildLoginSelect();
    return r;
  };
  async function refreshLoginFromSupabase(){
    if($('yneaLoginOverlay')){
      await loadProfessionalsBeforeLogin();
      rebuildLoginSelect();
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(refreshLoginFromSupabase,250);
    setTimeout(refreshLoginFromSupabase,1200);
    setTimeout(refreshLoginFromSupabase,3000);
  });
  window.yneaRebuildLoginFromProfessionals=refreshLoginFromSupabase;
})();
</script>
