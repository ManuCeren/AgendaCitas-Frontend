import { useCitas } from "../../hook/useCitas";
import { useState, useMemo, useEffect } from "react";
import { Table, Form, Pagination, Spinner, Alert, Button, Modal } from "react-bootstrap";
import Sidebar from "../main/Sidebar";
import { fetchClient } from "../../services/fetchClient";

export default function Citas() {
    const { citas, loading, error } = useCitas();    // ✅ Hook correcto
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [citaAEliminar, setCitaAEliminar] = useState<any | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [citaActual, setCitaActual] = useState<any | null>(null);
    const [nuevaCita, setNuevaCita] = useState({
        id_paciente: "",
        fecha_hora: "",
        motivo: "",
        estado: "Programada",
    });

    const [pacientes, setPacientes] = useState<any[]>([]); 

    useEffect(() => {
        fetchClient<any[]>('/api/pacientes/', { method: 'GET' })
            .then(data => setPacientes(data))
            .catch(err => console.error('Error al cargar pacientes:', err));
    }, []);

  
    const handleOpenModal = () => {
        setCitaActual(null);
        setNuevaCita({
            id_paciente: "",
            fecha_hora: "",
            motivo: "",
            estado: "Programada",
        });
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleChange = (e: React.ChangeEvent<any>) => {
        setNuevaCita({ ...nuevaCita, [e.target.name]: e.target.value });
    };

    const handleGuardar = async () => {
      try {
          const fechaHoraIso = new Date(nuevaCita.fecha_hora).toISOString();
          const payload = {
              id_paciente: nuevaCita.id_paciente,
              fecha_hora: fechaHoraIso,
              motivo: nuevaCita.motivo,
              estado: nuevaCita.estado,
          };

          console.log("Payload que se envía:", payload);

          if (citaActual) {
              await fetchClient(`/api/citas/${citaActual.id_cita}`, {
                  method: "PUT",
                  body: JSON.stringify(payload),
                  headers: { "Content-Type": "application/json" },
              });
              alert("Cita actualizada correctamente.");
          } else {
              await fetchClient("/api/citas/add", {
                  method: "POST",
                  body: JSON.stringify(payload),
                  headers: { "Content-Type": "application/json" },
              });
              alert("Cita creada correctamente.");
          }

          setShowModal(false);
          window.location.reload();

      } catch (err) {
          alert("Error al guardar la cita");
          console.error("Error en handleGuardar:", err);
      }
  };



    const handleEditar = (cita: any) => {
        setCitaActual(cita);
        setNuevaCita({
            id_paciente: cita.id_paciente,
            fecha_hora: cita.fecha_hora?.slice(0, 16), 
            motivo: cita.motivo,
            estado: cita.estado,
        });
        setShowModal(true);
    };

    const handleEliminarClick = (cita: any) => {
        setCitaAEliminar(cita);
        setShowDeleteModal(true);
    };

    const confirmarEliminar = async () => {
        if (!citaAEliminar) return;
        try {
            await fetchClient(`/api/citas/${citaAEliminar.id_cita}`, {
                method: "DELETE",
            });
            alert("Cita eliminada correctamente.");
            setShowDeleteModal(false);
            window.location.reload();
        } catch (err) {
            alert("Error al eliminar la cita");
            console.error(err);
        }
    };

    const filteredCitas = useMemo(() => {
        return citas.filter((cita) =>
            cita.motivo?.toLowerCase().includes(search.toLowerCase()) ||
            cita.estado?.toLowerCase().includes(search.toLowerCase())
        );
    }, [citas, search]);

    const totalPages = Math.ceil(filteredCitas.length / itemsPerPage);
    const paginatedCitas = filteredCitas.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 p-4">
                <h2 className="mb-3">Listado de Citas</h2>

                <div className="d-flex justify-content-between mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por motivo o estado..."
                        className="w-50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={handleOpenModal}>Nueva Cita</Button>
                </div>

                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCitas.map((cita) => (
                                <tr key={cita.id_cita}>
                                    <td>{cita.nombre_paciente}</td>
                                    <td>{new Date(cita.fecha_hora).toLocaleDateString()}</td>
                                    <td>{new Date(cita.fecha_hora).toLocaleTimeString()}</td>
                                    <td>{cita.motivo}</td>
                                    <td>{cita.estado}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEditar(cita)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleEliminarClick(cita)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}

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

                {/* Modal Crear / Editar Cita */}
                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{citaActual ? "Editar Cita" : "Crear Nueva Cita"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Paciente</Form.Label>
                            <Form.Select name="id_paciente" onChange={handleChange} value={nuevaCita.id_paciente}>
                                <option value="">Seleccione...</option>
                                {pacientes.map((p) => (
                                    <option key={p.id_paciente} value={p.id_paciente}>{p.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha y Hora</Form.Label>
                            <Form.Control type="datetime-local"
                                name="fecha_hora"
                                value={nuevaCita.fecha_hora}
                                onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Motivo</Form.Label>
                            <Form.Control type="text" name="motivo" value={nuevaCita.motivo} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Estado</Form.Label>
                            <Form.Select name="estado" onChange={handleChange} value={nuevaCita.estado}>
                                <option value="Programada">Programada</option>
                                <option value="Atendida">Atendida</option>
                                <option value="Cancelada">Cancelada</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal Eliminar */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title style={{ color: "red" }}>Eliminar Cita</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro de eliminar la cita?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={confirmarEliminar}>
                            Confirmar
                        </Button>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}
