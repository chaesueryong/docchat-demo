# Northwind Cloud 시작하기

Northwind Cloud는 인프라 관리 없이 웹 애플리케이션을 배포하고 확장할 수 있는 개발자 플랫폼입니다. 이 가이드는 첫 프로젝트를 만드는 과정을 안내합니다.

## 계정 만들기

northwind.cloud에서 이메일 또는 GitHub 계정으로 가입하세요. 모든 신규 계정은 신용카드 등록 없이 무료(Free) 플랜으로 시작합니다. 무료 플랜에서는 팀원을 최대 2명까지 초대할 수 있습니다.

## 첫 배포

`npm install -g northwind-cli`로 CLI를 설치한 뒤, 프로젝트 루트에서 `nw login`과 `nw deploy`를 실행하세요. CLI가 프레임워크를 자동으로 감지하며(Next.js, Remix, SvelteKit, Express, 정적 사이트 지원) 약 40초 안에 배포가 완료됩니다.

모든 배포에는 고유한 미리보기 URL이 생성됩니다. 대시보드의 Settings → Git에서 GitHub 저장소를 연결하면, main 브랜치에 푸시할 때마다 프로덕션 배포가 자동으로 실행됩니다.

## API 키

API 키는 대시보드의 Settings → API Keys에서 관리합니다. 각 키는 생성 시점에 단 한 번만 표시되므로 안전하게 보관하세요. 키를 재설정하려면 기존 키를 먼저 폐기(revoke)한 뒤 새 키를 생성하면 됩니다. 폐기된 키는 60초 이내에 사용이 중지됩니다. 생성 후에는 기존 키를 다시 확인할 방법이 없으므로, 키를 분실했다면 재설정이 유일한 방법입니다.

## 환경(Environments)

모든 프로젝트에는 development, preview, production 세 가지 환경이 있습니다. 환경 변수는 환경별로 분리되어 관리되며, 대시보드 또는 `nw env set KEY=value --env production` 명령으로 설정할 수 있습니다. production 환경 변수를 변경한 경우 재배포해야 적용됩니다.
