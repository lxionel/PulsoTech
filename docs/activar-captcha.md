# CAPTCHA y límites del acceso administrativo

La integración de Cloudflare Turnstile está preparada para el inicio de sesión y la recuperación de contraseña. Sin las claves reales y la activación en Supabase, el CAPTCHA todavía no protege esos endpoints. El catálogo y la configuración de verificación en dos pasos siguen funcionando durante la preparación.

## 1. Crear el widget

1. Crea tu cuenta en [Cloudflare](https://dash.cloudflare.com/sign-up). Turnstile tiene un plan gratuito; no necesitas trasladar el alojamiento de tu tienda para usar el widget.
2. En Cloudflare abre **Turnstile → Add widget**.
3. Nombre: **PulsoTech Admin**. Modo: **Managed**. Mantén desactivado pre-clearance para esta integración.
4. Para probar ahora, autoriza el hostname **localhost**, sin `http://`, puerto ni ruta. Cuando publiques la tienda, usa un widget de producción con su hostname real, sin dominios de desarrollo. No elijas permitir todos los dominios.
5. Crea el widget y conserva las dos claves: **Site key** es pública; **Secret key** es privada y se introduce únicamente en Supabase. No envíes la clave privada por chat ni la añadas al repositorio.

## 2. Configurar primero la página

En la raíz del proyecto, crea o actualiza `.env.local` conservando sus demás variables:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=TU_SITE_KEY_PUBLICA
NEXT_PUBLIC_REQUIRE_ADMIN_CAPTCHA=true
```

Reinicia `npm run dev` y abre el administrador en la computadora. Comprueba que se muestre y complete la verificación antes de activar la validación remota. No uses una clave de prueba para el proyecto real: las claves reales de validación rechazan los tokens de prueba y viceversa.

La variable `NEXT_PUBLIC_` se incorpora al JavaScript público durante la compilación. Por eso solo contiene la clave pública, nunca la clave privada. Si la verificación se exige pero no hay una clave válida, el formulario impide solicitar acceso o recuperación.

## 3. Activar en Supabase

En el proyecto de la tienda, abre la configuración de Authentication y busca **Bot and Abuse Protection / CAPTCHA protection**. Elige **Turnstile**, pega allí la **Secret key** del mismo widget y guarda.

Supabase valida los tokens en el servidor. Esa validación es la protección contra clientes que eviten el formulario o consulten directamente Auth; deshabilitar un botón en la página no proporciona esa protección.

Cierra sesión y comprueba contraseña → CAPTCHA → código del autenticador → panel. Prueba también la recuperación de contraseña desde el formulario, teniendo en cuenta los límites de correo. No desactives la verificación en dos pasos.

Si CAPTCHA se activa antes de configurar la clave pública, los accesos se bloquearán. Corrige el widget/clave pública y reinicia la página. Si aún estás en una prueba local y necesitas recuperar el acceso, puedes desactivar temporalmente CAPTCHA desde tu panel de Supabase protegido con 2FA; vuelve a activarlo y comprobarlo antes de publicar.

## 4. Límites del servidor

Revisa **Authentication → Rate Limits** en Supabase. Mantén habilitados los límites existentes para acceso, recuperación, envío de correos y MFA. No subas los límites para eliminar errores de tus pruebas.

Los límites por IP permiten ráfagas cortas; no equivalen a un número fijo de intentos por cuenta. Los endpoints y unidades disponibles se detallan en la documentación oficial. Si ajustas un valor, comprueba primero si representa solicitudes por hora, minuto o ventana y conserva el valor anterior para poder restaurarlo. No reduzcas indiscriminadamente la renovación de tokens: puede interrumpir sesiones legítimas.

Supabase ya limita el envío de enlaces de recuperación para el mismo usuario. En el proveedor de correo integrado también existe un límite del proyecto; para producción configura SMTP propio, con sus credenciales solo en Supabase.

La interfaz ahora respeta errores `429` mostrando una pausa de 60 segundos y evita repetir inmediatamente una recuperación que se solicitó correctamente. La pausa puede reiniciarse al recargar el navegador y no sustituye los límites remotos; el servidor puede exigir una espera mayor.

## 5. Al publicar

El workflow existente de GitHub Pages ya lee estas variables de **Settings → Secrets and variables → Actions → Variables**:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: clave pública del widget de producción.
- `NEXT_PUBLIC_REQUIRE_ADMIN_CAPTCHA`: `true`.

No añadas la Secret key a las variables públicas o a la compilación. Estas variables no se aplican a una versión ya publicada: se necesita una compilación posterior. No se ha ejecutado un despliegue desde esta tarea.

## Comportamiento del formulario

- CAPTCHA solo se carga en el formulario de acceso, cuando está configurado.
- Cada envío incluye su token en `captchaToken` para Supabase Auth.
- Después de cada intento, exitoso o fallido, se elimina el token y se crea otra verificación.
- Tokens vencidos, errores, falta de red y scripts bloqueados impiden enviar una solicitud protegida. Se ofrece recargar la página.
- Las claves de prueba conocidas se rechazan en producción.
- Los tokens permanecen en memoria y no se escriben en localStorage, logs o parámetros de URL.
- El mensaje de recuperación no revela si una dirección de correo existe.

Las pruebas locales comprueban la entrega de tokens a ambos endpoints, el bloqueo ante tokens ausentes/caducados y configuración inválida, y el manejo de límites. La carga del widget real y la validación por tu Supabase requieren esta activación y una comprobación manual.

Fuentes: [CAPTCHA en Supabase](https://supabase.com/docs/guides/auth/auth-captcha), [límites de Auth](https://supabase.com/docs/guides/auth/rate-limits), [configurar un widget](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/), [planes de Turnstile](https://developers.cloudflare.com/turnstile/plans/) y [dominios de desarrollo y pruebas](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).
