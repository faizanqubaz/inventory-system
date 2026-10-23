
import { Suspense } from "react";
import ActivationForm from "./ActivationForm";


export default function ActivateEmployeePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          Loading activation page...
        </main>
      }
    >
      <ActivationForm />
    </Suspense>
  );
}
