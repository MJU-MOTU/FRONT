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
