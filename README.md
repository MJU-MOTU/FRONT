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

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run lint` | oxlint 검사 |
| `npm run build` | 타입 검사 + 프로덕션 빌드 |
