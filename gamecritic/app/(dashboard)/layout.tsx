import "bootstrap/dist/css/bootstrap.min.css";

import Link from "next/link";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="white" className="border-bottom shadow-sm mb-0 py-2">
        <Container fluid="xxl" className="px-4">
          <div className="d-flex w-100 flex-wrap justify-content-between align-items-center gap-3">
            <Link href="/" className="navbar-brand fw-bold text-primary text-decoration-none mb-0">
              GameCritic
            </Link>
            <nav className="d-flex flex-row flex-wrap gap-2 gap-md-3">
              <Link href="/dashboard" className="nav-link py-1 px-2">
                Přehled
              </Link>
              <Link href="/dashboard/reviews" className="nav-link py-1 px-2">
                Recenze
              </Link>
              <Link href="/dashboard/games/new" className="nav-link py-1 px-2">
                Nová hra
              </Link>
              <Link href="/dashboard/screenshots" className="nav-link py-1 px-2">
                Screenshoty
              </Link>
            </nav>
          </div>
        </Container>
      </Navbar>
      <Container fluid="xxl" className="px-4 py-4">
        {children}
      </Container>
    </div>
  );
}
