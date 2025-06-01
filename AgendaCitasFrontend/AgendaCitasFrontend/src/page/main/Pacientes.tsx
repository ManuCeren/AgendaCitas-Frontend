import { usePacientes } from "../../hook/usePacientes";
import { useState, useMemo } from "react";
import { Table, Form, Pagination, Spinner, Alert, Button, Modal } from "react-bootstrap";
import Sidebar from "../main/Sidebar";
import { fetchClient } from "../../services/fetchClient";

export default function PacientesLista() {
  const { pacientes, loading, error } = usePacientes();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState<any | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [pacienteActual, setPacienteActual] = useState<any | null>(null);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: "",
    fecha_nacimiento: "",
    email: "",
  });

  // Abrir modal (crear)
  const handleOpenModal = () => {
    setPacienteActual(null);
    setNuevoPaciente({
      nombre: "",
      fecha_nacimiento: "",
      email: "",
    });
    setShowModal(true);
  };

  // Abrir modal (editar)
  const handleEditar = (paciente: any) => {
    setPacienteActual(paciente);
    setNuevoPaciente({
      nombre: paciente.nombre,
      fecha_nacimiento: paciente.fecha_nacimiento?.slice(0, 10), 
      email: paciente.email,
    });
    setShowModal(true);
  };

  // Guardar (crear o editar)
 const handleGuardar = async () => {
    try {
    const fechaIso = new Date(nuevoPaciente.fecha_nacimiento).toISOString().slice(0, 10); 

    const payload = {
      nombre: nuevoPaciente.nombre,
      fecha_nacimiento: fechaIso,
      email: nuevoPaciente.email,
    };

    console.log("Payload que se envía:", payload);

    if (pacienteActual) {
      // EDITAR
      await fetchClient(`/api/pacientes/update/${pacienteActual.id_paciente}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      alert("Paciente actualizado correctamente.");
    } else {
      // NUEVO
      await fetchClient("/api/pacientes/add", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      alert("Paciente registrado correctamente.");
    }

    setShowModal(false);
    window.location.reload();
  } catch (err) {
    alert("Error al guardar el paciente");
    console.error(err);
  }
};


  // Eliminar
  const handleEliminarClick = (paciente: any) => {
    setPacienteAEliminar(paciente);
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    if (!pacienteAEliminar) return;
    try {
      await fetchClient(`/api/pacientes/${pacienteAEliminar.id_paciente}`, {
        method: "DELETE",
      });
      alert("Paciente eliminado correctamente.");
      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      alert("Error al eliminar paciente");
      console.error(err);
    }
  };

  // Filtro + paginación
  const filteredPacientes = useMemo(() => {
    return pacientes.filter((p) =>
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [pacientes, search]);

  const totalPages = Math.ceil(filteredPacientes.length / itemsPerPage);
  const paginatedPacientes = filteredPacientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h2 className="mb-3">Listado de Pacientes</h2>

        <div className="d-flex justify-content-between mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleOpenModal}>Nuevo Paciente</Button>
        </div>

        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha Nacimiento</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPacientes.map((p) => (
                <tr key={p.id_paciente}>
                  <td>{p.nombre}</td>
                  <td>
                    {p.fecha_nacimiento
                      ? new Date(p.fecha_nacimiento).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{p.telefono}</td>
                  <td>{p.email}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminarClick(p)}
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

        {/* Modal Editar y Nuevo*/}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{pacienteActual ? "Editar Paciente" : "Nuevo Paciente"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={nuevoPaciente.nombre}
                onChange={(e) =>
                  setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={nuevoPaciente.fecha_nacimiento}
                onChange={(e) =>
                  setNuevoPaciente({
                    ...nuevoPaciente,
                    fecha_nacimiento: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={nuevoPaciente.email}
                onChange={(e) =>
                  setNuevoPaciente({ ...nuevoPaciente, email: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleGuardar}>
              Guardar
            </Button>
          </Modal.Footer>
          </Modal>
          {/* Modal Eliminar*/}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title style={{ color: "red" }}>Eliminar Paciente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Eliminar a <strong>{pacienteAEliminar?.nombre}</strong>?
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
