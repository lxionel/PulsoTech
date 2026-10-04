import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { PolicyIdentity, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Términos y condiciones | PulsoTech", description: "Cómo se coordinan los pedidos, pagos y entregas de PulsoTech en Chimbote." };

export default function TermsPage() {
  return <PolicyPage title="Términos y condiciones" intro="Estas condiciones explican cómo comprar y coordinar tu pedido con PulsoTech." current="/terminos/">
    <PolicySection title="1. Responsable de la tienda"><PolicyIdentity /></PolicySection>
    <PolicySection title="2. Catálogo y precios"><p>Los precios se muestran en soles peruanos (PEN). Las características, variantes y disponibilidad corresponden a cada producto. El costo de entrega, si lo hubiera, se informa por separado antes de confirmar la compra. Si encontramos un error en el precio o la información, te comunicaremos la corrección antes de aceptar el pedido; podrás decidir si deseas continuar.</p></PolicySection>
    <PolicySection title="3. Confirmación del pedido"><p>Al enviar tu bolsa por WhatsApp solicitas la confirmación de disponibilidad y de las condiciones de compra. El envío del mensaje no reserva el stock ni realiza un cobro automático. Confirmaremos por escrito los productos, cantidades, precio, costo de entrega, total, medio de pago y fecha acordada.</p></PolicySection>
    <PolicySection title="4. Pagos"><p>El pago al recibir o por transferencia se acuerda durante la confirmación del pedido. No se solicitan datos de tarjetas bancarias ni claves desde esta página. Un pago por transferencia se verifica en la cuenta receptora antes de marcarlo como recibido.</p></PolicySection>
    <PolicySection title="5. Entrega y cancelación"><p>La atención inicial es local en Chimbote. Coordinamos el punto, dirección, fecha y horario de entrega por WhatsApp. Puedes solicitar la cancelación sin penalidad antes del despacho o entrega; si ya realizaste un pago, coordinaremos su devolución por el medio acordado. El procedimiento y plazo de reembolso se informarán antes de cobrar. Si no podemos cumplir lo pactado, te ofreceremos una alternativa para que decidas o la devolución del pago correspondiente.</p></PolicySection>
    <PolicySection title="6. Garantía y cambios"><p>La garantía y sus condiciones se informan por producto antes de confirmar la compra. Los cambios voluntarios y la atención de defectos se detallan en la <Link href="/garantia-y-entregas/" className="underline underline-offset-4 text-neutral-900">política de garantía, entregas y cambios</Link>. Ninguna condición limita los derechos reconocidos por la legislación peruana al consumidor.</p></PolicySection>
    <PolicySection title="7. Datos y atención"><p>Usamos los datos necesarios para atender tu pedido y coordinar la entrega conforme al <Link href="/privacidad/" className="underline underline-offset-4 text-neutral-900">aviso de privacidad</Link>. Para consultas o problemas con tu compra puedes acceder a <Link href="/reclamaciones/" className="underline underline-offset-4 text-neutral-900">atención y reclamos</Link>.</p></PolicySection>
    <PolicySection title="8. Actualización de condiciones"><p>Las modificaciones se aplicarán a nuevos pedidos. Se respetarán las condiciones informadas y aceptadas al confirmar una compra anterior.</p></PolicySection>
  </PolicyPage>;
}
