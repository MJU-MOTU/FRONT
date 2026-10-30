# MOTU Frontend

모의투자와 투자 학습을 한 흐름으로 묶은 서비스 MOTU(모투)의 웹 클라이언트입니다.

| 항목 | 내용 |
| --- | --- |
| 언어·프레임워크 | TypeScript, React 19, Vite |
| 린트 | oxlint |
| 백엔드 | [MJU-MOTU/BACK](https://github.com/MJU-MOTU/BACK) |

## 로컬 실행

Node.js 22가 필요합니다.

```bash
npm install
npm run dev
```

- 개발 서버: http://localhost:5173
- 개발 중 `/api` 요청은 `vite.config.ts`의 프록시로 로컬 백엔드(`http://localhost:8080`)에 전달됩니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 배포한 백엔드 주소. 개발 중에는 비워 두면 Vite 프록시를 씁니다 |

## 배포

[Cloudflare Workers 정적 자산](https://developers.cloudflare.com/workers/static-assets/)으로 올립니다. Worker 스크립트 없이 `dist`만 올리고, 설정은 `wrangler.jsonc` 하나입니다. 플랫폼을 고른 이유와 백엔드 배포 순서는 [BACK의 docs/deploy.md](https://github.com/MJU-MOTU/BACK/blob/main/docs/deploy.md)에 있습니다.

| 설정 | 값 |
| --- | --- |
| 빌드 명령 | `npm run build` |
| 배포 명령 | `npx wrangler deploy` (기본값) |
| Settings → Build → Build variables and secrets | `VITE_API_BASE_URL=https://<백엔드 주소>` |

- `VITE_API_BASE_URL`은 빌드할 때 코드에 들어갑니다. 값을 바꾸면 다시 배포해야 합니다.
- 배포된 주소(`https://...workers.dev` 또는 연결한 도메인)를 백엔드 `CORS_ALLOWED_ORIGINS`에 넣어야 브라우저 요청이 통과합니다.
- 파일이 없는 경로(`/stocks/005930` 등)는 `index.html`을 200으로 돌려줘 클라이언트 라우팅이 처리합니다(`not_found_handling: single-page-application`).
- 새로 배포하면 이전 빌드의 청크 파일이 사라집니다. 열어 둔 탭이 차트(지연 로딩)를 불러오다 실패하면 한 번 새로고침해 새 빌드를 받습니다(`src/main.tsx`). 이 처리가 없으면 화면 전체가 비었습니다.

배포 결과를 로컬에서 확인하려면 백엔드 `CORS_ALLOWED_ORIGINS`에 `http://localhost:8787`을 넣고 띄운 뒤 아래를 실행합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run build
npx wrangler dev
```

## 화면

| 경로 | 내용 |
| --- | --- |
| `/login`, `/signup` | 로그인, 회원가입 |
| `/` | 홈 (로그인 필요) |
| `/stocks` | 종목 검색·시장 필터·페이지 (주소에 검색 조건 유지) |
| `/stocks/:code` | 현재가, 시장가 매수·매도 폼, 일봉 차트 (차트 라이브러리는 이 화면에서만 내려받음) |
| `/portfolio` | 총자산·현금·평가손익, 종목별 평균단가·평가금액·손익 |
| `/orders` | 주문 내역 (거절 포함) |

시세를 가져올 수 없으면 마지막으로 받은 가격과 그 시각을 보여 주고, 받은 적이 없으면 "지금은 시세를 가져올 수 없습니다"를 보여 줍니다. 등락은 국내 관례대로 상승 빨강, 하락 파랑입니다.

## 주문

- 주문 버튼을 한 번 누를 때마다 `Idempotency-Key`를 하나 만듭니다.
- 응답을 못 받은 실패(네트워크 오류, 5xx)면 다시 누를 때 같은 키를 씁니다. 서버가 이미 체결했다면 그 결과를 돌려받고 두 번 체결되지 않습니다.
- 결과가 정해진 실패(잔고 부족 등 4xx)나 수량·매수/매도를 바꾸면 새 키를 씁니다.

## 인증

- Access 토큰은 메모리에만 두고, Refresh 토큰은 새로고침해도 로그인이 유지되도록 `localStorage`에 둡니다.
- API 요청이 401을 받으면 Refresh로 한 번 재발급하고 원래 요청을 다시 보냅니다. 동시에 여러 요청이 401을 받아도 재발급은 한 번만 합니다(백엔드가 Refresh 토큰을 회전하므로 같은 토큰을 두 번 보내면 탈취로 처리됩니다).

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run lint` | oxlint 검사 |
| `npm test` | Vitest 단위 테스트 |
| `npm run build` | 타입 검사 + 프로덕션 빌드 |
