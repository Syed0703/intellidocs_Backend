import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

import { getOrganizations, type Organization } from "../api/organizations";

import { getCurrentUser, type CurrentUser } from "../api/auth";

function AppLayout() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [organizationsResponse, currentUserResponse] = await Promise.all([
          getOrganizations(),
          getCurrentUser(),
        ]);

        if (organizationsResponse.ok) {
          const data: Organization[] = await organizationsResponse.json();

          setOrganizations(data);

          if (data.length > 0) {
            setSelectedOrganization(data[0]);
          }
        }

        if (currentUserResponse.ok) {
          const user: CurrentUser = await currentUserResponse.json();

          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to load application data:", error);
      }
    };

    loadAppData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F6F2]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          organizations={organizations}
          selectedOrganization={selectedOrganization}
          currentUser={currentUser}
          onOrganizationChange={setSelectedOrganization}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet context={selectedOrganization} />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
