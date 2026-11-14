"use strict";
const $ = s => document.querySelector(s);
const make = (tag,cls,content) => { const e=document.createElement(tag); if(cls)e.className=cls; if(content!==undefined)e.textContent=String(content); return e; };
const THEMES=["Недвижимость","Инвестиции","Туризм","Отели и гостиничный бизнес","ВНЖ и миграция","Налоги для инвесторов","Регулирование и правила для иностранных покупателей"];
const STATUS={fresh:"fresh · 0–14 дней",watch:"watch · 15–30 дней",stale:"stale · 31–60 дней",urgent:"urgent · 61+ дней",unverified:"не подтверждено"};
const state={matrix:[],data:null,scan:null,analytics:null};
function safeUrl(url){try{let u=new URL(url,location.href);return u.protocol==="https:"?u.href:null;}catch{return null}}
function link(text,url,css){const a=make("a",css,text);a.href=safeUrl(url)||"#";a.target="_blank";a.rel="noopener noreferrer";return a;}
function flag(status){return make("span","tag "+(STATUS[status]?status:"unverified"),STATUS[status]||status||"не проверено");}
function niceDate(s){if(!s)return "не подтверждена";const p=s.split("-");return p.length===3?p[2]+"."+p[1]+"."+p[0]:s;}
function setText(id,t){const e=$("#"+id);if(e)e.textContent=String(t);}
function renderMatrix(){
  const body=$("#matrix");body.replaceChildren();
  const query=$("#search").value.trim().toLocaleLowerCase(),theme=$("#theme").value,st=$("#status").value;
  const records=state.matrix.filter(r=>(r.country+" "+r.name+" "+(r.headline||"")).toLocaleLowerCase().includes(query)&&(!theme||theme===r.name)&&(!st||(st==="verified"?!!r.lastPublished:r.status===st)));
  const rank={urgent:0,stale:1,watch:2,fresh:3,unverified:4};
  records.sort((a,b)=>(rank[a.status]??4)-(rank[b.status]??4)||a.country.localeCompare(b.country,"ru")||THEMES.indexOf(a.name)-THEMES.indexOf(b.name));
  for(const r of records){
    const tr=make("tr");
    tr.append(make("td","country",r.country),make("td",null,r.name));
    const date=make("td");date.append(make("strong",null,niceDate(r.lastPublished)));
    if(r.headline)date.append(make("div","notes",r.headline));
    tr.append(date);
    const cell=make("td");cell.append(flag(r.status));tr.append(cell);
    const urls=make("td");
    if(r.lastUrl){urls.append(link("Материал ↗",r.lastUrl));const loc=r.languageUrls||{};const more=make("div","locale");
      for(const l of ["ru","en","ka","he"])if(loc[l])more.append(link(l.toUpperCase(),loc[l],"locale-link"));
      urls.append(more);
    }else urls.append(make("span","notes","Нет подтверждённой статьи за проверенный период"));
    tr.append(urls);body.append(tr);
  }
  if(!records.length){const tr=make("tr"),td=make("td","empty","Совпадений нет. Попробуйте другой фильтр.");td.colSpan=5;tr.append(td);body.append(tr)}
  setText("shownCount",records.length+" пар");
}
function renderGaps(gaps){
  const holder=$("#gaps");holder.replaceChildren();
  for(const [idx,g] of gaps.entries()){
    const card=make("article","gap"),head=make("div","gap-head");
    head.append(make("strong",null,(idx+1)+". "+g.country));
    const t=g.topics?.[0];if(t)head.append(flag(t.status));
    card.append(head);
    const theme=make("div","notes",t?.name||"Тема не уточнена");
    card.append(theme,make("p",null,g.reason||"Причина не указана"));
    const foot=make("div","links");if(g.sourceUrl)foot.append(link("Первичный источник",g.sourceUrl));if(g.additionalSourceUrl)foot.append(link("Другие данные",g.additionalSourceUrl));
    if(t?.lastUrl)foot.append(link("Последняя статья",t.lastUrl));
    card.append(foot);
    const d=make("small","notes","Сигнал: "+(g.signalAt?niceDate(g.signalAt):"дата неизвестна")+". Решение: "+(g.decision||"проверить"));
    card.append(d);holder.append(card);
  }
  if(!gaps.length)holder.append(make("p","empty","Новых проверенных редакционных пробелов за период нет."));
}
function renderLanguageScan(scan){
 const holder=$("#languages");holder.replaceChildren();
 if(!scan){holder.append(make("p","hint","Сканирование языковых версий временно недоступно."));return}
 const rec=scan.articles||[];const since=scan.multilingualWindow?.split("/")[0]||"2026-10-26";
 for(const [code,name] of [["ru","Русский"],["en","English"],["ka","ქართული"],["he","עברית"]]){
   const sub=rec.filter(x=>x.lang===code&&x.date>=since);const unique=new Set(sub.map(x=>x.id)).size;
   const card=make("div","language-card");card.append(make("div","eyebrow",name+" · "+code.toUpperCase()));
   card.append(make("strong","language-num",unique));card.append(make("div","notes","Уникальных ID в архиве с "+niceDate(since)));holder.append(card);
 }
 const note=$("#languageNote");if(note){const inc=scan.recentIncrementalWindow||"";const langs=(scan.recentLanguagesAudited||[]).map(x=>x.toUpperCase()).join("/");const kh=scan.kaHeThrough?niceDate(scan.kaHeThrough):null;note.textContent=(langs&&inc?langs+" проверены напрямую за "+inc.replace("/", " — ")+(kh?"; KA/HE — до "+kh:"")+". ":"")+"Числа отражают найденные ID в архиве и при неполном языковом скане не являются полностью сопоставимыми."; }
 const quality=$("#quality");quality.replaceChildren();
 const p=make("p","hint","Обнаружено "+(scan.articles||[]).length+" языковых URL, "+new Set(rec.map(x=>x.id)).size+" уникальных ID. Англоязычный архив: "+(scan.pagesRead||"—")+"/"+(scan.pagesAttempted||"—")+" дней. EN/RU за 9–14 ноября сверены напрямую по дневным архивам; multi-country материалы не обновляют страновые ячейки. Дополнительные страницы и даты с 404 не считаются доказательством отсутствия статьи.");
 quality.append(p);
 const info=make("p","hint");info.append(make("strong",null,"Редакционная проверка тегов: "));
 info.append("материал о гостиницах Вены от 05.11 (ID 9048) размечен в английском архиве как «Italy / Tourism Italy». В матрице исправлен на Австрию, тег CMS требует проверки.");
 quality.append(info);
}
function renderRadar(j){
 const box=$("#radarFeed");box.replaceChildren();const list=(j.trends||[]).filter(t=>t.verifiedOn>="2026-11-01"||t.publishedAt>="2026-11-01").slice(0,6);
 if(!list.length){box.append(make("p","hint","Текущих подтверждённых карточек Trend Radar не найдено."));return}
 for(const t of list){const card=make("div","trend-card");card.append(make("strong",null,t.title||"Новая тема"));card.append(make("div","notes",(t.category||"Тренд")+" · "+(t.editorialUrgency||t.priority||"наблюдение")));card.append(make("p",null,(t.signal||t.why||"").slice(0,285)));const source=t.sources?.[0];if(source?.url)card.append(link("Источник ↗",source.url));box.append(card)}
 setText("radarPeriod",j.meta?.period||"—");
}
function renderAnalytics(d){
 const p=$("#analytics");p.replaceChildren();
 if(!d){p.append(make("p","hint","Аналитический дашборд не удалось прочитать. Сохранённые поисковые показатели не заменяются оценочными."));p.append(link("Открыть дашборд аналитики","../index.html"));return}
 const l=d.languages||{},dates=d.latest_snapshot?.dates||{};
 const header=make("p","hint","Источник: аналитический дашборд, последнее общее обновление "+(d.updated||"—")+". Языковая видимость: "+(l.period||"—")+" (Яндекс Вебмастер). GSC "+(dates.gsc||"—")+", GA4 "+(dates.ga4||"—")+". Исторические измерения, не метрики 08.11.");
 p.append(header);
 const grid=make("div","language-grid");for(const [code,name] of [["RU","Русский"],["EN","English"],["KA","ქართული"],["HE","עברית"]]){const v=l.versions?.[code];const card=make("div","language-card");card.append(make("div","eyebrow",name));card.append(make("strong","language-num",v?.impressions==null?"—":v.impressions.toLocaleString("ru-RU")));card.append(make("div","notes","показов в Яндексе · "+(v?.clicks??"—")+" кликов"));grid.append(card)}p.append(grid);
 p.append(make("p","hint",l.note||"Поисковая видимость не равна числу сеансов сайта. Даты источников различаются."));
 p.append(link("Открыть аналитику сайта ↗","../index.html","external-link"));
}
async function fromResponse(res){if(!res.ok)throw Error("HTTP "+res.status);return res.json()}
async function start(){
  THEMES.forEach(v=>{const o=make("option",null,v);o.value=v;$("#theme").append(o)});
  for(const id of ["search","theme","status"])$("#"+id).addEventListener("input",renderMatrix);
  const [ra,sc,an]=await Promise.allSettled([
    fetch("./data/trends.json",{cache:"no-store"}).then(fromResponse),
    fetch("./data/coverage-publications.json",{cache:"no-store"}).then(fromResponse),
    fetch("../index.html",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Analytics HTTP "+r.status);return r.text()}).then(x=>{const doc=new DOMParser().parseFromString(x,"text/html"),s=doc.getElementById("dashboard-data");if(!s)throw Error("embedded analytics JSON unavailable");return JSON.parse(s.textContent)})
  ]);
  if(ra.status==="fulfilled"){
    const j=ra.value,c=j.coverageMonitoring||{};state.data=j;
    state.matrix=(c.matrix||[]).flatMap(country=>(country.topics||[]).map(t=>({country:country.country,...t})));
    setText("audit","Аудит: "+(c.updatedAt||"—"));setText("countries",(c.matrix||[]).length);
    setText("signals",(c.gaps||[]).length);setText("verified",state.matrix.filter(x=>x.lastPublished).length);
    setText("unverified",state.matrix.filter(x=>!x.lastPublished).length);
    setText("totalTopics",state.matrix.length);renderGaps(c.gaps||[]);renderRadar(j);renderMatrix();
  }else{
    setText("audit","Ошибка загрузки Trend Radar");
    $("#matrix").replaceChildren();const tr=make("tr"),td=make("td","empty","Не удалось получить актуальный trends.json: "+String(ra.reason));td.colSpan=5;tr.append(td);$("#matrix").append(tr);
    $("#gaps").replaceChildren(make("p","empty","Редакционные сигналы недоступны."));
    $("#radarFeed").replaceChildren(make("p","empty","Trend Radar недоступен."));
  }
  state.scan=sc.status==="fulfilled"?sc.value:null;renderLanguageScan(state.scan);
  state.analytics=an.status==="fulfilled"?an.value:null;renderAnalytics(state.analytics);
}
start();
