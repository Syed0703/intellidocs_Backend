import { useParams, useOutletContext } from "react-router-dom";
import type { Organization } from "../api/organizations";
import { useEffect, useState, useRef } from "react";
import {
  uploadDocument,
  deleteDocument,
  getDocuments,
  type DocumentResponse,
} from "../api/documents";
import { Trash2, Upload } from "lucide-react";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "READY":
      return "bg-[#E8F0EC] text-[#285C4D]";

    case "PROCESSING":
      return "bg-amber-50 text-amber-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

function DocumentsPage() {
  const { knowledgeBaseId } = useParams();
  const knowledgeBaseIdNumber = Number(knowledgeBaseId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const selectedOrganization = useOutletContext<Organization | null>();

  const handleDelete = async (documentId: number) => {
    if (!selectedOrganization || Number.isNaN(knowledgeBaseIdNumber)) {
      return;
    }

    setDeletingId(documentId);
    setDeleteError("");

    try {
      const response = await deleteDocument(
        selectedOrganization.organizationId,
        knowledgeBaseIdNumber,
        documentId,
      );

      if (!response.ok) {
        setDeleteError("");
        return;
      }

      setDocuments((previous) =>
        previous.filter((document) => document.documentId !== documentId),
      );
    } catch {
      setDeleteError("");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async () => {
    if (
      !selectedOrganization ||
      !selectedFile ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const response = await uploadDocument(
        selectedOrganization.organizationId,
        knowledgeBaseIdNumber,
        selectedFile,
      );

      if (!response.ok) {
        setUploadError("Unable to upload document");
        return;
      }

      const newDocument: DocumentResponse = await response.json();

      setDocuments((previous) => [...previous, newDocument]);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setUploadError("Unable to connect to the server");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (
      !selectedOrganization ||
      !knowledgeBaseId ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return;
    }

    const loadDocuments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDocuments(
          selectedOrganization.organizationId,
          knowledgeBaseIdNumber,
        );

        if (!response.ok) {
          setError("Unable to load documents");
          return;
        }

        const data: DocumentResponse[] = await response.json();

        setDocuments(data);
      } catch {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [selectedOrganization, knowledgeBaseId, knowledgeBaseIdNumber]);

  const hasProcessingDocuments = documents.some(
    (document) => document.status === "PROCESSING",
  );

  useEffect(() => {
    if (
      !hasProcessingDocuments ||
      !selectedOrganization ||
      Number.isNaN(knowledgeBaseIdNumber)
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await getDocuments(
          selectedOrganization.organizationId,
          knowledgeBaseIdNumber,
        );

        if (!response.ok) {
          return;
        }

        const data: DocumentResponse[] = await response.json();

        setDocuments(data);
      } catch {
        // Don't replace the page with an error just because polling failed once
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hasProcessingDocuments, selectedOrganization, knowledgeBaseIdNumber]);

  return (
    <div>
      <div className="mx-auto w-full max-w-[1400px] px-8 py-8 xl:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#202422]">Documents</h1>

            <p className="mt-2 text-sm text-[#707571]">
              Manage documents in this knowledge base.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="text-sm"
            />

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 rounded-lg bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={17} />
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
        </div>

        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}

        {deleteError && (
          <p className="mb-4 text-sm text-red-600">{deleteError}</p>
        )}

        {loading && <p>Loading documents...</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && documents.length === 0 && (
          <p>No documents found.</p>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.documentId}
                className="flex items-center justify-between rounded-xl border border-[#DFE1DC] bg-white p-4"
              >
                <div>
                  <p className="font-medium text-[#202422]">
                    {document.originalFileName}
                  </p>

                  <p className="mt-1 text-xs text-[#7B817D]">
                    {formatFileSize(document.fileSize)}
                    {" • "}
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      document.status,
                    )}`}
                  >
                    {document.status}
                  </span>

                  <button
                    onClick={() => handleDelete(document.documentId)}
                    disabled={
                      document.status === "PROCESSING" ||
                      deletingId === document.documentId
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
