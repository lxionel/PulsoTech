# Activar el administrador de PulsoTech

El acceso anterior por PIN fue sustituido por Supabase Auth. El diseño de la tienda y el inventario se conservan.
El código nuevo no permite acceder ni guardar cambios hasta que la cuenta tenga el permiso de administrador.
La protección en la base de datos queda activa al ejecutar el SQL; guardar el archivo en el proyecto no la aplica en Supabase.

## Activación en tu proyecto

1. Abre el proyecto de Supabase que usa la tienda (upovmpudzgtafobtxnfr).
2. En Authentication → Users, crea la cuenta **lioneldavora1@gmail.com** con una contraseña privada de al menos 12 caracteres. Confirma el correo con la opción del panel o el flujo de verificación. Si la cuenta ya existe, usa esa misma cuenta; no crees otra.
3. Abre SQL Editor → New query y ejecuta el contenido completo de **supabase/activate-admin.sql**. Aplica los permisos y autoriza únicamente esa cuenta. Si la cuenta no existe, la transacción se cancela sin cambiar los permisos anteriores. No elimina productos ni ventas.
4. En Authentication → URL Configuration configura la URL de tu tienda y añade las rutas permitidas de recuperación: en local, http://localhost:3000/Lionel260606/; publicada, la dirección real incluyendo /PulsoTech/Lionel260606/ si mantienes esa ruta.
5. En Authentication → Providers → Email, mantén habilitado el acceso con contraseña y desactiva el registro público si la tienda solo necesita esta cuenta de administración. Configura el envío de correos de recuperación para tu cuenta; en producción usa un SMTP propio.
6. Entra al administrador con tu correo y contraseña. El PIN antiguo ya no funciona. Ajustes → Seguridad de la cuenta permite cambiar la contraseña; Olvidé mi contraseña solicita el enlace de recuperación.

El esquema y el archivo de activación actuales también exigen verificación en dos pasos. Antes de abrir el panel, configura tu autenticador y confirma su código. Para una cuenta que ya estaba activa con la versión anterior del SQL, ejecuta **supabase/activate-mfa.sql** y sigue **docs/activar-verificacion-dos-pasos.md**. Recuperar la contraseña mantiene el requisito del segundo factor.

No envíes tu contraseña, una clave secret/service_role ni el acceso a la base de datos por el chat. La aplicación solo usa la clave pública.

## Qué protege

- Catálogo, marcas, categorías, WhatsApp y cupones: lectura pública.
- Productos, stock, configuración y cupones: escritura únicamente para administradores.
- Registros de ventas y otros ajustes privados: lectura y escritura únicamente para administradores.
- La tabla store_admins no puede modificarse desde el navegador. Crear un usuario o editar sus metadatos no otorga permisos.
- La sesión se verifica con Auth y con permisos del servidor. El panel comprueba nuevamente al recuperar el foco; cada operación privada verifica el acceso y la base de datos aplica RLS.
- Cerrar sesión elimina la sesión de este dispositivo y la caché local de ventas. Los datos de inventario se conservan.

## Comprobación después de activar

Prueba el catálogo y un pedido en una ventana privada, sin sesión administrativa. Luego inicia sesión como administrador, edita un producto de prueba y verifica el cambio en la tienda. Cierra sesión y confirma que el panel vuelve a pedir acceso. Una cuenta sin autorización no debe poder editar productos ni leer ventas.

Las pruebas locales ejecutan las políticas en PostgreSQL aislado. No sustituyen esta comprobación contra tu proyecto una vez aplicado el SQL.

Referencias oficiales: [Supabase Auth](https://supabase.com/docs/guides/auth/passwords) y [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
