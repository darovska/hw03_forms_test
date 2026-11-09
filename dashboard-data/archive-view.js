/* International Investment: source-faithful audit table */
(function(){
"use strict";
var select=document.getElementById("iiArchiveChoice"),input=document.getElementById("iiArchiveSearch"),status=document.getElementById("iiArchiveStatus"),table=document.getElementById("iiArchiveTable");
if(!select||!input||!status||!table)return;
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]});}
status.textContent="Загружаю датированные first-party срезы…";
fetch("/dashboard-data/growth-analytics.json?v=20261109",{cache:"no-store"})
.then(function(res){if(!res.ok)throw Error("HTTP "+res.status);return res.json()})
.then(function(d){
var sets={social:d.historical_snapshots.social,social_archive:d.historical_snapshots.social_archive,content:d.content,google_queries:d.seo.google_queries,google_pages:d.seo.google_pages,google_clusters:d.seo.google_clusters,ai_visibility:d.ai_visibility,weekly_archive:d.weekly_archive,google_search:d.historical_snapshots.google_search,ga4_ai:d.historical_snapshots.ga4_ai};
function draw(){
 var all=sets[select.value]||[],head=all[0]||[],term=input.value.trim().toLowerCase();
 var rows=all.slice(1).filter(function(row){return row.some(function(v){return String(v==null?"":v).toLowerCase().includes(term);})});
 status.textContent="Накопительный first-party архив · сверка "+d.refreshed_at+" · "+rows.length+" строк · показано "+Math.min(rows.length,200)+". Периоды отдельных источников сохранены без интерполяции.";
 table.innerHTML="<thead><tr>"+head.map(function(h){return "<th>"+esc(h)+"</th>"}).join("")+"</tr></thead><tbody>"+rows.slice(0,200).map(function(row){return "<tr>"+head.map(function(h,i){return "<td>"+esc(row[i])+"</td>"}).join("")+"</tr>"}).join("")+"</tbody>";
}
select.addEventListener("change",draw);
input.addEventListener("input",draw);
draw();
})
.catch(function(e){status.textContent="Архив временно недоступен: "+e.message+". Сводные графики остаются доступными.";});
})();