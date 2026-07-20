# WS5.1 - Ghi chu kiem thu tu dong

## Pham vi da kiem

- Da doi chieu `package.json`, `server/package.json`, `README.md`, `HUONG_DAN_CHAY.md`, `src/App.jsx`,
  `server/src/db/schema.sql`.
- Da xac nhan repo co script:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
  - `npm run dev:all`

## Ket luan ky thuat tu ma nguon

- Frontend route day du cho luong demo va cac mo rong sau:
  `/`, `/profile`, `/results`, `/scan`, `/history`, `/motivation`, `/roadmap`, `/checkin`,
  `/streak`, `/experts`, `/experts/:id`, `/my-bookings/:id`, `/roadmap/custom`, `/login`, `/register`.
- Backend schema da co cac bang phuc vu demo nang cao:
  `users`, `profiles`, `skincare_ingredients`, `food_items`, `scan_history`, `roadmaps`, `checkins`,
  `expert_reports`, `experts`, `expert_bookings`.
- Script seed goc (`seed`) nap du lieu skincare/food va du lieu chuyen gia mau.
- Script moi (`seed:demo`) bo sung tai khoan demo, lich su scan, roadmap, check-in, streak va booking mau.

## Blocker moi truong

- Khong chay duoc `npm run test`, `npm run lint`, `npm run build` trong phien shell nay vi `node` va
  `npm` khong co trong PATH.
- Loi quan sat duoc:
  - `node: command not found`
  - `npm: command not found`

## Viec tiep theo de nguoi IT tu chay

1. Dam bao may co `node` va `npm`.
2. Chay `npm run test`.
3. Chay `npm run lint`.
4. Chay `npm run build`.
5. Chay `npm run dev:all` va test tay luong nguoi dung.

## Goi y mo rong cho WS5.3

Nen them mot script seed demo rieng de tao:

- 1-2 tai khoan demo
- 1 profile day du
- 3-5 ban ghi scan_history
- 1 roadmap active
- 5-7 checkin lien tiep de hien streak

## Trang thai cap nhat

- Da them script `npm --prefix server run seed:demo`.
- Script moi tao 2 tai khoan demo, profile, scan history, roadmap, streak va booking mau.
- Xem them huong dan chay o `HUONG_DAN_CHAY.md`.
