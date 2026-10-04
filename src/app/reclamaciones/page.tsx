import type { Metadata } from "next";
import PolicyPage, { PolicyIdentity, PolicySection } from "@/components/PolicyPage";
import ComplaintForm from "@/components/ComplaintForm";
import { COMPLAINT_BOOK_ENABLED, STORE_POLICIES } from "@/data/store-policies";

export const metadata: Metadata = { title: "Atención y reclamos | PulsoTech", description: "Contacta a PulsoTech para consultas, atención de compras y reclamos." };

export default function ComplaintsPage() {
  return <PolicyPage title={COMPLAINT_BOOK_ENABLED ? "Libro de Reclamaciones" : "Atención y reclamos"} intro="Si necesitas ayuda con una compra o tienes una disconformidad, estos son nuestros canales de atención." current="/reclamaciones/">
    <PolicySection title="Responsable y contacto"><PolicyIdentity /></PolicySection>
    {COMPLAINT_BOOK_ENABLED ? <ComplaintForm /> : <PolicySection title="Atención de tu compra"><p>Escríbenos indicando el pedido o los datos que permitan identificar la compra, el modelo y una explicación de lo ocurrido. Incluye un correo o teléfono para que podamos responderte.</p><a href={`mailto:${STORE_POLICIES.email}?subject=Atenci%C3%B3n%20de%20compra%20PulsoTech`} className="inline-flex items-center justify-center min-h-11 rounded-xl bg-neutral-950 text-white px-5 py-3 text-xs font-bold hover:bg-neutral-800">Contactar por correo</a><p>El contacto por correo permite solicitar atención de tu compra. Para presentar una solicitud ante Indecopi, puedes consultar sus <a href="https://consumidor.gob.pe/presenta-tu-reclamo-productos-y-servicios/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 text-neutral-900">canales de atención al consumidor</a>.</p></PolicySection>}
    <PolicySection title="Respuesta y seguimiento"><p>Los reclamos y quejas de consumo se atienden por escrito dentro del plazo máximo de 15 días hábiles. Conserva la comunicación y, cuando se registre una hoja de reclamación, su constancia o número para hacer seguimiento.</p></PolicySection>
  </PolicyPage>;
}
