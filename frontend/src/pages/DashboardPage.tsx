import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquareText,
  Users,
} from "lucide-react";

import type { Organization } from "../api/organizations";

import { getKnowledgeBases, type KnowledgeBase } from "../api/knowledgeBases";

import { getMemberships } from "../api/memberships";

import { getDocuments, type DocumentResponse } from "../api/documents";

function DashboardPage() {
  const selectedOrganization = useOutletContext<Organization | null>();

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);

  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);

  const [documentCount, setDocumentCount] = useState(0);

  const [memberCount, setMemberCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedOrganization) return;

    const loadOverview = async () => {
      setLoading(true);
      setError("");

      // Clear old organization data
      setKnowledgeBases([]);
      setDocuments([]);
      setKnowledgeBaseCount(0);
      setDocumentCount(0);
      setMemberCount(0);

      try {
        const organizationId = selectedOrganization.organizationId;

        /*
         * Knowledge Bases and Members do not depend
         * on each other, so load them together.
         */
        const [knowledgeBaseResponse, membershipResponse] = await Promise.all([
          getKnowledgeBases(organizationId),
          getMemberships(organizationId),
        ]);

        if (!knowledgeBaseResponse.ok || !membershipResponse.ok) {
          setError("Unable to load overview");
          return;
        }

        const knowledgeBaseData: KnowledgeBase[] =
          await knowledgeBaseResponse.json();

        const membershipData = await membershipResponse.json();

        setKnowledgeBases(knowledgeBaseData);
        setKnowledgeBaseCount(knowledgeBaseData.length);

        setMemberCount(membershipData.length);

        /*
         * Documents belong to Knowledge Bases,
         * so load documents for every KB.
         */
        const documentResponses = await Promise.all(
          knowledgeBaseData.map((knowledgeBase) =>
            getDocuments(organizationId, knowledgeBase.knowledgeBaseId),
          ),
        );

        const failedDocumentRequest = documentResponses.some(
          (response) => !response.ok,
        );

        if (failedDocumentRequest) {
          setError("Unable to load overview");
          return;
        }

        const documentLists: DocumentResponse[][] = await Promise.all(
          documentResponses.map((response) => response.json()),
        );

        /*
         * Convert:
         *
         * [
         *   [doc1, doc2],
         *   [doc3],
         *   [doc4, doc5]
         * ]
         *
         * into:
         *
         * [doc1, doc2, doc3, doc4, doc5]
         */
        const allDocuments = documentLists.flat();

        setDocuments(allDocuments);
        setDocumentCount(allDocuments.length);
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedOrganization]);

  /*
   * Latest 3 Knowledge Bases
   */
  const recentKnowledgeBases = knowledgeBases
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  /*
   * Latest 5 Documents
   */
  const recentDocuments = documents
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  /*
   * Helper to display KB name
   * for a document.
   */
  const getKnowledgeBaseName = (knowledgeBaseId: number) => {
    return (
      knowledgeBases.find(
        (knowledgeBase) => knowledgeBase.knowledgeBaseId === knowledgeBaseId,
      )?.name ?? "Knowledge Base"
    );
  };

  /*
   * Document status styling
   */
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-green-50 text-green-700";

      case "PROCESSING":
        return "bg-amber-50 text-amber-700";

      case "FAILED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-[#F1F2EF] text-[#606662]";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-8 xl:px-12">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">Overview</h1>

          <p className="mt-2 text-sm text-[#707571]">
            An overview of{" "}
            <span className="font-medium text-[#4D534F]">
              {selectedOrganization?.organizationName ?? "your organization's"}
            </span>{" "}
            knowledge workspace.
          </p>
        </div>

        {/* Current Role */}
        {selectedOrganization && (
          <div className="w-fit rounded-full bg-[#EAF1ED] px-3 py-1.5 text-xs font-medium text-[#285C4D]">
            {selectedOrganization.role}
          </div>
        )}
      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="mt-8 rounded-xl border border-[#DFE1DC] bg-white p-6">
          <p className="text-sm text-[#707571]">Loading overview...</p>
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && selectedOrganization && (
        <>
          {/* ============== STAT CARDS ============== */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Knowledge Bases */}
            <div className="rounded-xl border border-[#DFE1DC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#707571]">Knowledge Bases</p>

                  <p className="mt-2 text-3xl font-semibold text-[#202422]">
                    {knowledgeBaseCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#285C4D]">
                  <BookOpen size={21} />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-[#DFE1DC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#707571]">Documents</p>

                  <p className="mt-2 text-3xl font-semibold text-[#202422]">
                    {documentCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#285C4D]">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="rounded-xl border border-[#DFE1DC] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#707571]">Members</p>

                  <p className="mt-2 text-3xl font-semibold text-[#202422]">
                    {memberCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#285C4D]">
                  <Users size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* ============== QUICK ACTIONS ============== */}

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#202422]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[#707571]">
              Jump into the most common IntelliDocs workflows.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {/* Ask AI */}
              <Link
                to="/ask"
                className="group rounded-xl border border-[#DFE1DC] bg-white p-5 transition hover:border-[#BFCBC5] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
                  <MessageSquareText size={20} />
                </div>

                <h3 className="mt-4 font-medium text-[#202422]">Ask AI</h3>

                <p className="mt-1 text-sm leading-6 text-[#707571]">
                  Ask questions grounded in your organization's documents.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#285C4D]">
                  Ask a question
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>

              {/* Knowledge Bases */}
              <Link
                to="/knowledge-bases"
                className="group rounded-xl border border-[#DFE1DC] bg-white p-5 transition hover:border-[#BFCBC5] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
                  <BookOpen size={20} />
                </div>

                <h3 className="mt-4 font-medium text-[#202422]">
                  Knowledge Bases
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#707571]">
                  Organize documents into searchable knowledge spaces.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#285C4D]">
                  Manage knowledge
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>

              {/* Members */}
              <Link
                to="/members"
                className="group rounded-xl border border-[#DFE1DC] bg-white p-5 transition hover:border-[#BFCBC5] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
                  <Users size={20} />
                </div>

                <h3 className="mt-4 font-medium text-[#202422]">Members</h3>

                <p className="mt-1 text-sm leading-6 text-[#707571]">
                  View people who have access to this organization.
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#285C4D]">
                  View members
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* ============== RECENT CONTENT ============== */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* Recent Knowledge Bases */}
            <div className="overflow-hidden rounded-xl border border-[#DFE1DC] bg-white">
              <div className="flex items-center justify-between border-b border-[#ECEDE9] px-5 py-4">
                <div>
                  <h2 className="font-semibold text-[#202422]">
                    Recent Knowledge Bases
                  </h2>

                  <p className="mt-1 text-sm text-[#707571]">
                    Recently created knowledge spaces.
                  </p>
                </div>

                <Link
                  to="/knowledge-bases"
                  className="text-sm font-medium text-[#285C4D] hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentKnowledgeBases.length === 0 ? (
                <div className="p-6 text-sm text-[#707571]">
                  No knowledge bases yet.
                </div>
              ) : (
                <div className="divide-y divide-[#ECEDE9]">
                  {recentKnowledgeBases.map((knowledgeBase) => (
                    <Link
                      key={knowledgeBase.knowledgeBaseId}
                      to={`/knowledge-bases/${knowledgeBase.knowledgeBaseId}/documents`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#FAFAF7]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#202422]">
                          {knowledgeBase.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-[#707571]">
                          {knowledgeBase.description || "No description"}
                        </p>
                      </div>

                      <div className="shrink-0 text-xs text-[#8A8F8B]">
                        {new Date(knowledgeBase.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Documents */}
            <div className="overflow-hidden rounded-xl border border-[#DFE1DC] bg-white">
              <div className="border-b border-[#ECEDE9] px-5 py-4">
                <h2 className="font-semibold text-[#202422]">
                  Recent Documents
                </h2>

                <p className="mt-1 text-sm text-[#707571]">
                  Recently uploaded organization files.
                </p>
              </div>

              {recentDocuments.length === 0 ? (
                <div className="p-6 text-sm text-[#707571]">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="divide-y divide-[#ECEDE9]">
                  {recentDocuments.map((document) => (
                    <Link
                      key={document.documentId}
                      to={`/knowledge-bases/${document.knowledgeBaseId}/documents`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#FAFAF7]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F0] text-[#606662]">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#202422]">
                            {document.originalFileName}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#8A8F8B]">
                            {getKnowledgeBaseName(document.knowledgeBaseId)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            document.status,
                          )}`}
                        >
                          {document.status}
                        </span>

                        <span className="hidden text-xs text-[#8A8F8B] sm:block">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
