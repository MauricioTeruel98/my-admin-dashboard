import Image from "next/image";
import Dashboard from "../components/Dashboard";
import ProtectedRoute from "../ProtectedRoute";

export default function Home() {
  return (
    <>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </>
  );
}
