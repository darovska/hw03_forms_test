const state={data:null,category:"Все",priority:"all",selected:null,view:"current"};
const colors={"Недвижимость":"#2b6cb0","ВНЖ и миграция":"#805ad5","Туризм":"#2f855a","Регулирование":"#b7791f","Инвестиции":"#c05621"};
const pLabel={high:"Высокий",medium:"Средний",low:"Низкий"};
const sLabel={growing:"Растет",stable:"Стабилен",weakening:"Ослабевает"};

async function init(){
  const r=await fetch("./data/trends.json",{cache:"no-store"});
  if(!r.ok) throw new Error("data");
  state.data=await r.json();
  const d=state.data;
  document.querySelector("#period").textContent=d.meta.period;
  document.querySelector("#updatedAt").textContent="Обновлено: "+d.meta.updatedAt;
  document.querySelector("#footerUpdate").textContent="Обновлено: "+d.meta.updatedAt;
  document.querySelector("#trendCount").textContent=d.trends.length;
  document.querySelector("#highCount").textContent=d.trends.filter(function(x){return x.priority==="high"}).length;
  document.querySelector("#clusterCount").textContent=d.seoClusters.length;
  document.querySelector("#reportLink").href=d.meta.reportUrl;
  document.querySelectorAll(".view-tab").forEach(function(btn){btn.addEventListener("click",function(){switchView(btn.dataset.view)})});
  renderFilters();
  document.querySelector("#priorityFilter").addEventListener("change",function(e){state.priority=e.target.value;renderAll()});
  renderSeo();
  renderHistory();
  renderSources();
  renderSeoSignals();
  renderAll();
}

function switchView(view){
  state.view=view;
  document.querySelector("#currentView").hidden=view!=="current";
  document.querySelector("#historyView").hidden=view!=="history";
  document.querySelector("#sourcesView").hidden=view!=="sources";
  document.querySelector("#seoView").hidden=view!=="seo";
  document.querySelectorAll(".view-tab").forEach(function(btn){btn.classList.toggle("is-active",btn.dataset.view===view)});
}

function renderFilters(){
  const w=document.querySelector("#categoryFilters");
  w.innerHTML="";
  state.data.categories.forEach(function(c){
    const b=document.createElement("button");
    b.type="button";
    b.className="chip"+(state.category===c?" is-active":"");
    b.textContent=c;
    b.onclick=function(){state.category=c;renderFilters();renderAll()};
    w.appendChild(b);
  });
}

function visible(){
  return state.data.trends.filter(function(t){
    return (state.category==="Все"||t.category===state.category)&&(state.priority==="all"||t.priority===state.priority);
  });
}

function renderAll(){
  const items=visible();
  document.querySelector("#visibleCount").textContent=items.length+" из "+state.data.trends.length;
  renderRadar(items);
  renderCards(items);
  renderWork(items);
}

function svg(n,a){
  a=a||{};
  const e=document.createElementNS("http://www.w3.org/2000/svg",n);
  Object.entries(a).forEach(function(pair){e.setAttribute(pair[0],pair[1])});
  return e;
}

function renderRadar(items){
  const s=document.querySelector("#radar");
  s.innerHTML="";
  const W=1000,H=620,m={l:80,r:40,t:40,b:72},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const x=function(v){return m.l+v/100*iw};
  const y=function(v){return m.t+(100-v)/100*ih};
  const rr=function(v){return 12+v/100*18};

  s.appendChild(svg("rect",{x:x(70),y:y(100),width:x(100)-x(70),height:y(70)-y(100),fill:"#eef7f4"}));
  s.appendChild(svg("rect",{x:x(70),y:y(70),width:x(100)-x(70),height:y(0)-y(70),fill:"#f8faf9"}));

  [0,20,40,60,80,100].forEach(function(v){
    s.appendChild(svg("line",{x1:x(v),x2:x(v),y1:y(0),y2:y(100),class:"grid-line"}));
    s.appendChild(svg("line",{x1:x(0),x2:x(100),y1:y(v),y2:y(v),class:"grid-line"}));
    const tx=svg("text",{x:x(v),y:H-42,"text-anchor":"middle",class:"axis-label"});tx.textContent=v;s.appendChild(tx);
    const ty=svg("text",{x:52,y:y(v)+4,"text-anchor":"end",class:"axis-label"});ty.textContent=v;s.appendChild(ty);
  });

  [["Наблюдать",x(38),y(92)],["Брать в работу",x(83),y(56)],["Приоритет недели",x(83),y(92)]].forEach(function(row){
    const q=svg("text",{x:row[1],y:row[2],"text-anchor":"middle",class:"quad-label"});q.textContent=row[0];s.appendChild(q);
  });

  const xl=svg("text",{x:m.l+iw/2,y:H-10,"text-anchor":"middle",class:"axis-label"});xl.textContent="Редакционный потенциал →";s.appendChild(xl);
  const yl=svg("text",{x:18,y:m.t+ih/2,transform:"rotate(-90 18 "+(m.t+ih/2)+")","text-anchor":"middle",class:"axis-label"});yl.textContent="Сила тренда →";s.appendChild(yl);

  items.forEach(function(t,i){
    const g=svg("g",{tabindex:"0","aria-label":t.title});
    const c=svg("circle",{cx:x(t.editorialPotential),cy:y(t.trendStrength),r:rr(t.seoPotential),fill:colors[t.category]||"#555",class:"bubble"});
    c.onclick=function(){selectTrend(t)};
    g.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();selectTrend(t)}};
    const lab=svg("text",{x:x(t.editorialPotential)+rr(t.seoPotential)+7,y:y(t.trendStrength)+4,class:"bubble-label"});lab.textContent=String(i+1);
    g.append(c,lab);s.appendChild(g);
  });
}

