import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import { Header } from "../components/Header";
import { Inbox } from "../components/Inbox";
import { QueueDashboard } from "../components/QueueDashboard";
import { WeeklyPlanView } from "../components/WeeklyPlanView";
import { Sidebar } from "../components/Sidebar";

export function Dashboard() {
  const { t } = useTranslation();
  const { fetchAll, activeTab, setActiveTab } = useStore();

  // Fetch initial data
  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with tabs */}
        <Sidebar>
          <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${
                    activeTab === "inbox"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {t("sidebar.inbox", "Inbox")}
              </button>
              <button
                onClick={() => setActiveTab("queues")}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${
                    activeTab === "queues"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {t("sidebar.queues", "Queues")}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "inbox" ? <Inbox /> : <QueueDashboard />}
            </div>
          </div>
        </Sidebar>

        {/* Main content */}
        <WeeklyPlanView />
      </div>
    </div>
  );
}
