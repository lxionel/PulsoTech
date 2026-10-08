# Activación del Libro de Reclamaciones

Las políticas conservan el nombre y correo de contacto iniciales. El propietario todavía no tiene definidos el domicilio comercial, el RUC, el dominio, el correo corporativo y el horario final. Se retiró la dirección fija anterior; estos datos deben confirmarse en la configuración antes de vender. El formulario del Libro permanece deshabilitado y el pie de página muestra **Atención y reclamos**, para no presentar ese contacto como un libro ya operativo.

## Lo que está preparado en el código

- `/privacidad/`, `/terminos/`, `/garantia-y-entregas/` y `/reclamaciones/`, conservando la paleta y navegación de la tienda.
- Un formulario de hoja de reclamación con identificación, contacto, producto, importe, reclamo/queja, detalle, pedido y representante si el consumidor es menor de edad.
- La función `submit-complaint`, que valida los datos y el tamaño de la solicitud, verifica Turnstile en el servidor (incluidos el hostname y la acción) y guarda el registro en una tabla privada. No devuelve una constancia si el servidor no confirma el guardado.
- Una constancia que el consumidor puede descargar e imprimir. El formulario no envía automáticamente un correo de constancia; la copia se entrega en la pantalla tras el registro. Se debe revisar este procedimiento con el formato y las obligaciones vigentes antes de habilitar el libro.
- **Administrador → Ajustes → Reclamos** para consultar todas las solicitudes por páginas y registrar una respuesta. El botón de correo abre un borrador; el administrador debe enviarlo y conservar la evidencia antes de marcar la solicitud como respondida. No existe envío automático de respuestas.
- Lectura y respuesta privadas con autorización del administrador y doble verificación. Un visitante no puede consultar la tabla ni insertar directamente por la API de la base de datos. La función usa la clave de servicio que Supabase proporciona al entorno del servidor; nunca se incluye en la aplicación web.

## Requisitos antes de habilitarlo

1. Tramitar el RUC, confirmar los datos del proveedor y revisar el formato oficial de la hoja y aviso. Revisar asimismo las obligaciones de datos personales, su conservación y la inscripción del banco de datos que corresponda. Las páginas implementadas no equivalen a una certificación legal.
2. Ejecutar `supabase/activate-complaints.sql` en el SQL Editor del proyecto. Es un script adicional; no es necesario volver a ejecutar el esquema completo.
3. Publicar la Edge Function de `supabase/functions/submit-complaint/index.ts`, con nombre `submit-complaint` y la comprobación JWT de plataforma desactivada como indica `supabase/config.toml`. El endpoint es público y exige verificación CAPTCHA en su propio handler. La desactivación de JWT no debe copiarse a operaciones privadas.
4. En los secretos de **Edge Functions** de Supabase configurar:
   - `TURNSTILE_SECRET_KEY`: Secret key del widget real, pegada únicamente en Supabase.
   - `COMPLAINT_PROVIDER_RUC`: RUC real de once dígitos, comprobado ante SUNAT.
   - `COMPLAINT_ALLOWED_ORIGINS`: orígenes exactos autorizados, separados por comas. En pruebas puede ser `http://localhost:3000`; en producción usar la dirección HTTPS real, sin rutas. Estos deben coincidir con los hostnames permitidos en Turnstile.
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están disponibles por defecto en el entorno de las funciones; no copiarlos al cliente ni compartirlos por chat.
5. Para probar y luego compilar el cliente, establecer las variables públicas:
   - `NEXT_PUBLIC_STORE_RUC`: el mismo RUC real.
   - `NEXT_PUBLIC_COMPLAINT_BOOK_ENABLED=true` solo cuando todo el circuito esté validado.
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: clave pública del widget autorizado para ese hostname.
   En Cloudflare Pages se utilizan las variables de compilación correspondientes y una compilación nueva; GitHub Actions también debe recibir las variables públicas necesarias para validar esa configuración. Las claves privadas nunca se ponen en esas variables públicas.
6. Comprobar una solicitud de prueba, su constancia, lectura exclusiva desde el administrador y envío manual de la respuesta. Si una respuesta de red es incierta, consultar los registros privados antes de reenviar para evitar duplicados.
7. Organizar el seguimiento de los quince días hábiles y el respaldo/constancia cuando el servicio virtual no esté disponible. Mostrar el aviso y acceso visible exigidos por la normativa; el pie cambia a **Libro de Reclamaciones** al habilitarlo.

