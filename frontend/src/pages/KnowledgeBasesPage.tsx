import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Organization } from "../api/organizations";
import {
  getKnowledgeBases,
  type KnowledgeBase,
  createKnowledgeBase,
} from "../api/knowledgeBases";
import { Plus } from "lucide-react";

function KnowledgeBasesPage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const navigate = useNavigate();

  const selectedOrganization = useOutletContext<Organization | null>();

  const handleCreateKnowledgeBase = async () => {
    if (!selectedOrganization) {
      setCreateError("Please select an organization");
      return;
    }

    if (!name.trim()) {
      setCreateError("Knowledge base name is required");
      return;
    }

    setCreateError("");
    setCreating(true);

    try {
      const response = await createKnowledgeBase(
        selectedOrganization.organizationId,
        {
          name: name.trim(),
          description: description.trim() || null,
        },
      );

      if (!response.ok) {
        setCreateError("Unable to create knowledge base");
        return;
      }

      const newKnowledgeBase: KnowledgeBase = await response.json();

      setKnowledgeBases((previous) => [...previous, newKnowledgeBase]);

      setName("");
      setDescription("");
      setShowCreateForm(false);
    } catch {
      setCreateError("Unable to connect to the server");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }

    const loadKnowledgeBases = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getKnowledgeBases(
          selectedOrganization.organizationId,
        );

        if (!response.ok) {
          setError("Unable to load knowledge bases");
          return;
        }

        const data: KnowledgeBase[] = await response.json();

        setKnowledgeBases(data);
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBases();
  }, [selectedOrganization]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">
            Knowledge Bases
          </h1>

          <p className="mt-2 text-sm text-[#707571]">
            Organize your organization's documents into knowledge collections.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D]"
        >
          <Plus size={17} />
          Create Knowledge Base
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 rounded-2xl border border-[#DFE1DC] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#202422]">
            Create Knowledge Base
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#303633]">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[#DCDDD8] px-4 py-2.5 text-sm outline-none focus:border-[#285C4D]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#303633]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#DCDDD8] px-4 py-2.5 text-sm outline-none focus:border-[#285C4D]"
              />
            </div>

            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setName("");
                  setDescription("");
                  setCreateError("");
                }}
                className="rounded-lg border border-[#DCDDD8] px-4 py-2 text-sm font-medium text-[#555B57] transition hover:bg-[#F5F5F1]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateKnowledgeBase}
                type="button"
                disabled={creating || !name.trim()}
                className="rounded-lg bg-[#285C4D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {knowledgeBases.map((knowledgeBase) => (
            <div
              key={knowledgeBase.knowledgeBaseId}
              className="rounded-2xl border border-[#DFE1DC] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-[#202422]">
                {knowledgeBase.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#707571]">
                {knowledgeBase.description || "No description provided"}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-[#EEEEEA] pt-4">
                <p className="text-xs text-[#8A8F8C]">
                  {new Date(knowledgeBase.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/knowledge-bases/${knowledgeBase.knowledgeBaseId}/documents`,
                    )
                  }
                  className="text-sm font-medium text-[#285C4D] hover:text-[#1F493D]"
                >
                  View Documents
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && knowledgeBases.length === 0 && (
        <p>No knowledge bases found.</p>
      )}
    </div>
  );
}

export default KnowledgeBasesPage;