function selectTrend(t){
  state.selected=t.id;
  const d=document.querySelector("#trendDetail");
  const src=(t.sources||[]).map(function(s){return '<li><a href="'+s.url+'" target="_blank" rel="noreferrer">'+esc(s.label)+' ↗</a></li>'}).join("");
  const social=(t.socialIdeas||[]).map(function(x){return esc(x)}).join("<br>");
  d.innerHTML='<div class="badges"><span class="badge '+t.priority+'">'+pLabel[t.priority]+' приоритет</span><span class="badge '+t.status+'">'+sLabel[t.status]+'</span><span class="badge">'+esc(t.category)+'</span></div><h3>'+esc(t.title)+'</h3><p>'+esc(t.signal)+'</p><div class="detail-grid"><div class="detail-block"><span>Почему важно</span>'+esc(t.why)+'</div><div class="detail-block"><span>Редакционный угол</span>'+esc(t.editorialAngle)+'</div><div class="detail-block"><span>SEO</span>'+esc(t.seoAngle)+'</div><div class="detail-block"><span>Соцсети</span>'+social+'</div></div><p class="muted">Trend '+t.trendStrength+'/100 · Editorial '+t.editorialPotential+'/100 · SEO '+t.seoPotential+'/100</p>'+(src?'<ul class="source-list">'+src+'</ul>':'');
  d.scrollIntoView({behavior:"smooth",block:"nearest"});
}

function renderCards(items){
  const w=document.querySelector("#trendCards");
  w.innerHTML="";
  items.forEach(function(t){
    const b=document.createElement("button");
    b.type="button";
    b.className="trend-card";
    b.innerHTML='<div class="badges"><span class="badge '+t.priority+'">'+pLabel[t.priority]+'</span><span class="badge '+t.status+'">'+sLabel[t.status]+'</span><span class="badge">'+esc(t.category)+'</span></div><h3>'+esc(t.title)+'</h3><p>'+esc(t.signal)+'</p><div class="card-meta"><span>Trend '+t.trendStrength+'</span><span>Editorial '+t.editorialPotential+'</span><span>SEO '+t.seoPotential+'</span></div>';
    b.onclick=function(){selectTrend(t)};
    w.appendChild(b);
  });
  if(!items.length)w.innerHTML='<p class="muted">По выбранным фильтрам трендов нет.</p>';
}

function renderWork(items){
  const w=document.querySelector("#workNowGrid");
  w.innerHTML="";
  const current=items.filter(function(t){return t.priority==="high"}).sort(function(a,b){return (b.editorialPotential+b.trendStrength)-(a.editorialPotential+a.trendStrength)}).slice(0,6);
  current.forEach(function(t){
    const b=document.createElement("button");
    b.type="button";
    b.className="work-item";
    b.innerHTML='<small class="muted">'+esc(t.category)+' · '+sLabel[t.status]+'</small><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.editorialAngle)+'</p>';
    b.onclick=function(){selectTrend(t)};
    w.appendChild(b);
  });
}

function renderSeo(){
  const w=document.querySelector("#seoClusters");
  w.innerHTML="";
  state.data.seoClusters.forEach(function(c){
    const a=document.createElement("article");
    a.className="seo-card";
    a.innerHTML='<h3>'+esc(c.title)+'</h3><p>'+esc(c.description)+'</p>';
    w.appendChild(a);
  });
}

