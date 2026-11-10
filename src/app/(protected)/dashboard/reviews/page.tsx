import { getCurrentUser } from "../actions";
import { DashboardShell } from "../_components/DashboardShell";
import { Card } from "@/components/ui/Card";
import { MyReviewsClient } from "./_components/MyReviewsClient";

export default async function MyReviewsPage() {
  const user = await getCurrentUser("/dashboard/reviews");

  // Esta pagina muestra las reseñas del usuario autenticado.
  return (
    <DashboardShell title="Mis reseñas" description="Gestiona tus reseñas y ve directo al producto.">
      <Card className="overflow-hidden max-w-4xl mx-auto">
        <MyReviewsClient userId={user.id} userEmail={user.email} />
      </Card>
    </DashboardShell>
  );
}
