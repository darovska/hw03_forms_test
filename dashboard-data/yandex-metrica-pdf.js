(function(){
"use strict";
var host=document.getElementById("ymPdfBody"),buttons=[].slice.call(document.querySelectorAll("[data-ym-window]"));if(!host)return;
function escapeHtml(v){return String(v==null?"":v).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]})}
function format(v){return v==null?"—":Number(v).toLocaleString("ru-RU",{maximumFractionDigits:2})}
function card(name,value,foot){return '<div class="mini" style="flex:1;min-width:160px"><div class="l">'+escapeHtml(name)+'</div><div class="n">'+format(value)+'</div><div class="socialMeta">'+escapeHtml(foot)+'</div></div>'}
fetch("/dashboard-data/growth-analytics.json?ym=20261109",{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(function(d){
var pdf=d.yandex_metrica_pdf;if(!pdf||!pdf.snapshots||pdf.snapshots.length!==3)throw Error("нет 3 срезов");
function draw(index){
var x=pdf.snapshots[index],src=[["Поиск",x.sources.search||x.sources.search_rounded],["Прямые",x.sources.direct||x.sources.direct_rounded],["Соцсети",x.sources.social],["Переходы с сайтов",x.sources.referral],["Рекомендательные системы",x.sources.recommendations]];
buttons.forEach(function(b){b.classList.toggle("active",Number(b.dataset.ymWindow)===index)});
var rounded=index>0?" · значения в сводке округлены":"",foot=x.start+" — "+x.end+rounded;
var kpis='<div style="display:flex;gap:10px;flex-wrap:wrap">'+card("Просмотры",x.views||x.views_rounded,foot)+card("Визиты",x.visits||x.visits_rounded,foot)+card("Посетители",x.visitors||x.visitors_rounded,foot)+card("Время на сайте",x.duration_seconds,foot+" · секунды")+'</div>';
var max=Math.max.apply(null,src.map(function(a){return a[1]||0}));
var bars=src.map(function(a,i){var w=Math.max(0,(a[1]||0)/max*100);return '<div class="barrow"><span>'+escapeHtml(a[0])+'</span><div class="track"><div class="fill" style="width:'+w.toFixed(1)+'%;background:'+(i%2===0?"#2563eb":"#f97316")+'"></div></div><b>'+format(a[1])+'</b></div>'}).join("");
var delta=function(key){var n=x.comparisons_pct[key];return (n>0?"+":"")+format(n)+"% (сравнение в PDF)"};
var table='<div class="tableWrap"><table class="table"><thead><tr><th>Источник</th><th>Визиты</th><th>Период</th></tr></thead><tbody>'+src.map(function(a){return '<tr><td>'+escapeHtml(a[0])+'</td><td>'+format(a[1])+'</td><td>'+escapeHtml(foot)+'</td></tr>'}).join("")+'</tbody></table></div>';
var flags=x.quality_flags.map(function(v){return escapeHtml(v)}).join(" ");
var detail=index===0?'<div class="chartTitle" style="margin-top:12px">Топ страниц по просмотрам, 03–09.11</div><div class="tableWrap"><table class="table"><thead><tr><th>URL</th><th>Просмотры</th></tr></thead><tbody>'+x.top_url_views.map(function(a){return '<tr><td>'+escapeHtml(a[0])+'</td><td>'+format(a[1])+'</td></tr>'}).join("")+'</tbody></table></div>':'';
host.innerHTML=kpis+'<p class="legendBox" style="margin:12px 0">Динамика относительно предыдущего периода по отчёту: просмотры '+delta("views")+', визиты '+delta("visits")+', посетители '+delta("visitors")+'. Отказы: '+format(x.bounce_pct)+'%, глубина '+format(x.depth)+'.</p><div class="grid twoCol"><div><div class="chartTitle">Каналы трафика · '+escapeHtml(x.period_label)+'</div><div class="bars" style="margin-top:12px">'+bars+'</div></div>'+table+'</div>'+detail+'<div class="note warn" style="margin-top:14px"><b>Качество данных:</b> '+flags+' Недельные, месячные и квартальные окна пересекаются и не складываются; дневные точки из картинки не восстанавливаются.</div>';
}
buttons.forEach(function(b){b.addEventListener("click",function(){draw(Number(b.dataset.ymWindow))})});draw(0);
}).catch(function(e){host.textContent="Срез Яндекс Метрики временно недоступен: "+e.message});
})();