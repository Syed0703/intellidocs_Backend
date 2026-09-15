import { useState } from "react"
import { ArrowUp, Sparkles } from "lucide-react"
import { useOutletContext } from "react-router-dom"
import type { Organization } from "../api/organizations"

function AskPage() {
  const [question, setQuestion] = useState("")

  const selectedOrganization = useOutletContext<Organization | null>()
  console.log(selectedOrganization)

  return (
        <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-8 py-8 xl:px-12">

          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#285C4D]">
                IntelliDocs
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#202422]">
                Ask your organization
              </h1>
            </div>

            {/* Temporary organization selector */}
            <button className="rounded-lg border border-[#E1E2DE] bg-white px-4 py-2 text-sm font-medium text-[#303633] shadow-sm">
              Organization
            </button>
          </header>

          {/* Main Ask Area */}
          <div className="flex flex-1 flex-col items-center justify-center pb-24">
            <div className="w-full max-w-3xl">

              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0EC] text-[#285C4D]">
                  <Sparkles size={23} />
                </div>

                <h2 className="text-3xl font-semibold tracking-tight text-[#202422]">
                  What would you like to know?
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#707571]">
                  Ask questions about your organization's policies,
                  documents, procedures, and internal knowledge.
                </p>
              </div>

              {/* Question box */}
              <div className="rounded-2xl border border-[#DFE1DC] bg-white p-3 shadow-sm transition focus-within:border-[#88A89D] focus-within:shadow-md">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask anything about your organization..."
                  rows={4}
                  className="w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-6 text-[#202422] outline-none placeholder:text-[#9A9E9B]"
                />

                <div className="flex items-center justify-between border-t border-[#EEEEEA] px-2 pt-3">
                  <p className="text-xs text-[#909591]">
                    Answers are generated from your documents
                  </p>

                  <button
                    disabled={!question.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#285C4D] text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-7">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#8A8F8C]">
                  Try asking
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Suggestion
                    text="What is our leave policy?"
                    onClick={setQuestion}
                  />

                  <Suggestion
                    text="What is the travel reimbursement policy?"
                    onClick={setQuestion}
                  />

                  <Suggestion
                    text="Explain the employee onboarding process."
                    onClick={setQuestion}
                  />

                  <Suggestion
                    text="What documents are required for reimbursement?"
                    onClick={setQuestion}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
  )
}

type SuggestionProps = {
  text: string
  onClick: (text: string) => void
}

function Suggestion({ text, onClick }: SuggestionProps) {
  return (
    <button
      onClick={() => onClick(text)}
      className="rounded-xl border border-[#E2E3DF] bg-white px-4 py-3 text-left text-sm text-[#555B57] transition hover:border-[#A9BDB5] hover:bg-[#FDFDFC] hover:text-[#285C4D]"
    >
      {text}
    </button>
  )
}

export default AskPage