El 8 de octubre de 2026 se instaló la tabla y se desplegó `submit-complaint` mediante la sesión CLI completada por el propietario. La instalación técnica está verificada; el formulario público sigue deshabilitado. Los pasos de identidad, secretos y una solicitud completa con constancia/respuesta siguen pendientes.

## Instalación técnica con CLI

Se comprobó la ayuda de Supabase CLI `2.120.0`. Iniciar sesión desde una terminal local con `npx --yes supabase@2.120.0 login`; no compartir tokens ni contraseñas por chat. Confirmar que la referencia corresponde al proyecto configurado en PulsoTech antes de ejecutar:

```powershell
# Desde la raíz del repositorio; sustituir <referencia> por la del proyecto correcto.
npx --yes supabase@2.120.0 db query --linked --project-ref <referencia> --file supabase/verify-complaints.sql
npx --yes supabase@2.120.0 db query --linked --project-ref <referencia> --file supabase/activate-complaints.sql
npx --yes supabase@2.120.0 db query --linked --project-ref <referencia> --file supabase/verify-complaints.sql
npx --yes supabase@2.120.0 functions deploy submit-complaint --project-ref <referencia> --use-api
```

La primera y tercera consultas solo inspeccionan el esquema y los permisos, sin leer datos de consumidores. Tras instalar, las comprobaciones booleanas deben ser `true`; revisar además que `policies` contenga únicamente las dos políticas del administrador y sus condiciones `is_store_admin()`. Esto no sustituye las pruebas de sesión y CAPTCHA. El SQL de activación conserva registros y restablece los permisos del módulo. No ejecutar `db reset` ni un `db push` general para instalar este archivo.

`--use-api` despliega únicamente la función indicada sin Docker. La configuración `verify_jwt = false` pertenece exclusivamente a este formulario público; su handler exige Turnstile y datos comerciales válidos antes de insertar. No habilitar el formulario público ni inventar un RUC para comprobarlo. El endpoint puede seguir rechazando solicitudes hasta completar los secretos y la identidad reales.

Verificación del 8 de octubre: antes de instalar, el endpoint devolvía `404`. Después de instalar la tabla y desplegar la función (versión 1, `ACTIVE`), se comprobaron los nueve controles de permisos, las dos políticas exclusivas de administración y el helper con MFA. Se configuró `COMPLAINT_ALLOWED_ORIGINS=https://pulsotech.pages.dev`; RUC y secreto de Turnstile siguen sin configurar.

- `OPTIONS` desde la web actual: `204`, con origen exacto.
- `OPTIONS` desde un origen ajeno: `403`.
- `POST` vacío, sin datos de consumidor: `503`, bloqueado por configuración incompleta.
- Lectura anónima de identificadores en la tabla: `401`, denegada.
- Cero reclamos creados. Las huellas de productos, ajustes y operaciones antes/después coinciden.

Las 168 pruebas automatizadas pasaron en la preparación. No se enviaron solicitudes reales ni mensajes; recepción, constancia y respuesta completas todavía no se han comprobado en el servicio. La pestaña administrativa estaba sin sesión al intentar consultar el módulo tras instalar; falta esa comprobación visual con una sesión nueva, aunque los permisos y el endpoint remoto ya se verificaron por CLI/HTTP. Las copias anteriores a esta instalación mantienen el estado histórico del esquema. Posteriormente se creó una nueva copia cifrada mediante lectura autorizada por CLI, que incluye la tabla instalada y vacía; descifrado y restauración exacta en memoria comprobados ([evidencia](evidencia-respaldo-2026-10-08.json)).

## Fuentes oficiales

- [Libro de Reclamaciones y formato, Indecopi](https://consumidor.gob.pe/libro-de-reclamaciones/).
- [Validación de tokens en servidor, Cloudflare](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- [Autorización de Edge Functions, Supabase](https://supabase.com/docs/guides/functions/auth).
- [Secretos de Edge Functions, Supabase](https://supabase.com/docs/guides/functions/secrets).
