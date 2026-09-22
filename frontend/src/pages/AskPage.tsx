import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUp,
  FileText,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import type { Organization } from "../api/organizations";
import { askQuestion, type RagResponse } from "../api/rag";

function AskPage() {
  const selectedOrganization = useOutletContext<Organization | null>();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<RagResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear previous organization's conversation
  useEffect(() => {
    setQuestion("");
    setAnswer(null);
    setError("");
  }, [selectedOrganization?.organizationId]);

  const handleAsk = async () => {
    if (!selectedOrganization) {
      setError("Please select an organization");
      return;
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question");
      return;
    }

    setError("");
    setLoading(true);
    setAnswer(null);

    try {
      const response = await askQuestion(
        selectedOrganization.organizationId,
        trimmedQuestion,
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setError(data?.message || "Unable to get an answer right now");

        return;
      }

      const data: RagResponse = await response.json();

      setAnswer(data);
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAsk();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col px-6 py-8 lg:px-8 xl:px-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#285C4D]">
          <MessageSquareText size={16} />
          Ask AI
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#202422]">
          Ask your organization
        </h1>

        <p className="mt-2 text-sm text-[#707571]">
          Get answers grounded in your uploaded documents.
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto mt-10 w-full max-w-3xl pb-12">
        {/* Intro */}
        {!answer && (
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0EC] text-[#285C4D]">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#202422]">
              What would you like to know?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#707571]">
              Ask about policies, procedures, guidelines, or any information
              stored in your organization's documents.
            </p>
          </div>
        )}

        {/* Question */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-[#DFE1DC] bg-white p-3 shadow-sm transition focus-within:border-[#88A89D] focus-within:shadow-md">
            <textarea
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your organization's documents..."
              rows={answer ? 3 : 4}
              disabled={loading}
              className="w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-6 text-[#202422] outline-none placeholder:text-[#9A9E9B] disabled:opacity-70"
            />

            <div className="flex items-center justify-between border-t border-[#EEEEEA] px-2 pt-3">
              <div>
                <p className="text-xs text-[#909591]">
                  Answers are generated from your documents
                </p>

                <p className="mt-0.5 hidden text-[11px] text-[#A0A4A1] sm:block">
                  Ctrl + Enter to ask
                </p>
              </div>

              <button
                type="submit"
                aria-label="Ask question"
                disabled={loading || !selectedOrganization || !question.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#285C4D] text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-[#DFE1DC] bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#285C4D]">
                <LoaderCircle size={18} className="animate-spin" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#303633]">
                  Searching your documents
                </p>

                <p className="mt-1 text-xs text-[#8A8F8C]">
                  Finding relevant information and preparing an answer...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#DFE1DC] bg-white shadow-sm">
            {/* Answer Header */}
            <div className="flex items-center gap-3 border-b border-[#EEEEEA] px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EC] text-[#285C4D]">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#303633]">
                  IntelliDocs
                </p>

                <p className="text-xs text-[#8A8F8C]">
                  Answer based on your documents
                </p>
              </div>
            </div>

            {/* Answer Text */}
            <div className="px-6 py-5">
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#303633]">
                {answer.answer}
              </p>
            </div>

            {/* Sources */}
            {answer.sources.length > 0 && (
              <div className="border-t border-[#EEEEEA] bg-[#FAFAF8] px-6 py-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7D837F]">
                  Sources · {answer.sources.length}
                </p>

                <div className="space-y-2">
                  {answer.sources.map((source, index) => (
                    <div
                      key={`${source.documentName}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-[#E5E7E3] bg-white px-4 py-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#285C4D]">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#303633]">
                          {source.documentName}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#7B817D]">
                          {source.knowledgeBaseName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {!answer && !loading && (
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
        )}
      </div>
    </div>
  );
}

type SuggestionProps = {
  text: string;
  onClick: (text: string) => void;
};

function Suggestion({ text, onClick }: SuggestionProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="rounded-xl border border-[#E2E3DF] bg-white px-4 py-3 text-left text-sm leading-5 text-[#555B57] transition hover:border-[#A9BDB5] hover:bg-[#FDFDFC] hover:text-[#285C4D]"
    >
      {text}
    </button>
  );
}

export default AskPage;