function renderHistory(){
  const w=document.querySelector("#historyList");
  w.innerHTML="";
  const history=(state.data.history||[]).slice().sort(function(a,b){return String(b.endDate||"").localeCompare(String(a.endDate||""))});
  if(!history.length){
    w.innerHTML='<article class="history-card"><p class="muted">История появится после следующего недельного обновления.</p></article>';
    return;
  }
  history.forEach(function(h){
    const points=(h.keyPoints||[]).map(function(p,i){return '<div class="history-point"><span>Сигнал '+(i+1)+'</span>'+esc(p)+'</div>'}).join("");
    const report=h.reportUrl?'<a href="'+h.reportUrl+'" target="_blank" rel="noreferrer">Полный отчет ↗</a>':"";
    const card=document.createElement("article");
    card.className="history-card";
    card.innerHTML='<div class="history-card-head"><div><p class="eyebrow">Неделя</p><h2>'+esc(h.period)+'</h2></div><span class="muted">Сохранено: '+esc(h.savedAt||h.updatedAt||"—")+'</span></div><p class="summary">'+esc(h.summary)+'</p><div class="history-points">'+points+'</div><div class="history-links">'+report+'</div>';
    w.appendChild(card);
  });
}

function renderSeoSignals(){
  const w=document.querySelector("#seoSignalList");
  if(!w) return;
  const seo=state.data.seoSignals||{};
  const queries=seo.queries||[];
  document.querySelector("#seoUpdatedAt").textContent=seo.updatedAt?"Обновлено: "+seo.updatedAt:"Данные SEO пока не загружены";
  document.querySelector("#seoQueryCount").textContent=queries.length;
  const pages=new Set(queries.map(function(q){return q.url}).filter(Boolean));
  document.querySelector("#seoPageCount").textContent=pages.size;
  document.querySelector("#seoOpportunityCount").textContent=queries.filter(function(q){return q.opportunity===true}).length;
  w.innerHTML="";
  if(!queries.length){
    w.innerHTML='<div class="seo-empty">Интерфейс готов. Для числовых метрик нужны выгрузки из Яндекс Вебмастера и/или Google Search Console: query, page, impressions, clicks, CTR, average position за 7 и 28 дней.</div>';
    return;
  }
  queries.forEach(function(q){
    const card=document.createElement("article");
    card.className="seo-signal-card";
    const action=q.action||"Наблюдать";
    const fmt=function(v,suffix){return (v===null||v===undefined||v==="")?"—":String(v)+(suffix||"")};
    card.innerHTML='<div class="seo-signal-card-head"><div><h3>'+esc(q.query||q.cluster||"SEO-сигнал")+'</h3><div class="url">'+esc(q.url||"Страница еще не назначена")+'</div></div><div class="badges">'+(q.opportunity?'<span class="badge growing">Возможность</span>':'')+'<span class="badge">'+esc(q.source||"SEO")+'</span></div></div><div class="seo-metrics"><div class="seo-metric"><span>Показы 7д</span><strong>'+fmt(q.impressions7)+'</strong></div><div class="seo-metric"><span>Показы 28д</span><strong>'+fmt(q.impressions28)+'</strong></div><div class="seo-metric"><span>Клики 7д</span><strong>'+fmt(q.clicks7)+'</strong></div><div class="seo-metric"><span>CTR</span><strong>'+fmt(q.ctr,"%")+'</strong></div><div class="seo-metric"><span>Позиция</span><strong>'+fmt(q.position)+'</strong></div><div class="seo-metric"><span>Δ 7/28</span><strong>'+fmt(q.delta,"%")+'</strong></div></div><div class="seo-action"><span>Что делать</span>'+esc(action)+'</div>';
    w.appendChild(card);
  });
}

function renderSources(){
  const w=document.querySelector("#sourceGroups");
  if(!w) return;
  w.innerHTML="";
  const groups=state.data.monitoringSources||[];
  groups.forEach(function(group){
    const section=document.createElement("section");
    section.className="source-group";
    const cards=(group.sources||[]).map(function(s){
      const tags=[];
      if(s.priority==="core") tags.push('<span class="source-tag core">core</span>');
      if(s.role==="verification") tags.push('<span class="source-tag verify">проверка</span>');
      if(s.priority==="support") tags.push('<span class="source-tag support">support</span>');
      return '<article class="source-card"><div class="source-card-top"><h3><a href="'+s.url+'" target="_blank" rel="noreferrer">'+esc(s.name)+' ↗</a></h3></div><p>'+esc(s.use)+'</p><div class="source-meta">'+tags.join("")+'</div></article>';
    }).join("");
    section.innerHTML='<div class="source-group-head"><h2>'+esc(group.title)+'</h2><p>'+esc(group.description||"")+'</p></div><div class="source-grid">'+cards+'</div>';
    w.appendChild(section);
  });
}

function esc(v){
  return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]});
}

init().catch(function(){
  document.querySelector(".page-shell").innerHTML="<h1>Trend Radar</h1><p>Не удалось загрузить данные.</p>";
});