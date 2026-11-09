(function(){
"use strict";
var target=document.getElementById("ymPhraseBody"),buttons=[].slice.call(document.querySelectorAll("[data-phrase-window]"));
if(!target)return;
function esc(t){return String(t===null||t===undefined?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(v){return v==null?"—":Number(v).toLocaleString("ru-RU",{maximumFractionDigits:2})}
fetch("/dashboard-data/growth-analytics.json?phrase=20261109",{cache:"no-store"}).then(function(res){if(!res.ok)throw Error("HTTP "+res.status);return res.json()}).then(function(d){
var data=d.yandex_search_phrases_pdf;if(!data||!data.snapshots||data.snapshots.length!==3)throw Error("не найдены три среза");
function draw(index){
var a=data.snapshots[index],totalSrc=d.yandex_metrica_pdf&&d.yandex_metrica_pdf.snapshots[index],whole=totalSrc&&totalSrc.sources.search||totalSrc&&totalSrc.sources.search_rounded;
buttons.forEach(function(b){b.classList.toggle("active",Number(b.dataset.phraseWindow)===index)});
var period=a.start+" — "+a.end;
var kpi='<div class="grid kpis">'+
'<div class="mini"><div class="l">Визиты · поисковые фразы</div><div class="n">'+fmt(a.visits)+'</div><div class="socialMeta">'+esc(period)+' · отдельный группированный отчет</div></div>'+
'<div class="mini"><div class="l">Посетители · поисковые фразы</div><div class="n">'+fmt(a.visitors)+'</div><div class="socialMeta">'+esc(period)+'</div></div>'+
'<div class="mini"><div class="l">Отказы</div><div class="n">'+fmt(a.bounce_pct)+'%</div><div class="socialMeta">'+esc(period)+'</div></div>'+
'<div class="mini"><div class="l">Все поисковые визиты · другой отчёт</div><div class="n">'+fmt(whole)+'</div><div class="socialMeta">Яндекс Метрика · источники трафика</div></div></div>';
var top=a.phrases.slice(0,14),mx=Math.max.apply(null,top.map(function(x){return x[1]}));
var chart=top.slice(0,7).map(function(x){return '<div class="barrow" style="grid-template-columns:minmax(160px,1.5fr) 2fr 65px"><span title="'+esc(x[0])+'">'+esc(x[0])+'</span><div class="track"><div class="fill" style="width:'+((x[1]/mx)*100).toFixed(1)+'%;background:#2563eb"></div></div><b>'+fmt(x[1])+'</b></div>'}).join("");
var table='<div class="tableWrap" style="margin-top:12px;max-height:370px;overflow:auto"><table class="table"><thead><tr><th>Поисковая фраза</th><th>Визиты</th><th>Посетители</th><th>Отказы, %</th><th>Глубина</th><th>Время, с</th></tr></thead><tbody>'+a.phrases.map(function(x){return '<tr>'+x.map(function(v){return '<td>'+esc(v)+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
var warnings=a.quality_flags.map(esc).join(" ");
target.innerHTML=kpi+'<div class="grid twoCol" style="margin-top:12px"><div><div class="chartTitle">Частые видимые фразы · '+esc(period)+'</div><div class="bars" style="margin-top:10px">'+chart+'</div></div><div class="note info"><b>SEO-применение:</b> сверить каждую фразу с её URL в Яндекс Вебмастере, проверить интент и обновить полезный контент. Данных позиций и CTR этот отчёт не содержит; рост после правок измерять по query→URL, вовлечённым визитам и конверсиям.</div></div>'+table+'<div class="note warn" style="margin-top:12px"><b>Ограничения:</b> '+warnings+'</div>';
}
buttons.forEach(function(x){x.addEventListener("click",function(){draw(Number(x.dataset.phraseWindow))})});draw(0);
}).catch(function(e){target.textContent="Не удалось прочитать поисковые фразы: "+e.message});
})();