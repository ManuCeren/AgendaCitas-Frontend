import { useEffect, useState, useMemo } from 'react';
import { Table, Form, Button, Pagination, Spinner, Alert } from 'react-bootstrap';
import { fetchClient } from '../../services/fetchClient';
import Sidebar from '../main/Sidebar';

export default function Telefonos() {
  const [telefonos, setTelefonos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [nuevoTelefono, setNuevoTelefono] = useState({
    id_paciente: '',
    codigo_pais: '503',
    numero: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar teléfonos
  useEffect(() => {
    setLoading(true);
    fetchClient<any[]>('/api/telefonos/', { method: 'GET' })
      .then((data) => setTelefonos(data))
      .catch((err) => {
        console.error('Error al cargar teléfonos:', err);
        setError('Error al cargar teléfonos');
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar pacientes
  useEffect(() => {
    fetchClient<any[]>('/api/pacientes/', { method: 'GET' })
      .then((data) => setPacientes(data))
      .catch((err) => {
        console.error('Error al cargar pacientes:', err);
        setError('Error al cargar pacientes');
      });
  }, []);

  const handleAgregarTelefono = async () => {
    try {
      const numeroCompleto = `+${nuevoTelefono.codigo_pais}${nuevoTelefono.numero}`;

      const payload = {
        id_paciente: nuevoTelefono.id_paciente,
        codigo_pais: `+${nuevoTelefono.codigo_pais}`,
        numero: nuevoTelefono.numero,
        numero_telefono: numeroCompleto, 
      };

      console.log('Payload:', payload);

      await fetchClient('/api/telefonos/add', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Teléfono agregado correctamente.');
      window.location.reload();
    } catch (err) {
      alert('Error al agregar teléfono');
      console.error(err);
    }
  };

  // Filtro y paginación
  const filteredTelefonos = useMemo(() => {
    return telefonos.filter((t) =>
      t.numero_telefono?.toLowerCase().includes(search.toLowerCase())
    );
  }, [telefonos, search]);

  const totalPages = Math.ceil(filteredTelefonos.length / itemsPerPage);
  const paginatedTelefonos = filteredTelefonos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">Gestión de Teléfonos</h2>

        {/* Buscador */}
        <div className="d-flex justify-content-between mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar por número..."
            className="w-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Agregar Teléfono */}
        <h5 className="mb-3">Agregar Teléfono</h5>
        <div className="mb-4">
          <div className="d-flex align-items-end gap-3 flex-wrap">
            {/* Código país */}
            <Form.Group>
              <Form.Label>Código País</Form.Label>
              <Form.Control
                type="text"
                value={nuevoTelefono.codigo_pais}
                onChange={(e) =>
                  setNuevoTelefono({ ...nuevoTelefono, codigo_pais: e.target.value })
                }
                style={{ width: '100px' }}
              />
            </Form.Group>

            {/* Número */}
            <Form.Group>
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="text"
                value={nuevoTelefono.numero}
                onChange={(e) =>
                  setNuevoTelefono({ ...nuevoTelefono, numero: e.target.value })
                }
                style={{ width: '200px' }}
              />
            </Form.Group>

            {/* Nombre */}
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Select
                value={nuevoTelefono.id_paciente}
                onChange={(e) =>
                  setNuevoTelefono({ ...nuevoTelefono, id_paciente: e.target.value })
                }
                style={{ width: '300px' }}
              >
                <option value="">Seleccione paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Botón agregar */}
            <Button variant="primary" onClick={handleAgregarTelefono}>
              Agregar
            </Button>
          </div>
        </div>

        {/* Tabla de Teléfonos */}
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código País</th>
                  <th>Número</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTelefonos.map((t) => {
                  // Dividir número completo
                  const match = t.numero_telefono.match(/^\+(\d+)(\d+)$/);
                  const codigo = match ? match[1] : '';
                  const numero = match ? match[2] : '';

                  // Buscar el nombre del paciente
                  const paciente = pacientes.find((p) => p.id_paciente === t.id_paciente);

                  return (
                    <tr key={t.id_telefono}>
                      <td>{t.id_telefono}</td>
                      <td>{codigo}</td>
                      <td>{numero}</td>
                      <td>{paciente ? paciente.nombre : ''}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2">Editar</button>
                        <button className="btn btn-sm btn-danger">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Paginación */}
            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
}
