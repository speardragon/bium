import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { GuidePage } from "./pages/GuidePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/guide" element={<GuidePage />} />
    </Routes>
  );
}

export default App;
