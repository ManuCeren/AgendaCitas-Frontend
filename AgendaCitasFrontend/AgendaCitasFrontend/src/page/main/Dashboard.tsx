import { usePacientes } from "../../hook/usePacientes";
import { Card, Table, Spinner } from "react-bootstrap";
import Sidebar from "./Sidebar"; 

export default function Dashboard() {
  const { pacientes, loading, error } = usePacientes();
  const totalPacientes = pacientes.length;
  const ultimosPacientes = pacientes.slice(-5).reverse();

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container mt-4">
        <h2 className="mb-4">Agenda para Citas</h2>

        <div className="row mb-4">
          <div className="col-md-4">
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="card-title">👥 Total de Pacientes</h5>
                <h1 className="display-5">
                  {loading ? <Spinner animation="border" size="sm" /> : totalPacientes}
                </h1>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-8">
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="card-title">📋 Últimos Pacientes Agregados</h5>
                {loading ? (
                  <Spinner animation="border" />
                ) : (
                  <Table striped size="sm" responsive>
                    <tbody>
                      {ultimosPacientes.map((p) => (
                        <tr key={p.id}>
                          <td>{p.nombre} {p.apellido}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
}