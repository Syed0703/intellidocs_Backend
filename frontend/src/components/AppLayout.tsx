import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"
import Header from "./Header";
import { getOrganizations, type Organization } from "../api/organizations";

function AppLayout() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await getOrganizations();

        if (!response.ok) {
          console.error("Failed to load organizations");
          return;
        }

        const data: Organization[] = await response.json();

        setOrganizations(data);

        if (data.length > 0) {
          setSelectedOrganization(data[0]);
        }
      } catch (error) {
        console.error("Failed to load organizations:", error);
      }
    };

    loadOrganizations();
  }, []);
  
  return (
    <div className="flex min-h-screen bg-[#F7F6F2]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          organizations={organizations}
          selectedOrganization={selectedOrganization}
          onOrganizationChange={setSelectedOrganization}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={selectedOrganization}/>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
