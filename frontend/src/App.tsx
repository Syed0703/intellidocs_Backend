import { Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ProtectedRoute from "./components/ProtectedRoute"
import AskPage from "./pages/AskPage"
import AppLayout from "./components/AppLayout"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/ask" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/ask"
          element={<AskPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
      </Route>
    </Routes>
  )
}

export default App