import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Sidebar from './page/main/Sidebar';
import Dashboard from "./page/main/Dashboard";
import PacientesLista from "./page/main/Pacientes";
import AppRoute from "./routes/AppRoute";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user ? (
        <div className="d-flex">
          <Sidebar />
          <div className="flex-grow-1 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pacientes" element={<PacientesLista />} />
              
            </Routes>
          </div>
        </div>
      ) : (
        <AppRoute />
      )}
    </BrowserRouter>
  );
}
