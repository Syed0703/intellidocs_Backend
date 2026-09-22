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

  const [memberCount, setMemberCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedOrganization) return;

    const loadOverview = async () => {
      setLoading(true);
      setError("");

      // Prevent old organization data appearing
      // while the new workspace is loading.
      setKnowledgeBases([]);
      setDocuments([]);
      setMemberCount(0);

      try {
        const organizationId = selectedOrganization.organizationId;

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
        setMemberCount(membershipData.length);

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

        setDocuments(documentLists.flat());
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedOrganization]);

  const recentKnowledgeBases = knowledgeBases
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const recentDocuments = documents
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const getKnowledgeBaseName = (knowledgeBaseId: number) =>
    knowledgeBases.find(
      (knowledgeBase) => knowledgeBase.knowledgeBaseId === knowledgeBaseId,
    )?.name ?? "Knowledge Base";

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

  const formatStatus = (status: string) =>
    status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8 xl:px-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#202422]">Overview</h1>

        <p className="mt-2 text-sm leading-6 text-[#707571]">
          A snapshot of{" "}
          <span className="font-medium text-[#4D534F]">
            {selectedOrganization?.organizationName ?? "your organization's"}
          </span>{" "}
          knowledge workspace.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[116px] animate-pulse rounded-xl border border-[#DFE1DC] bg-white p-5"
            >
              <div className="h-4 w-28 rounded bg-[#ECEEEA]" />
              <div className="mt-4 h-8 w-14 rounded bg-[#ECEEEA]" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && selectedOrganization && (
        <>
          {/* Statistics */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Knowledge Bases"
              value={knowledgeBases.length}
              icon={<BookOpen size={21} />}
            />

            <StatCard
              title="Documents"
              value={documents.length}
              icon={<FileText size={21} />}
            />

            <StatCard
              title="Members"
              value={memberCount}
              icon={<Users size={21} />}
            />
          </div>

          {/* Quick Actions */}
          <section className="mt-9">
            <h2 className="text-lg font-semibold text-[#202422]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[#707571]">
              Jump into common IntelliDocs workflows.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <QuickAction
                to="/ask"
                icon={<MessageSquareText size={20} />}
                title="Ask AI"
                description="Ask questions grounded in your organization's documents."
                action="Ask a question"
              />

              <QuickAction
                to="/knowledge-bases"
                icon={<BookOpen size={20} />}
                title="Knowledge Bases"
                description="Organize documents into focused, searchable knowledge spaces."
                action="Manage knowledge"
              />

              <QuickAction
                to="/members"
                icon={<Users size={20} />}
                title="Members"
                description="View and manage access to this organization."
                action="View members"
              />
            </div>
          </section>

          {/* Recent Content */}
          <section className="mt-9 grid gap-6 xl:grid-cols-2">
            {/* Knowledge Bases */}
            <div className="overflow-hidden rounded-xl border border-[#DFE1DC] bg-white">
              <div className="flex items-start justify-between gap-4 border-b border-[#ECEDE9] px-5 py-4">
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
                  className="shrink-0 text-sm font-medium text-[#285C4D] hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentKnowledgeBases.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <BookOpen size={22} className="mx-auto text-[#A0A5A1]" />

                  <p className="mt-3 text-sm text-[#707571]">
                    No knowledge bases yet.
                  </p>
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
                        <p className="truncate text-sm font-medium text-[#202422]">
                          {knowledgeBase.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-[#707571]">
                          {knowledgeBase.description || "No description"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-[#8A8F8B]">
                        {new Date(knowledgeBase.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
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
                <div className="px-5 py-8 text-center">
                  <FileText size={22} className="mx-auto text-[#A0A5A1]" />

                  <p className="mt-3 text-sm text-[#707571]">
                    No documents uploaded yet.
                  </p>
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
                          {formatStatus(document.status)}
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
          </section>
        </>
      )}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#DFE1DC] bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#707571]">{title}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#202422]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#285C4D]">
          {icon}
        </div>
      </div>
    </div>
  );
}

type QuickActionProps = {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
};

function QuickAction({
  to,
  icon,
  title,
  description,
  action,
}: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-[#DFE1DC] bg-white p-5 transition hover:border-[#BFCBC5] hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
        {icon}
      </div>

      <h3 className="mt-4 font-medium text-[#202422]">{title}</h3>

      <p className="mt-1 flex-1 text-sm leading-6 text-[#707571]">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#285C4D]">
        {action}

        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

export default DashboardPage;
