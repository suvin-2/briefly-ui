"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#5D7AA5] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-3 prose-ol:my-3 prose-li:text-gray-700 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:border-[#5D7AA5] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-hr:border-gray-300 prose-hr:my-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
