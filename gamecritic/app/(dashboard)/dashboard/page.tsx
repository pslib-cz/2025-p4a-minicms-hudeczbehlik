import Link from "next/link";
import Card from "react-bootstrap/Card";
import CardBody from "react-bootstrap/CardBody";
import CardText from "react-bootstrap/CardText";
import CardTitle from "react-bootstrap/CardTitle";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <Card className="mb-4 shadow-sm border-0">
        <CardBody>
          <CardTitle as="h1" className="h3 fw-bold">
            Dashboard
          </CardTitle>
          <CardText className="text-muted mb-0">
            Vítejte, {session?.user?.name ?? "recenzente"}.
          </CardText>
        </CardBody>
      </Card>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <CardBody>
              <CardTitle className="h5">Recenze</CardTitle>
              <CardText className="text-muted small">Správa vlastních recenzí.</CardText>
              <Link href="/dashboard/reviews" className="stretched-link fw-semibold text-decoration-none">
                Otevřít →
              </Link>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <CardBody>
              <CardTitle className="h5">Nová hra</CardTitle>
              <CardText className="text-muted small">Přidat záznam hry a tagy.</CardText>
              <Link href="/dashboard/games/new" className="stretched-link fw-semibold text-decoration-none">
                Otevřít →
              </Link>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <CardBody>
              <CardTitle className="h5">Screenshoty</CardTitle>
              <CardText className="text-muted small">Galerie k hrám.</CardText>
              <Link href="/dashboard/screenshots" className="stretched-link fw-semibold text-decoration-none">
                Otevřít →
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
