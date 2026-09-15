import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { getCurrentUser } from "../api/auth"

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await getCurrentUser()

        setAuthenticated(response.ok)
      } catch {
        setAuthenticated(false)
      }
    }

    checkAuthentication()
  }, [])

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2]">
        <p className="text-sm text-[#707571]">
          Loading...
        </p>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute