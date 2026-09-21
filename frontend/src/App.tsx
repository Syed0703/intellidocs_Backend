import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AskPage from "./pages/AskPage";
import AppLayout from "./components/AppLayout";
import KnowledgeBasesPage from "./pages/KnowledgeBasesPage";
import DocumentsPage from "./pages/DocumentsPage";
import MembersPage from "./pages/MembersPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage/>}/>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/ask" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/ask" element={<AskPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/knowledge-bases" element={<KnowledgeBasesPage />} />

        <Route
          path="/knowledge-bases/:knowledgeBaseId/documents"
          element={<DocumentsPage />}
        />

        <Route path="/members" element={<MembersPage />} />
        
      </Route>
    </Routes>
  );
}

export default App;
