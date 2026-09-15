import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { logout } from "../api/auth"
import { LogOut } from "lucide-react"

function DashboardPage() {
    const navigate  = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)

        try {
            const response = await logout();

            if(response.ok) {
                navigate("/login", {replace: true})
            }
        } catch (error) {
            console.log("Logout Failed")
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className="min-h-screen bg-[#F7F6F2] p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#202422]">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#285C4D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:opacity-60"
        >
          <LogOut size={17} />
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  )
}

export default DashboardPage