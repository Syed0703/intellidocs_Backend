import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Link,
  useOutletContext,
  useParams,
} from "react-router-dom"

import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import type { Organization } from "../api/organizations"

import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type DocumentResponse,
} from "../api/documents"

const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusClasses(status: string) {
  switch (status) {
    case "READY":
      return "bg-[#E8F0EC] text-[#285C4D]"

    case "PROCESSING":
      return "bg-amber-50 text-amber-700"

    case "FAILED":
      return "bg-red-50 text-red-700"

    default:
      return "bg-gray-100 text-gray-600"
  }
}

function formatStatus(status: string) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  )
}

function DocumentsPage() {
  const { knowledgeBaseId } = useParams()

  const knowledgeBaseIdNumber = Number(
    knowledgeBaseId
  )

  const selectedOrganization =
    useOutletContext<Organization | null>()

  const isAdmin =
    selectedOrganization?.role === "ADMIN"

  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [documents, setDocuments] = useState<
    DocumentResponse[]
  >([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [uploading, setUploading] =
    useState(false)

  const [uploadError, setUploadError] =
    useState("")

  const [
    documentToDelete,
    setDocumentToDelete,
  ] = useState<DocumentResponse | null>(null)

  const [deleting, setDeleting] =
    useState(false)

  const [deleteError, setDeleteError] =
    useState("")

  // =========================
  // LOAD DOCUMENTS
  // =========================

  useEffect(() => {
    if (
      !selectedOrganization ||
      !knowledgeBaseId ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return
    }

    const loadDocuments = async () => {
      setLoading(true)
      setError("")
      setDocuments([])

      try {
        const response = await getDocuments(
          selectedOrganization.organizationId,
          knowledgeBaseIdNumber
        )

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null)

          setError(
            data?.message ||
              "Unable to load documents"
          )

          return
        }

        const data: DocumentResponse[] =
          await response.json()

        setDocuments(data)
      } catch {
        setError(
          "Unable to connect to the server"
        )
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [
    selectedOrganization,
    knowledgeBaseId,
    knowledgeBaseIdNumber,
  ])

  // =========================
  // PROCESSING POLLING
  // =========================

  const hasProcessingDocuments =
    documents.some(
      (document) =>
        document.status === "PROCESSING"
    )

  useEffect(() => {
    if (
      !hasProcessingDocuments ||
      !selectedOrganization ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await getDocuments(
          selectedOrganization.organizationId,
          knowledgeBaseIdNumber
        )

        if (!response.ok) {
          return
        }

        const data: DocumentResponse[] =
          await response.json()

        setDocuments(data)
      } catch {
        // Ignore temporary polling failures
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [
    hasProcessingDocuments,
    selectedOrganization,
    knowledgeBaseIdNumber,
  ])

  // =========================
  // FILE SELECTION
  // =========================

  const handleFileChange = (
    file: File | null
  ) => {
    if (!isAdmin) {
      return
    }

    setUploadError("")

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null)

      setUploadError(
        "Please select a PDF document"
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)

      setUploadError(
        "PDF must be smaller than 10 MB"
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      return
    }

    setSelectedFile(file)
  }

  // =========================
  // UPLOAD
  // =========================

  const handleUpload = async () => {
    if (
      !isAdmin ||
      !selectedOrganization ||
      !selectedFile ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      const response = await uploadDocument(
        selectedOrganization.organizationId,
        knowledgeBaseIdNumber,
        selectedFile
      )

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null)

        setUploadError(
          data?.message ||
            "Unable to upload document"
        )

        return
      }

      const newDocument: DocumentResponse =
        await response.json()

      setDocuments((previous) => [
        newDocument,
        ...previous,
      ])

      setSelectedFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch {
      setUploadError(
        "Unable to connect to the server"
      )
    } finally {
      setUploading(false)
    }
  }

  // =========================
  // DELETE
  // =========================

  const openDeleteModal = (
    document: DocumentResponse
  ) => {
    if (!isAdmin) {
      return
    }

    setDocumentToDelete(document)
    setDeleteError("")
  }

  const closeDeleteModal = () => {
    if (deleting) return

    setDocumentToDelete(null)
    setDeleteError("")
  }

  const handleDelete = async () => {
    if (
      !isAdmin ||
      !selectedOrganization ||
      !documentToDelete ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return
    }

    setDeleting(true)
    setDeleteError("")

    try {
      const response = await deleteDocument(
        selectedOrganization.organizationId,
        knowledgeBaseIdNumber,
        documentToDelete.documentId
      )

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null)

        setDeleteError(
          data?.message ||
            "Unable to delete document"
        )

        return
      }

      setDocuments((previous) =>
        previous.filter(
          (document) =>
            document.documentId !==
            documentToDelete.documentId
        )
      )

      setDocumentToDelete(null)
    } catch {
      setDeleteError(
        "Unable to connect to the server"
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-12">

      {/* Back */}
      <Link
        to="/knowledge-bases"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#707571] transition hover:text-[#285C4D]"
      >
        <ArrowLeft size={16} />
        Knowledge Bases
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#202422]">
            Documents
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#707571]">
            {isAdmin
              ? "Upload and manage PDFs used by IntelliDocs to answer questions from this knowledge base."
              : "View documents available to IntelliDocs in this knowledge base."}
          </p>
        </div>

        {!loading && !error && (
          <div className="w-fit rounded-lg bg-[#EEF3F0] px-3 py-1.5 text-xs font-medium text-[#285C4D]">
            {documents.length}{" "}
            {documents.length === 1
              ? "document"
              : "documents"}
          </div>
        )}
      </div>

      {/* =========================
          ADMIN-ONLY UPLOAD
          ========================= */}

      {isAdmin && (
        <div className="mt-7 rounded-2xl border border-[#DFE1DC] bg-white p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

            <div className="shrink-0">
              <h2 className="font-semibold text-[#202422]">
                Upload document
              </h2>

              <p className="mt-1 text-sm text-[#707571]">
                PDF files only, up to 10 MB.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(event) =>
                  handleFileChange(
                    event.target.files?.[0] ??
                      null
                  )
                }
                className="hidden"
              />

              {/* Choose File */}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[#DCDDD8] bg-white px-4 text-left text-sm text-[#555B57] transition hover:border-[#A9BDB5] disabled:opacity-50 sm:w-[225px]"
              >
                <FileText
                  size={17}
                  className="shrink-0 text-[#285C4D]"
                />

                <span className="min-w-0 flex-1 truncate">
                  {selectedFile
                    ? selectedFile.name
                    : "Choose PDF"}
                </span>
              </button>

              {/* Upload */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={
                  !selectedFile || uploading
                }
                className="flex h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#285C4D] px-5 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[125px]"
              >
                {uploading ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Upload size={17} />
                )}

                {uploading
                  ? "Uploading..."
                  : "Upload PDF"}
              </button>
            </div>
          </div>

          {selectedFile && (
            <p className="mt-3 break-all text-xs text-[#8A8F8B]">
              Selected: {selectedFile.name} ·{" "}
              {formatFileSize(selectedFile.size)}
            </p>
          )}

          {uploadError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* =========================
          LOADING
          ========================= */}

      {loading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex h-[82px] animate-pulse items-center rounded-xl border border-[#DFE1DC] bg-white px-5"
            >
              <div className="h-10 w-10 rounded-lg bg-[#ECEEEA]" />

              <div className="ml-4 flex-1">
                <div className="h-4 w-48 max-w-full rounded bg-[#ECEEEA]" />

                <div className="mt-2 h-3 w-28 rounded bg-[#F0F1EE]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          ERROR
          ========================= */}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          EMPTY
          ========================= */}

      {!loading &&
        !error &&
        documents.length === 0 && (
          <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CED2CD] bg-white px-6 py-10 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1ED] text-[#285C4D]">
              <FileText size={25} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#202422]">
              No documents yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#707571]">
              {isAdmin
                ? "Upload your first PDF to make its content available for AI-powered questions."
                : "No documents have been uploaded to this knowledge base yet."}
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8DCD7] bg-white px-4 py-2.5 text-sm font-medium text-[#285C4D] transition hover:bg-[#F7F9F7] sm:w-fit"
              >
                <Upload size={17} />
                Choose PDF
              </button>
            )}
          </div>
        )}

      {/* =========================
          DOCUMENT LIST
          ========================= */}

      {!loading &&
        !error &&
        documents.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#DFE1DC] bg-white">

            <div className="border-b border-[#ECEDE9] px-4 py-4 sm:px-5">
              <h2 className="font-semibold text-[#202422]">
                Uploaded documents
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#707571]">
                Documents are processed and indexed
                automatically after upload.
              </p>
            </div>

            <div className="divide-y divide-[#ECEDE9]">
              {documents.map((document) => (
                <div
                  key={document.documentId}
                  className="flex flex-col justify-between gap-4 px-4 py-4 transition hover:bg-[#FAFAF8] sm:flex-row sm:items-center sm:px-5"
                >

                  {/* File */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#285C4D]">
                      <FileText size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#202422]">
                        {
                          document.originalFileName
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#7B817D]">
                        {formatFileSize(
                          document.fileSize
                        )}
                        {" · "}
                        {new Date(
                          document.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">

                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        document.status
                      )}`}
                    >
                      {document.status ===
                        "PROCESSING" && (
                        <LoaderCircle
                          size={12}
                          className="animate-spin"
                        />
                      )}

                      {formatStatus(
                        document.status
                      )}
                    </span>

                    {/* ADMIN ONLY */}
                    {isAdmin && (
                      <button
                        type="button"
                        aria-label={`Delete ${document.originalFileName}`}
                        onClick={() =>
                          openDeleteModal(document)
                        }
                        disabled={
                          document.status ===
                          "PROCESSING"
                        }
                        title={
                          document.status ===
                          "PROCESSING"
                            ? "Wait for processing to finish"
                            : "Delete document"
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8A8F8B] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* =========================
          ADMIN DELETE MODAL
          ========================= */}

      {isAdmin && documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-4 sm:items-center">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#DFE1DC] bg-white p-5 shadow-xl sm:p-6">

            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                aria-label="Close"
                className="rounded-lg p-2 text-[#8A8F8B] transition hover:bg-[#F3F4F1]"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#202422]">
              Delete document?
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-[#707571]">
              This will permanently remove{" "}
              <span className="font-medium text-[#202422]">
                {
                  documentToDelete.originalFileName
                }
              </span>{" "}
              and its indexed content.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="w-full rounded-xl border border-[#D8DCD7] px-4 py-2.5 text-sm font-medium text-[#4B514D] sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
              >
                {deleting && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

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

export default DocumentsPage