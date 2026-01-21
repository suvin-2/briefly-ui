"use client"

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer"
import type { Report } from "@/types"
import { formatLocalDate } from "@/services/todo.service"

// 한글 폰트 등록 (Spoqa Han Sans Neo - TTF 형식)
Font.register({
  family: "SpoqaHanSans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.ttf",
      fontWeight: 700,
    },
  ],
})

// PDF 스타일
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 50,
    fontFamily: "SpoqaHanSans",
    fontSize: 9,
    lineHeight: 1.4,
    color: "#333",
  },
  // 헤더 영역 (제목 + 날짜)
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#5D7AA5",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#5D7AA5",
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 10,
    color: "#666",
  },
  // 본문 영역
  content: {
    marginTop: 0,
  },
  // 섹션 제목 (H1)
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#5D7AA5",
  },
  // 서브 섹션 제목 (H2)
  subSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#444",
    marginTop: 10,
    marginBottom: 5,
  },
  // 소제목 (H3, H4) - 업무 항목 제목
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#333",
    marginTop: 8,
    marginBottom: 3,
  },
  // 일반 텍스트
  paragraph: {
    fontSize: 9,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  // 리스트 아이템
  listItem: {
    flexDirection: "row" as const,
    marginBottom: 2,
    paddingLeft: 4,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: "#5D7AA5",
  },
  listItemText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  // 데이터 테이블 (보이는 테두리)
  table: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeaderRow: {
    flexDirection: "row" as const,
    backgroundColor: "#5D7AA5",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    fontWeight: 700,
    color: "#fff",
  },
  // 업무 상세 카드 (투명 테두리 표 형태)
  taskCard: {
    marginTop: 6,
    marginBottom: 10,
    marginLeft: 0,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  // 업무 정보 테이블 (3열 레이아웃 - 날짜, 상태, 내용)
  taskTable: {
    width: "100%",
  },
  taskTableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 0,
  },
  taskTableCell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  // 라벨 셀 (고정 너비)
  taskLabelCell: {
    width: 50,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  taskLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#6c757d",
  },
  // 값 셀
  taskValueCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  taskValue: {
    fontSize: 9,
    color: "#212529",
    lineHeight: 1.4,
  },
  // 업무 내용 영역 (전체 너비 사용)
  taskContentRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  taskContentLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#6c757d",
    marginBottom: 4,
  },
  taskContentText: {
    fontSize: 9,
    color: "#212529",
    lineHeight: 1.5,
  },
  // 구분선
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 6,
  },
  // 인용문
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#5D7AA5",
    paddingLeft: 8,
    marginVertical: 4,
    backgroundColor: "#f9f9f9",
    padding: 6,
  },
  blockquoteText: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic" as const,
    lineHeight: 1.4,
  },
  // 코드 블록
  codeBlock: {
    backgroundColor: "#f5f5f5",
    padding: 6,
    marginVertical: 4,
  },
  codeText: {
    fontSize: 8,
    fontFamily: "Courier",
    color: "#333",
  },
  // 페이지 번호
  pageNumber: {
    position: "absolute" as const,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center" as const,
    fontSize: 8,
    color: "#999",
  },
})

/**
 * 이모지 및 특수 유니코드 문자 제거
 */
function removeEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/[\u{231A}-\u{231B}]/gu, "")
    .replace(/[\u{23E9}-\u{23F3}]/gu, "")
    .replace(/[\u{23F8}-\u{23FA}]/gu, "")
    .replace(/[\u{25AA}-\u{25AB}]/gu, "")
    .replace(/[\u{25B6}]/gu, "")
    .replace(/[\u{25C0}]/gu, "")
    .replace(/[\u{25FB}-\u{25FE}]/gu, "")
    .replace(/[\u{2614}-\u{2615}]/gu, "")
    .replace(/[\u{2648}-\u{2653}]/gu, "")
    .replace(/[\u{267F}]/gu, "")
    .replace(/[\u{2693}]/gu, "")
    .replace(/[\u{26A1}]/gu, "")
    .replace(/[\u{26AA}-\u{26AB}]/gu, "")
    .replace(/[\u{26BD}-\u{26BE}]/gu, "")
    .replace(/[\u{26C4}-\u{26C5}]/gu, "")
    .replace(/[\u{26CE}]/gu, "")
    .replace(/[\u{26D4}]/gu, "")
    .replace(/[\u{26EA}]/gu, "")
    .replace(/[\u{26F2}-\u{26F3}]/gu, "")
    .replace(/[\u{26F5}]/gu, "")
    .replace(/[\u{26FA}]/gu, "")
    .replace(/[\u{26FD}]/gu, "")
    .replace(/[\u{2714}]/gu, "")  // ✔
    .replace(/[\u{2705}]/gu, "")  // ✅
    .trim()
}

