import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Land from "./pages/Land";
import Plans from "./pages/Plans";
import PropertyDetails from "./pages/PropertyDetails";
import ListProperty from "./pages/ListProperty";
import AgentPrivateProfile from "./pages/AgentPrivateProfile";

import Agents from "./pages/Agents";
import AgentPublicProfile from "./pages/AgentPublicProfile";

import AdminProperties from "./pages/AdminProperties";
import AdminAgents from "./pages/AdminAgents";

import AgentMessages from "./pages/AgentMessages";
import AgentDashboard from "./pages/AgentDashboard";

import AgentRegister from "./pages/AgentRegister";
import AgentLogin from "./pages/AgentLogin";

import AdminDashboard from "./pages/AdminDashboard";

import ProtectedAgentRoute from "./components/ProtectedAgentRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import EditProperty from "./pages/EditProperty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}

        <Route path="/" element={<Home />} />

        <Route path="/buy" element={<Buy />} />

        <Route path="/rent" element={<Rent />} />

        <Route path="/land" element={<Land />} />

        <Route path="/property/:id" element={<PropertyDetails />} />

        {/* PUBLIC AGENTS */}

        <Route path="/agents" element={<Agents />} />

        <Route path="/agents/:id" element={<AgentPublicProfile />} />

        {/* AGENT AUTHENTICATION */}

        <Route path="/agent/register" element={<AgentRegister />} />

        <Route path="/agent/login" element={<AgentLogin />} />

        {/* PROTECTED AGENT AREA */}

        <Route element={<ProtectedAgentRoute />}>
          <Route path="/agent" element={<AgentDashboard />} />

          <Route path="/agent/messages" element={<AgentMessages />} />

          <Route path="/list-property" element={<ListProperty />} />

          <Route path="/agent/edit-property/:id" element={<EditProperty />} />

          <Route path="/agent/profile/:id" element={<AgentPrivateProfile />} />

          <Route path="/plans" element={<Plans />} />
        </Route>

        {/* PROTECTED ADMIN AREA */}

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/properties" element={<AdminProperties />} />

          <Route path="/admin/agents" element={<AdminAgents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
