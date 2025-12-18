## Sentence completion (drag & drop) – 배포

이 레포는 프론트엔드 앱이 `web/` 폴더에 있습니다.

### 로컬 실행

```bash
cd web
npm install
npm run dev
```

### GitHub Pages로 외부 배포(자동)

- `master` 브랜치에 push 하면 GitHub Actions가 `web/`를 빌드해서 Pages로 배포합니다.
- 최초 1회만 GitHub 저장소 설정에서 Pages를 켜야 할 수 있습니다:
  - **Settings → Pages → Build and deployment → Source: GitHub Actions**

워크플로우: `.github/workflows/deploy-pages.yml`