/**
 * 인라인 마크다운 처리
 */
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim()
}

interface TaskInfo {
  label: string
  value: string
}

interface ParsedElement {
  type: "h1" | "h2" | "h3" | "h4" | "paragraph" | "list-item" | "ordered-item" | "table" | "divider" | "blockquote" | "code" | "task-info" | "task-content" | "task-card"
  content: string
  rows?: string[][]
  label?: string
  value?: string
  taskInfos?: TaskInfo[]  // 카드에 포함될 task-info 목록
}

/**
 * 마크다운을 파싱하여 구조화된 요소 배열로 변환
 */
function parseMarkdown(markdown: string): ParsedElement[] {
  const lines = removeEmojis(markdown).split("\n")
  const elements: ParsedElement[] = []
  let inCodeBlock = false
  let codeContent = ""
  let inTable = false
  let tableRows: string[][] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 코드 블록 처리
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push({ type: "code", content: codeContent.trim() })
        codeContent = ""
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += line + "\n"
      continue
    }

    // 빈 줄 처리
    if (line.trim() === "") {
      if (inTable && tableRows.length > 0) {
        elements.push({ type: "table", content: "", rows: tableRows })
        tableRows = []
        inTable = false
      }
      continue
    }

    // 구분선 (---)
    if (line.trim().match(/^-{3,}$/) || line.trim().match(/^\*{3,}$/) || line.trim().match(/^_{3,}$/)) {
      if (inTable && tableRows.length > 0) {
        continue
      }
      elements.push({ type: "divider", content: "" })
      continue
    }

    // 테이블 행 감지
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .map((cell) => cleanInlineMarkdown(cell.trim()))
        .filter((cell) => cell !== "")

      if (cells.every((cell) => cell.match(/^-+$/))) {
        continue
      }

      if (cells.length > 0) {
        inTable = true
        tableRows.push(cells)
      }
      continue
    }

    // 테이블이 끝났으면 저장
    if (inTable && tableRows.length > 0) {
      elements.push({ type: "table", content: "", rows: tableRows })
      tableRows = []
      inTable = false
    }

    // 헤더 처리
    if (line.startsWith("#### ")) {
      elements.push({ type: "h4", content: cleanInlineMarkdown(line.slice(5)) })
      continue
    }
    if (line.startsWith("### ")) {
      elements.push({ type: "h3", content: cleanInlineMarkdown(line.slice(4)) })
      continue
    }
    if (line.startsWith("## ")) {
      elements.push({ type: "h2", content: cleanInlineMarkdown(line.slice(3)) })
      continue
    }
    if (line.startsWith("# ")) {
      elements.push({ type: "h1", content: cleanInlineMarkdown(line.slice(2)) })
      continue
    }

    // 리스트 아이템
    const unorderedMatch = line.match(/^[-*]\s+(.+)/)
    if (unorderedMatch) {
      // **라벨:** 값 패턴 처리 (날짜, 상태 등)
      const labelMatch = unorderedMatch[1].match(/^\*\*(.+?):\*\*\s*(.*)/)
      if (labelMatch) {
        elements.push({
          type: "task-info",
          content: "",
          label: labelMatch[1],
          value: labelMatch[2] || "",
        })
      } else {
        elements.push({ type: "list-item", content: cleanInlineMarkdown(unorderedMatch[1]) })
      }
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)/)
    if (orderedMatch) {
      elements.push({ type: "ordered-item", content: cleanInlineMarkdown(orderedMatch[1]) })
      continue
    }

    // 인용문
    if (line.startsWith("> ")) {
      elements.push({ type: "blockquote", content: cleanInlineMarkdown(line.slice(2)) })
      continue
    }

    // **업무 내용:** 또는 업무 내용: 패턴
    if (line.match(/^\*\*업무\s*내용:\*\*\s*$/) || line.match(/^업무\s*내용:\s*$/)) {
      elements.push({ type: "task-content", content: "", label: "업무 내용" })
      continue
    }

    // 라벨: 값 형태의 단독 행
    const standaloneLabel = line.match(/^(.+?):\s*$/)
    if (standaloneLabel) {
      elements.push({ type: "paragraph", content: cleanInlineMarkdown(standaloneLabel[1]) + ":" })
      continue
    }

    // 일반 텍스트
    elements.push({ type: "paragraph", content: cleanInlineMarkdown(line) })
  }

  // 마지막 테이블 처리
  if (inTable && tableRows.length > 0) {
    elements.push({ type: "table", content: "", rows: tableRows })
  }

  // task-info 요소들을 task-card로 그룹화
  return groupTaskInfoIntoCards(elements)
}

