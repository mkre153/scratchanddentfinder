'use client'

const QUESTIONS = [
  'What is scratch and dent?',
  'How much can I save?',
  'What should I inspect before buying?',
  'Do these appliances have warranties?',
]

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2 p-4">
      <p className="text-xs font-medium text-gray-500">Common questions</p>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-sage-300 hover:bg-sage-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
