import { Link } from 'react-router-dom';
import { FaHome, FaUserInjured, FaCalendarAlt, FaBell, FaPhoneAlt } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="d-flex flex-column p-3 bg-dark text-white vh-100" style={{ width: '250px' }}>
      <h4 className="mb-4">Agenda Citas</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-white">
            <FaHome className="me-2" />
            Inicio
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/pacientes" className="nav-link text-white">
            <FaUserInjured className="me-2" />
            Pacientes
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/citas" className="nav-link text-white">
            <FaCalendarAlt className="me-2" />
            Citas
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/telefonos" className="nav-link text-white">
            <FaPhoneAlt className="me-2" />
            Teléfonos
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/notificaciones" className="nav-link text-white">
            <FaBell className="me-2" />
            Notificaciones
          </Link>
        </li>
      </ul>
    </div>
  );
}