/**
 * 연속된 task-info와 task-content를 task-card로 그룹화
 */
function groupTaskInfoIntoCards(elements: ParsedElement[]): ParsedElement[] {
  const result: ParsedElement[] = []
  let currentTaskInfos: TaskInfo[] = []
  let currentTaskContent: string | null = null

  const flushCard = () => {
    if (currentTaskInfos.length > 0) {
      result.push({
        type: "task-card",
        content: currentTaskContent || "",
        taskInfos: [...currentTaskInfos],
      })
      currentTaskInfos = []
      currentTaskContent = null
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]

    if (el.type === "task-info") {
      currentTaskInfos.push({
        label: el.label || "",
        value: el.value || "",
      })
    } else if (el.type === "task-content") {
      // task-content 다음의 paragraph가 실제 내용
      // 다음 요소 확인하여 내용 수집
      let contentText = ""
      let j = i + 1
      while (j < elements.length && (elements[j].type === "paragraph" || elements[j].type === "list-item")) {
        if (elements[j].type === "paragraph") {
          contentText += (contentText ? "\n" : "") + elements[j].content
        } else if (elements[j].type === "list-item") {
          contentText += (contentText ? "\n" : "") + "• " + elements[j].content
        }
        j++
      }
      currentTaskContent = contentText
      // 사용한 요소만큼 i 이동 (for 루프에서 i++가 되므로 -1)
      i = j - 1
      // 바로 카드 플러시
      flushCard()
    } else {
      // 다른 타입이 나오면 카드 플러시
      flushCard()
      result.push(el)
    }
  }

  // 마지막 카드 플러시
  flushCard()

  return result
}

/**
 * 파싱된 요소를 React-PDF 컴포넌트로 변환
 */
