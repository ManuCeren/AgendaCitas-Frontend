import { useEffect, useState, useMemo } from 'react';
import { Table, Form, Button, Pagination, Alert } from 'react-bootstrap';
import { fetchClient } from '../../services/fetchClient';
import Sidebar from '../main/Sidebar';
import { useNotificaciones } from '../../hook/useNotificaciones';

export default function Notificaciones() {
    const { notificaciones, loading, error } = useNotificaciones();

    const [citas, setCitas] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [nuevaNotificacion, setNuevaNotificacion] = useState({
    id_cita: '',
    fecha_envio: '',
    medio: 'Email',
    estado: 'Pendiente',
    });

    const [errorCitas, setErrorCitas] = useState<string | null>(null);

    // Cargar citas para combo
    useEffect(() => {
    fetchClient<any[]>('/api/citas/', { method: 'GET' })
        .then((data) => setCitas(data))
        .catch((err) => {
        console.error('Error al cargar citas:', err);
        setErrorCitas('Error al cargar citas');
        });
    }, []);



  const handleEnviarNotificacion = async () => {
    try {
      const payload = {
        id_cita: nuevaNotificacion.id_cita,
        fecha_envio: nuevaNotificacion.fecha_envio,
        medio: nuevaNotificacion.medio,
        estado: nuevaNotificacion.estado,
      };

      console.log('Payload que se envía:', payload);

      await fetchClient('/api/notificaciones/add', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Notificación enviada correctamente.');
      window.location.reload();
    } catch (err) {
      alert('Error al enviar notificación');
      console.error(err);
    }
  };

  const filteredNotificaciones = useMemo(() => {
    return notificaciones.filter((n) =>
      n.id_cita?.toLowerCase().includes(search.toLowerCase())
    );
  }, [notificaciones, search]);

  const totalPages = Math.ceil(filteredNotificaciones.length / itemsPerPage);
  const paginatedNotificaciones = filteredNotificaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">Enviar Notificación</h2>

        {/* Buscar Consulta */}
        <Form.Group className="mb-3">
          <Form.Label>Buscar Consulta:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Buscar por ID o fecha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Form.Group>

        {/* Fecha de Envío */}
        <Form.Group className="mb-3">
          <Form.Label>Fecha de Envío:</Form.Label>
          <Form.Control
            type="date"
            value={nuevaNotificacion.fecha_envio}
            onChange={(e) =>
              setNuevaNotificacion({ ...nuevaNotificacion, fecha_envio: e.target.value })
            }
          />
        </Form.Group>

        {/* Combo de consulta */}
        <Form.Group className="mb-3">
          <Form.Label>Seleccione Consulta:</Form.Label>
          <Form.Select
            value={nuevaNotificacion.id_cita}
            onChange={(e) =>
              setNuevaNotificacion({ ...nuevaNotificacion, id_cita: e.target.value })
            }
          >
            <option value="">-- Seleccione una consulta --</option>
            {citas.map((c) => (
              <option key={c.id_cita} value={c.id_cita}>
                {c.id_cita} - {new Date(c.fecha_hora).toLocaleDateString()}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Medio */}
        <Form.Group className="mb-3">
          <Form.Label>Medio:</Form.Label>
          <Form.Select
            value={nuevaNotificacion.medio}
            onChange={(e) =>
              setNuevaNotificacion({ ...nuevaNotificacion, medio: e.target.value })
            }
          >
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
          </Form.Select>
        </Form.Group>

        <Button variant="success" onClick={handleEnviarNotificacion}>
          Enviar Notificación
        </Button>

        {/* Errores */}
        {errorCitas && (
          <Alert variant="danger" className="mt-3">
            {errorCitas}
          </Alert>
        )}
        {loading && (
          <p className="mt-3">Cargando notificaciones...</p>
        )}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Historial de notificaciones */}
        <h4 className="mt-5 mb-3">
          Historial de Notificaciones Enviadas y Recibidas con Estado de Entrega
        </h4>

        {notificaciones.length === 0 ? (
          <p>No se encontraron notificaciones.</p>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Consulta</th>
                  <th>Fecha de Envío</th>
                  <th>Medio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNotificaciones.map((n) => (
                   <tr key={n.id_notificacion}>
                    <td>{n.id_notificacion}</td>
                    <td>{n.id_cita}</td>
                    <td>
                      {n.fecha_envio
                        ? new Date(n.fecha_envio).toLocaleDateString()
                        : ''}
                    </td>
                    <td>{n.medio}</td>
                    <td>{n.estado}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2">Editar</button>
                      <button className="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                  </tr>
                ))}
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
