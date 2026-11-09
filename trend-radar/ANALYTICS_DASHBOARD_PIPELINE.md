# International Investment — Analytics Dashboard Pipeline

## Цель

Каждый ежедневный/еженедельный запуск International Investment должен обновлять не только Trend Radar и Coverage Monitor, но и главный growth-dashboard:

- public: https://international-investment-growth-dashboard.onrender.com/
- GitHub: darovska/hw03_forms_test, branch main
- dashboard: index.html
- trend data: trend-radar/data/trends.json
- накопительный first-party источник: Google Sheet "International Investment — Growth Dashboard"

Нельзя считать задачу завершенной, если Trend Radar обновлен, а main dashboard показывает старую дату или старые данные.

## Обязательный порядок

1. Прочитать current main branch и зафиксировать SHA index.html и trends.json.
2. Определить last complete day и last complete week в timezone пользователя.
3. Собрать все доступные first-party слои:
   - Metricool Facebook main — direct connector;
   - GSC Web / GA4 / AI referrals — direct connector, если доступен; иначе last-good archive;
   - Яндекс Метрика / Вебмастер — свежий export, если загружен; иначе last-good с точной датой;
   - Google Sheet cumulative archive: GSC Daily History, GA4 Organic History, Weekly Summaries, SEO Google, Facebook Daily, social archives;
   - Meta/VK/Telegram/Дзен и другие first-party exports;
   - Trend Radar / Coverage Monitor как editorial/coverage layer, отдельно от traffic analytics.
4. Никогда не заменять stale метрики свежей датой попытки доступа. Если connector blocked, сохранить last-good measurement date и status=blocked/stale.
5. Обновить main dashboard data:
   - latest snapshot;
   - daily updates;
   - last complete week summary;
   - SEO recommendations;
   - "Статьи, которые уже работают в плюс";
   - analytics inventory;
   - source freshness ledger.
6. Обновить единый блок "Охват и аудитория":
   - scopes: Общее / Сегменты / Источники / Вся аналитика;
   - ranges: 7 дней / 1 месяц / 3 месяца / 6 месяцев / 1 год;
   - metrics: Охват / Просмотры / Посетители / Поиск;
   - chart + table must switch together;
   - для 6м/1г показывать только фактически сохраненную часть ряда, без интерполяции;
   - clearly label coverage start/end and source.
7. Source rules:
   - GSC impressions != Facebook reach/impressions;
   - GA4 sessions/users != Яндекс visits;
   - post reach sum can contain the same user across several posts;
   - AI referrals != AI citations;
   - never sum non-comparable reach metrics into a fake universal total.
8. Сохранить все прошлые weekly/daily snapshots. Не перезаписывать историю.
9. Обновить GitHub с descriptive commit. Повторно прочитать committed file и проверить:
   - updated/current dates;
   - all required sections;
   - no dropped historical arrays;
   - correct source freshness.
10. Render:
   - service: international-investment-growth-dashboard;
   - use auto-deploy when enabled; manual clear-cache deploy only when needed;
   - wait for status live;
   - verify live deploy commit SHA equals final Git commit SHA;
   - open public URL and confirm rendered controls/sections, not only source HTML.
11. QA gate — задача не выполнена, пока не подтверждено:
   - main dashboard date is current;
   - 7d/1m/3m/6m/1y controls exist;
   - Общее/Сегменты/Источники/Вся аналитика exist;
   - Охват/Просмотры/Посетители/Поиск exist;
   - graph + table render for each supported mode;
   - daily update section covers each day of the last complete week (empty day shown explicitly);
   - last-week summary is present;
   - SEO recommendations and winning-articles section render;
   - source freshness/blocked states are visible;
   - Render live SHA matches GitHub.
12. Финальный статус писать по чек-листу: GitHub, analytics sync, dashboard UI, weekly/daily, SEO, history, Render deploy, live verification, blockers.

## Ежедневный минимум

- Metricool Facebook main through previous complete day.
- Daily editorial signals from Trend Radar.
- Source freshness ledger.
- Do not fabricate Google/Yandex when unavailable.

## Еженедельный минимум

- Complete Monday–Sunday week.
- Compare with previous complete week when comparable data exists.
- Refresh weekly summary, analytics inventory, SEO/CTR opportunities, working articles.
- Preserve long-range history.
- Run full Render live QA.

## Failure policy

If GSC/GA4/Яндекс is unavailable, dashboard still updates with the available layers, but must display the exact last-good date and blocker. A connector failure is not evidence of zero traffic.

## Data contract: public archive and chart QA (09.11.2026)

Public assets on branch `main`:
- `index.html` — root dashboard / all user-facing sections.
- `dashboard-data/growth-analytics.json` — cumulative dated first-party archive, covering Facebook main daily, GA4 Organic daily, GSC Web daily, regional social and dated source snapshots, 30 weekly source rows, content publications, AI and SEO Queries/Pages/Clusters.
- `dashboard-data/archive-view.js` — searchable HTML table for selecting raw sources and historic rows. Must load without 404.

**Update order:** first merge cumulative Sheet/source exports into `growth-analytics.json`; then update embedded `index.html` latest snapshot, source freshness, weekly/daily blocks, SEO/article priorities; ensure `archive-view.js` remains compatible. When needed, update this contract. The last GitHub commit after ALL changes is the one Render must deploy.

**Nonnegotiable checks:**
1. First-party daily source evidence: dates cover all saved observations; Facebook main is post impressions / Page Media Views / post clicks / **link clicks**, not GA4 site sessions. Cross-platform post reach totals are NOT deduplicated people.
2. GA4 Visitors series uses measured `organic_users` / `organic_active_users`, not sessions. Daily page views may be unavailable; display `нет данных`, not sessions masquerading as views. GA4 `google / organic` is a subset of Organic Search, not additive.
3. Each source-specific plot anchors 7d/30d/90d/180d/365d to that source's last **measured** date, labels its exact period and source age, and states coverage (e.g. 95 / 365). Do not extrapolate, backfill missing days with zeros, or visually imply continuous data when values are missing.
4. Keep all source statuses, Query/Page separate, and AI referrals vs citations explicit. Source-specific comparisons only; missing GSC/GA4/Яндекс never becomes 0.
5. Weekly source records never overwritten. The visible `Что изменилось за неделю` MUST refer to the last **complete** week, and old October notes must be marked `Архив`, not `текущая неделя`.
6. The `Охват и аудитория` UI must contain scopes `Общее / Сегменты / Источники / Вся аналитика`, metrics `Охват / Просмотры / Посетители / Поиск`, all five range controls, synchronized chart + table; searchable raw archive shows dated source headers and full row counts.
7. GitHub verification: re-fetch each written artifact, check JSON parse and JS syntax, preserve prior row counts, search for stale hard-coded current dates, and check referenced file paths.
8. Render verification: locate the exact service `international-investment-growth-dashboard`, observe build/deploy status for final SHA, verify `live` commit SHA equals final Git commit, and visit both public root and `/dashboard-data/growth-analytics.json` plus `/dashboard-data/archive-view.js`. If browser testing is possible, select GA4 Visitors and check that an active-users line and table values match the source, then select 1 year and verify partial-coverage labeling.

Log the latest first-party measurement date and `updated` separately. A root `Обновлено` date only proves the dashboard code/data was reviewed, **not** fresh GA4/GSC measurements.