function renderElements(elements: ParsedElement[]): React.ReactElement[] {
  const result: React.ReactElement[] = []
  let orderedIndex = 1

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const key = `el-${i}`

    switch (el.type) {
      case "h1":
        orderedIndex = 1
        result.push(
          <Text key={key} style={styles.sectionTitle}>
            {el.content}
          </Text>
        )
        break

      case "h2":
        orderedIndex = 1
        result.push(
          <Text key={key} style={styles.subSectionTitle}>
            {el.content}
          </Text>
        )
        break

      case "h3":
      case "h4":
        orderedIndex = 1
        result.push(
          <Text key={key} style={styles.itemTitle}>
            {el.content}
          </Text>
        )
        break

      case "paragraph":
        orderedIndex = 1
        result.push(
          <Text key={key} style={styles.paragraph}>
            {el.content}
          </Text>
        )
        break

      case "list-item":
        result.push(
          <View key={key} style={styles.listItem} wrap={false}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>{el.content}</Text>
          </View>
        )
        break

      case "ordered-item":
        result.push(
          <View key={key} style={styles.listItem} wrap={false}>
            <Text style={styles.bullet}>{orderedIndex}.</Text>
            <Text style={styles.listItemText}>{el.content}</Text>
          </View>
        )
        orderedIndex++
        break

      case "task-card":
        // 카드 형태로 날짜, 상태, 업무내용 렌더링
        result.push(
          <View key={key} style={styles.taskCard} wrap={false}>
            {/* 업무 정보 테이블 (날짜, 상태 등) */}
            <View style={styles.taskTable}>
              {el.taskInfos?.map((info, idx) => (
                <View key={`task-info-${idx}`} style={styles.taskTableRow}>
                  <View style={styles.taskLabelCell}>
                    <Text style={styles.taskLabel}>{info.label}</Text>
                  </View>
                  <View style={styles.taskValueCell}>
                    <Text style={styles.taskValue}>{info.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 업무 내용 영역 */}
            {el.content && (
              <View style={styles.taskContentRow}>
                <Text style={styles.taskContentLabel}>업무 내용</Text>
                <Text style={styles.taskContentText}>{el.content}</Text>
              </View>
            )}
          </View>
        )
        break

      case "task-info":
        // groupTaskInfoIntoCards에서 처리되므로 여기서는 fallback
        result.push(
          <View key={key} style={styles.listItem} wrap={false}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>
              {el.label}: {el.value}
            </Text>
          </View>
        )
        break

      case "task-content":
        // groupTaskInfoIntoCards에서 처리되므로 여기서는 건너뜀
        break

      case "table":
        if (el.rows && el.rows.length > 0) {
          result.push(
            <View key={key} style={styles.table} wrap={false}>
              {el.rows.map((row, rowIdx) => (
                <View
                  key={`row-${rowIdx}`}
                  style={rowIdx === 0 ? styles.tableHeaderRow : styles.tableRow}
                >
                  {row.map((cell, cellIdx) => (
                    <Text
                      key={`cell-${cellIdx}`}
                      style={rowIdx === 0 ? styles.tableHeaderCell : styles.tableCell}
                    >
                      {cell}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )
        }
        break

      case "divider":
        result.push(<View key={key} style={styles.divider} />)
        break

      case "blockquote":
        result.push(
          <View key={key} style={styles.blockquote} wrap={false}>
            <Text style={styles.blockquoteText}>{el.content}</Text>
          </View>
        )
        break

      case "code":
        result.push(
          <View key={key} style={styles.codeBlock}>
            <Text style={styles.codeText}>{el.content}</Text>
          </View>
        )
        break
    }
  }

  return result
}

/**
 * PDF Document 컴포넌트
 */
interface ReportPdfDocumentProps {
  report: Report
}

function ReportPdfDocument({ report }: ReportPdfDocumentProps) {
  const elements = parseMarkdown(report.summary)
  const contentElements = renderElements(elements)
  const cleanTitle = removeEmojis(report.title)

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* 헤더 - 매 페이지 고정 */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>{cleanTitle}</Text>
          <Text style={styles.dateRange}>
            {formatLocalDate(report.startDate)} ~ {formatLocalDate(report.endDate)}
          </Text>
        </View>

        {/* 본문 */}
        <View style={styles.content}>{contentElements}</View>

        {/* 페이지 번호 */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

/**
 * 리포트를 PDF Blob으로 생성
 */
export async function generateReportPdfBlob(report: Report): Promise<Blob> {
  const doc = <ReportPdfDocument report={report} />
  const blob = await pdf(doc).toBlob()
  return blob
}

/**
 * 리포트를 PDF로 다운로드
 */
export async function downloadReportPdf(report: Report): Promise<void> {
  const blob = await generateReportPdfBlob(report)

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url

  const dateStr = formatLocalDate(report.startDate).replace(/-/g, "")
  link.download = `Report_${dateStr}.pdf`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
