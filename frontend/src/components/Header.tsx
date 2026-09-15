import { User } from "lucide-react"
import type { Organization } from "../api/organizations"

type HeaderProps = {
  organizations: Organization[]
  selectedOrganization: Organization | null
  onOrganizationChange: (organization: Organization) => void
}

function Header({
  organizations,
  selectedOrganization,
  onOrganizationChange,
}: HeaderProps) {
  const handleChange = (organizationId: string) => {
    const organization = organizations.find(
      (org) => org.organizationId === Number(organizationId)
    )

    if (organization) {
      onOrganizationChange(organization)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E5E0] bg-white px-8">

      {/* Organization */}
      <select
        value={selectedOrganization?.organizationId ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        disabled={organizations.length === 0}
        className="rounded-lg border border-[#E1E2DE] bg-white px-3 py-2 text-sm font-medium text-[#303633] outline-none transition focus:border-[#285C4D]"
      >
        {organizations.length === 0 && (
          <option value="">
            No organizations
          </option>
        )}

        {organizations.map((organization) => (
          <option
            key={organization.organizationId}
            value={organization.organizationId}
          >
            {organization.organizationName}
          </option>
        ))}
      </select>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-[#303633]">
            User
          </p>

          <p className="text-xs text-[#8A8E8B]">
            Signed in
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0EC] text-[#285C4D]">
          <User size={18} />
        </div>
      </div>
    </header>
  )
}

export default Header