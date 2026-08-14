# 보안 및 데이터 정책

## 데이터 보관

애플리케이션 로그는 무료 플랜에서 7일, Pro에서 30일, Enterprise에서 최대 365일까지 보관됩니다. 삭제된 프로젝트는 14일 동안 임시 삭제(soft-delete) 상태로 유지되며, 이 기간에는 대시보드에서 복원할 수 있습니다. 14일이 지나면 프로젝트의 모든 데이터, 배포, 로그가 영구 삭제됩니다.

관리형 Postgres의 데이터베이스 백업은 매일 수행되며 Pro에서 7일, Enterprise에서 35일간 보관됩니다. 특정 시점 복구(Point-in-time recovery)는 Enterprise에서만 제공됩니다.

## 데이터 저장 위치

기본적으로 데이터는 미국 동부(US East) 리전에 저장됩니다. Pro와 Enterprise 고객은 프로젝트 생성 시 EU(프랑크푸르트) 또는 아시아 태평양(서울) 리전을 선택할 수 있습니다. 데이터는 선택한 리전을 벗어나지 않습니다.

## 컴플라이언스

Northwind Cloud는 SOC 2 Type II 인증과 GDPR 준수를 갖추고 있습니다. 모든 유료 플랜에서 Settings → Compliance를 통해 서명된 DPA(데이터 처리 계약)를 받을 수 있습니다. Enterprise 고객은 NDA 체결 후 최신 모의 해킹(침투 테스트) 요약 보고서를 요청할 수 있습니다.

## 접근 및 인증

멤버가 5명을 초과하는 조직은 대시보드 접근 시 2단계 인증(2FA)이 필수입니다. API 키는 프로젝트 단위로 발급되며 읽기 전용으로 제한할 수 있습니다. Enterprise SSO는 SAML 2.0을 통해 Okta, Azure AD, Google Workspace를 지원합니다.

## 취약점 신고

보안 문제는 security@northwind.cloud로 신고해 주세요. 책임 있는 공개(responsible disclosure) 프로그램을 운영하며 48시간 이내에 회신합니다. 다른 고객의 프로젝트를 대상으로 테스트하지 마세요.
