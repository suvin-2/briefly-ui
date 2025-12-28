# Briefly ⚡

> **업무는 간결하게, 보고는 완벽하게.** > AI 기반 주간 업무 리포트 자동화 서비스 (AI-Powered Weekly Report Assistant)

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 📖 Project Overview

**Briefly**는 매주 반복되는 번거로운 주간 업무 보고 작성을 자동화해주는 생산성 도구입니다.
사용자가 매일의 할 일(To-Do)을 관리하면, AI가 이를 바탕으로 깔끔한 문장의 주간 리포트를 자동으로 생성해줍니다.

단순한 투두 리스트를 넘어, **'기록'이 '보고'로 이어지는 끊김 없는 워크플로우**를 제공하는 것을 목표로 합니다.

## 🛠 Tech Stack

최신 웹 트렌드와 기술 스택을 적극 반영하여 개발했습니다.

- **Core**: ![Next JS](https://img.shields.io/badge/Next.js%2014-black?style=flat&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) (App Router)
- **Styling**: ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=flat&logo=shadcnui&logoColor=white)
- **Animation**: ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)
- **State Management**: React Context API, TanStack Query (React Query)
- **Deployment**: Vercel

## ✨ Key Features

1.  **Weekly Todo Management**
    - 주간 단위로 할 일을 직관적으로 관리 (Notion 스타일 UI)
    - 완료 여부 체크 및 상세 메모 작성 기능
2.  **Smart Calendar Navigation**
    - 모바일 환경에 최적화된 가로 스크롤 날짜 스트립 (Swipeable Date Strip)
    - 주간 이동 시 연/월 정보 자동 동기화
3.  **Responsive UI/UX (Glassmorphism)**
    - 데스크탑, 태블릿, 모바일 등 모든 디바이스에 최적화된 반응형 레이아웃
    - 세련된 글래스모피즘(Glassmorphism) 디자인 시스템 적용
4.  **Developer Experience (DX)**
    - 재사용 가능한 컴포넌트 설계 (`components/ui`)
    - 개발 편의를 위한 UI 가이드 및 플레이그라운드 페이지 포함

## 🚀 Getting Started

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계가 필요합니다.

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# 1. Clone the repository
git clone [https://github.com/suvin-2/briefly.git](https://github.com/suvin-2/briefly.git)

# 2. Install dependencies
npm install
# or
yarn install

# 3. Run the development server
npm run dev