# Verificación en dos pasos de PulsoTech

El administrador requiere correo y contraseña más un código TOTP de una aplicación autenticadora. La primera vez, la cuenta autorizada configura su autenticador antes de abrir el inventario. Los clientes siguen accediendo al catálogo normalmente.

## Activación para la cuenta que ya usas

1. En Supabase, abre **SQL Editor → New query** y ejecuta el archivo completo **supabase/activate-mfa.sql**. Conserva productos, ventas, ajustes y la lista de administradores. Si no existe una cuenta administradora autorizada, se cancela la transacción; en ese caso aplica primero **supabase/activate-admin.sql**.
2. Recarga **http://localhost:3000/Lionel260606/** en tu computadora. Si la sesión anterior sigue abierta, el panel pasará a la configuración del autenticador. Si no, entra con tu correo y contraseña.
3. Pulsa **Configurar autenticador**. En tu aplicación autenticadora, añade una cuenta escaneando el QR desde el celular. También puedes abrir **Ingresar la clave manualmente**. El código debe generarse como TOTP.
4. Escribe el código actual de seis dígitos y pulsa **Activar y entrar**. La configuración solo se considera completa después de que Supabase verifique el código y la base de datos autorice la sesión.
5. Cierra sesión y vuelve a entrar: primero tu contraseña y luego el código. Comprueba que puedas guardar un cambio en un producto de prueba.

Si el proyecto tiene deshabilitado TOTP, revisa **Authentication → Multi-Factor** y habilita la inscripción y verificación TOTP. No habilites CAPTCHA sin integrar antes su widget en el formulario.

El SQL y el código deben estar aplicados juntos. La existencia de estos archivos en el proyecto no significa que la protección remota esté activa. Si falta la función nueva, la pantalla muestra que debes aplicar el SQL; no permite entrar solo con contraseña.

## Qué queda protegido

- La pertenencia a `store_admins` solo habilita configurar y verificar el factor. La función `is_store_admin_account()` devuelve únicamente si la cuenta actual pertenece a esa lista.
- `is_store_admin()` exige pertenencia, un JWT firmado con nivel `aal2` y un factor TOTP todavía verificado en Supabase Auth. Las políticas de productos y ajustes usan esta comprobación para modificaciones y datos privados.
- Ni conocer la ruta del panel, ni alterar indicadores en el navegador, ni tener la contraseña reemplaza el segundo factor.
- Un factor pendiente no cuenta como verificado. El QR y la clave de inscripción se muestran como imagen/texto y permanecen en memoria del formulario; no se guardan en localStorage ni se envían a generadores de QR externos.
- Cancelar elimina únicamente la inscripción pendiente creada por PulsoTech. Las configuraciones abandonadas de esta tienda se limpian al iniciar una nueva inscripción; no se eliminan autenticadores confirmados.
- Cambiar o recuperar la contraseña mantiene el requisito del segundo factor. La pantalla de recuperación de contraseña se abre después de completar MFA.
- Ajustes → Seguridad de la cuenta muestra que la verificación en dos pasos está activa.

## Conserva una forma de recuperar el acceso

Conserva acceso a tu autenticador, y su respaldo seguro si tu aplicación lo admite. La clave manual del QR es privada: quien tenga esa clave puede generar códigos. No la envíes por chat ni la guardes en archivos del repositorio.

Si pierdes el autenticador, el restablecimiento por correo no elimina MFA. La recuperación requiere acceso independiente a tu proyecto de Supabase y la retirada administrativa del factor perdido en Authentication. Cuando exista una sesión con otro factor válido, también es posible gestionar factores con los mecanismos de Supabase Auth. No se han integrado códigos de recuperación experimentales.

Protege también las cuentas que dan acceso a Supabase, GitHub y tu correo con 2FA. Después de retirar un factor desde un canal administrativo, vuelve a entrar a PulsoTech y configura el nuevo autenticador antes de acceder a los datos privados.

## Validación y pendientes de producción

Las pruebas locales ejecutan las políticas en PostgreSQL aislado, incluyendo solicitudes directas con una sesión `aal1`, usuarios ajenos con `aal2` y tokens antiguos después de retirar el factor. También verifican que las ocho operaciones privadas del cliente se detengan sin MFA. Esto no sustituye la prueba del QR y el inicio de sesión contra tu proyecto real tras aplicar el SQL.

Siguen pendientes de configurar por separado los límites y CAPTCHA de autenticación, las cabeceras del alojamiento, los respaldos externos y las políticas comerciales con datos reales. La activación de MFA no representa la finalización de toda la seguridad o del cumplimiento legal de producción.

Referencias: [MFA en Supabase](https://supabase.com/docs/guides/auth/auth-mfa), [autenticadores TOTP](https://supabase.com/docs/guides/auth/auth-mfa/totp) y [lista de preparación para producción](https://supabase.com/docs/guides/deployment/going-into-prod).
