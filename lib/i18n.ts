export type Language = "ko" | "en"

export const translations = {
  ko: {
    // Navigation
    home: "홈",
    report: "리포트",
    templates: "템플릿",
    myPage: "마이 페이지",
    appName: "주간 리포트",
    uiGuide: "UI 가이드",

    // Home/Todo
    weeklyTodos: "주간 할 일",
    todoSubtitle: "깔끔하고 미니멀한 인터페이스로 작업을 관리하세요",
    addTodo: "할 일 추가...",
    addButton: "추가",
    memo: "메모",
    today: "오늘",

    // Report
    reportHistory: "리포트 기록",
    createNewReport: "새 리포트 생성",
    generateReport: "리포트 생성하기",
    dateRange: "기간",
    template: "템플릿",
    created: "생성일",
    download: "다운로드",
    share: "공유",
    selectDateRange: "날짜 범위 선택",
    selectTemplate: "템플릿 선택",
    generateWithAI: "AI로 생성하기",
    weeklyReport: "주간 리포트",
    monthlyReport: "월간 리포트",
    cancel: "취소",

    // Templates
    templatesLibrary: "템플릿 라이브러리",
    uploadCustomTemplate: "커스텀 템플릿 업로드",
    uploadTemplate: "템플릿 업로드",
    fileType: "파일 형식",
    dragFileHere: "파일을 여기에 드래그하세요",
    orClickBrowse: "또는 클릭하여 선택",
    proUsersOnly: "프로 사용자 전용:",
    onlyXlsxDocx: ".xlsx 및 .docx 파일만 지원됩니다.",

    // My Page
    profileSettings: "프로필 설정",
    updateAccountInfo: "계정 정보 업데이트",
    languageSettings: "언어 설정",
    selectLanguage: "언어 선택",
    testLogin: "로그인 화면 테스트",
    korean: "한국어",
    english: "English",

    // Login
    loginSlogan: "주간 리포트를 자동화하세요",
    continueWithGoogle: "Google로 계속하기",

    // UI Guide
    uiComponentGuide: "UI 컴포넌트 가이드 (개발용)",
    loadingAndProgress: "로딩 및 진행 상태",
    feedbackMessages: "피드백 메시지",
    buttons: "버튼",
    spinner: "스피너",
    progressBar: "진행 바",
    reportGeneratingOverlay: "리포트 생성 오버레이",
    aiWritingReport: "AI가 리포트를 작성 중입니다...",
    successfullySaved: "성공적으로 저장되었습니다!",
    failedToGenerate: "리포트 생성에 실패했습니다.",
    infoMessage: "이것은 정보 메시지입니다.",
    primaryButton: "기본 버튼",
    secondaryButton: "보조 버튼",
    destructiveButton: "삭제 버튼",
  },
  en: {
    // Navigation
    home: "Home",
    report: "Report",
    templates: "Templates",
    myPage: "My Page",
    appName: "Weekly Report",
    uiGuide: "UI Guide",

    // Home/Todo
    weeklyTodos: "Weekly Todos",
    todoSubtitle: "Manage your tasks with a clean, minimal interface",
    addTodo: "Add a todo...",
    addButton: "Add",
    memo: "Memo",
    today: "Today",

    // Report
    reportHistory: "Report History",
    createNewReport: "Create New Report",
    generateReport: "Generate Report",
    dateRange: "Date Range",
    template: "Template",
    created: "Created",
    download: "Download",
    share: "Share",
    selectDateRange: "Select Date Range",
    selectTemplate: "Select Template",
    generateWithAI: "Generate with AI",
    weeklyReport: "Weekly Report",
    monthlyReport: "Monthly Report",
    cancel: "Cancel",

    // Templates
    templatesLibrary: "Templates Library",
    uploadCustomTemplate: "Upload Custom Template",
    uploadTemplate: "Upload Template",
    fileType: "File Type",
    dragFileHere: "Drag file here",
    orClickBrowse: "or click to browse",
    proUsersOnly: "Pro users only:",
    onlyXlsxDocx: "Only .xlsx and .docx files are supported.",

    // My Page
    profileSettings: "Profile Settings",
    updateAccountInfo: "Update your account information",
    languageSettings: "Language Settings",
    selectLanguage: "Select Language",
    testLogin: "Test Login Screen",
    korean: "한국어",
    english: "English",

    // Login
    loginSlogan: "Automate your weekly reports",
    continueWithGoogle: "Continue with Google",

    // UI Guide
    uiComponentGuide: "UI Component Guide (Dev Only)",
    loadingAndProgress: "Loading & Progress",
    feedbackMessages: "Feedback Messages",
    buttons: "Buttons",
    spinner: "Spinner",
    progressBar: "Progress Bar",
    reportGeneratingOverlay: "Report Generating Overlay",
    aiWritingReport: "AI is writing your report...",
    successfullySaved: "Successfully saved!",
    failedToGenerate: "Failed to generate report.",
    infoMessage: "This is an info message.",
    primaryButton: "Primary Button",
    secondaryButton: "Secondary Button",
    destructiveButton: "Destructive Button",
  },
}

export function getTranslation(language: Language) {
  return translations[language]
}
