import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"

import type { Organization } from "../api/organizations"

import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBases,
  updateKnowledgeBase,
  type KnowledgeBase,
} from "../api/knowledgeBases"

function KnowledgeBasesPage() {
  const selectedOrganization =
    useOutletContext<Organization | null>()

  const navigate = useNavigate()

  const [knowledgeBases, setKnowledgeBases] =
    useState<KnowledgeBase[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Search
  const [search, setSearch] = useState("")

  // =========================
  // CREATE
  // =========================

  const [showCreateModal, setShowCreateModal] =
    useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] =
    useState("")

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] =
    useState("")

  // =========================
  // EDIT
  // =========================

  const [
    knowledgeBaseToEdit,
    setKnowledgeBaseToEdit,
  ] = useState<KnowledgeBase | null>(null)

  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] =
    useState("")

  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState("")

  // =========================
  // DELETE
  // =========================

  const [
    knowledgeBaseToDelete,
    setKnowledgeBaseToDelete,
  ] = useState<KnowledgeBase | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] =
    useState("")

  const isAdmin =
    selectedOrganization?.role === "ADMIN"

  // =========================
  // LOAD KNOWLEDGE BASES
  // =========================

  useEffect(() => {
    if (!selectedOrganization) return

    const loadKnowledgeBases = async () => {
      setLoading(true)
      setError("")

      try {
        const response =
          await getKnowledgeBases(
            selectedOrganization.organizationId
          )

        if (!response.ok) {
          setError(
            "Unable to load knowledge bases"
          )
          return
        }

        const data: KnowledgeBase[] =
          await response.json()

        setKnowledgeBases(data)
      } catch {
        setError(
          "Unable to connect to the server"
        )
      } finally {
        setLoading(false)
      }
    }

    // Reset page-specific state when organization changes
    setSearch("")
    setShowCreateModal(false)
    setKnowledgeBaseToEdit(null)
    setKnowledgeBaseToDelete(null)

    loadKnowledgeBases()
  }, [selectedOrganization])

  // =========================
  // CREATE
  // =========================

  const handleCreateKnowledgeBase = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      !selectedOrganization ||
      !name.trim()
    ) {
      return
    }

    setCreating(true)
    setCreateError("")

    try {
      const response =
        await createKnowledgeBase(
          selectedOrganization.organizationId,
          {
            name: name.trim(),
            description:
              description.trim() || null,
          }
        )

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null)

        setCreateError(
          data?.message ||
            "Unable to create knowledge base"
        )

        return
      }

      const newKnowledgeBase: KnowledgeBase =
        await response.json()

      setKnowledgeBases((current) => [
        newKnowledgeBase,
        ...current,
      ])

      setName("")
      setDescription("")
      setShowCreateModal(false)
    } catch {
      setCreateError(
        "Unable to connect to the server"
      )
    } finally {
      setCreating(false)
    }
  }

  const handleCloseCreateModal = () => {
    if (creating) return

    setShowCreateModal(false)
    setName("")
    setDescription("")
    setCreateError("")
  }

  // =========================
  // EDIT
  // =========================

  const handleOpenEditModal = (
    knowledgeBase: KnowledgeBase
  ) => {
    setKnowledgeBaseToEdit(knowledgeBase)

    setEditName(knowledgeBase.name)

    setEditDescription(
      knowledgeBase.description ?? ""
    )

    setEditError("")
  }

  const handleCloseEditModal = () => {
    if (updating) return

    setKnowledgeBaseToEdit(null)
    setEditName("")
    setEditDescription("")
    setEditError("")
  }

  const handleUpdateKnowledgeBase = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      !selectedOrganization ||
      !knowledgeBaseToEdit ||
      !editName.trim()
    ) {
      return
    }

    setUpdating(true)
    setEditError("")

    try {
      const response =
        await updateKnowledgeBase(
          selectedOrganization.organizationId,
          knowledgeBaseToEdit.knowledgeBaseId,
          {
            name: editName.trim(),
            description:
              editDescription.trim() || null,
          }
        )

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null)

        setEditError(
          data?.message ||
            "Unable to update knowledge base"
        )

        return
      }

      const updatedKnowledgeBase: KnowledgeBase =
        await response.json()

      // Update only the edited KB in frontend state
      setKnowledgeBases((current) =>
        current.map((knowledgeBase) =>
          knowledgeBase.knowledgeBaseId ===
          updatedKnowledgeBase.knowledgeBaseId
            ? updatedKnowledgeBase
            : knowledgeBase
        )
      )

      handleCloseEditModal()
    } catch {
      setEditError(
        "Unable to connect to the server"
      )
    } finally {
      setUpdating(false)
    }
  }

  // =========================
  // DELETE
  // =========================

  const handleOpenDeleteModal = (
    knowledgeBase: KnowledgeBase
  ) => {
    setKnowledgeBaseToDelete(knowledgeBase)
    setDeleteError("")
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return

    setKnowledgeBaseToDelete(null)
    setDeleteError("")
  }

  const handleDeleteKnowledgeBase =
    async () => {
      if (
        !selectedOrganization ||
        !knowledgeBaseToDelete
      ) {
        return
      }

      setDeleting(true)
      setDeleteError("")

      try {
        const response =
          await deleteKnowledgeBase(
            selectedOrganization.organizationId,
            knowledgeBaseToDelete.knowledgeBaseId
          )

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null)

          setDeleteError(
            data?.message ||
              "Unable to delete knowledge base"
          )

          return
        }

        setKnowledgeBases((current) =>
          current.filter(
            (knowledgeBase) =>
              knowledgeBase.knowledgeBaseId !==
              knowledgeBaseToDelete.knowledgeBaseId
          )
        )

        setKnowledgeBaseToDelete(null)
      } catch {
        setDeleteError(
          "Unable to connect to the server"
        )
      } finally {
        setDeleting(false)
      }
    }

  // =========================
  // SEARCH
  // =========================

  const filteredKnowledgeBases =
    knowledgeBases
      .filter((knowledgeBase) => {
        const query =
          search.trim().toLowerCase()

        if (!query) return true

        return (
          knowledgeBase.name
            .toLowerCase()
            .includes(query) ||
          knowledgeBase.description
            ?.toLowerCase()
            .includes(query)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-8 xl:px-12">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">
            Knowledge Bases
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707571]">
            Organize your organization's documents
            into focused knowledge spaces for
            accurate AI-powered answers.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() =>
              setShowCreateModal(true)
            }
            className="flex w-fit items-center gap-2 rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D]"
          >
            <Plus size={18} />

            New Knowledge Base
          </button>
        )}
      </div>

      {/* ================= SUMMARY ================= */}

      {!loading &&
        !error &&
        selectedOrganization && (
          <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#DFE1DC] bg-white px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1ED] text-[#285C4D]">
              <BookOpen size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-[#202422]">
                {knowledgeBases.length}{" "}
                {knowledgeBases.length === 1
                  ? "knowledge base"
                  : "knowledge bases"}
              </p>

              <p className="mt-0.5 text-xs text-[#7A807C]">
                in{" "}
                {
                  selectedOrganization.organizationName
                }
              </p>
            </div>
          </div>
        )}

      {/* ================= SEARCH ================= */}

      {!loading &&
        !error &&
        knowledgeBases.length > 0 && (
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F8B]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search knowledge bases..."
                className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
              />
            </div>
          </div>
        )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="mt-8 rounded-xl border border-[#DFE1DC] bg-white p-8">
          <p className="text-sm text-[#707571]">
            Loading knowledge bases...
          </p>
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading &&
        !error &&
        knowledgeBases.length === 0 && (
          <div className="mt-8 flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CED2CD] bg-white px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1ED] text-[#285C4D]">
              <BookOpen size={26} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#202422]">
              No knowledge bases yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#707571]">
              Knowledge bases help organize related
              documents so IntelliDocs can retrieve
              more relevant information.
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(true)
                }
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D]"
              >
                <Plus size={17} />

                Create Knowledge Base
              </button>
            )}
          </div>
        )}

      {/* ============== NO SEARCH RESULTS ============== */}

      {!loading &&
        !error &&
        knowledgeBases.length > 0 &&
        filteredKnowledgeBases.length === 0 && (
          <div className="mt-8 rounded-xl border border-[#DFE1DC] bg-white p-10 text-center">
            <p className="font-medium text-[#202422]">
              No matching knowledge bases
            </p>

            <p className="mt-2 text-sm text-[#707571]">
              Try searching with a different name
              or description.
            </p>
          </div>
        )}

      {/* ================= GRID ================= */}

      {!loading &&
        !error &&
        filteredKnowledgeBases.length > 0 && (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredKnowledgeBases.map(
              (knowledgeBase) => (
                <div
                  key={
                    knowledgeBase.knowledgeBaseId
                  }
                  className="group flex min-h-[245px] flex-col rounded-2xl border border-[#DFE1DC] bg-white p-5 transition hover:border-[#C5CBC6] hover:shadow-sm"
                >

                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#285C4D]">
                      <BookOpen size={21} />
                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex items-center gap-1.5 text-xs text-[#8A8F8B]">
                        <CalendarDays size={14} />

                        {new Date(
                          knowledgeBase.createdAt
                        ).toLocaleDateString()}
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">

                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit knowledge base"
                            onClick={() =>
                              handleOpenEditModal(
                                knowledgeBase
                              )
                            }
                            className="rounded-lg p-2 text-[#707571] transition hover:bg-[#EEF2EF] hover:text-[#285C4D]"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete knowledge base"
                            onClick={() =>
                              handleOpenDeleteModal(
                                knowledgeBase
                              )
                            }
                            className="rounded-lg p-2 text-[#8A8F8B] transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-5 flex-1">
                    <h2 className="text-base font-semibold text-[#202422]">
                      {knowledgeBase.name}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#707571]">
                      {knowledgeBase.description ||
                        "No description provided for this knowledge base."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 border-t border-[#ECEDE9] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/knowledge-bases/${knowledgeBase.knowledgeBaseId}/documents`
                        )
                      }
                      className="flex w-full items-center justify-between text-sm font-medium text-[#285C4D]"
                    >
                      <span>
                        Open Documents
                      </span>

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {/* CREATE MODAL */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DFE1DC] bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#202422]">
                  Create Knowledge Base
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#707571]">
                  Create a focused space for related
                  organizational documents.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={creating}
                className="rounded-lg p-2 text-[#707571] transition hover:bg-[#F3F4F1]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleCreateKnowledgeBase}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-[#303633]">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. HR Policies"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm outline-none focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#303633]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe this knowledge base..."
                  className="w-full resize-none rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm outline-none focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={creating}
                  className="rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating || !name.trim()
                  }
                  className="rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Knowledge Base"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {knowledgeBaseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DFE1DC] bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#202422]">
                  Edit Knowledge Base
                </h2>

                <p className="mt-1 text-sm text-[#707571]">
                  Update the name or description.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={updating}
                className="rounded-lg p-2 text-[#707571] transition hover:bg-[#F3F4F1]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateKnowledgeBase
              }
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-[#303633]">
                  Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(
                      event.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm outline-none focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#303633]">
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#DCDDD8] bg-white px-4 py-3 text-sm outline-none focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                />
              </div>

              {editError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={updating}
                  className="rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    updating ||
                    !editName.trim()
                  }
                  className="rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*DELETE MODAL*/}

      {knowledgeBaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#DFE1DC] bg-white p-6 shadow-xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#202422]">
              Delete knowledge base?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#707571]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#202422]">
                {knowledgeBaseToDelete.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8A8F8B]">
              Knowledge bases containing documents
              cannot be deleted until their documents
              are removed.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium text-[#4B514D]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteKnowledgeBase
                }
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default KnowledgeBasesPage