# 📧 Guía: Configuración de SMTP con Resend (Gratis)

Resend es la mejor opción moderna para enviar correos transaccionales (confirmaciones, recuperaciones) con alta entregabilidad.

## 1. Crear Cuenta y API Key en Resend
1.  Ve a [Resend.com](https://resend.com) y regístrate.
2.  **Verificar Dominio** (Recomendado):
    *   Si tienes un dominio (ej. `mitempresa.com`), agrégalo en la sección **Domains**.
    *   Añade los registros DNS (TXT, MX) que te pide Resend en tu proveedor de dominio (GoDaddy, Namecheap, Vercel, etc.).
    *   *Nota: Sin dominio propio, solo podrás enviar correos a tu propia dirección email de registro (Modo Test).*
3.  **Crear API Key**:
    *   Ve a **API Keys** en el menú lateral.
    *   Crea una nueva key con permisos "Full Access" o "Sending Access".
    *   Copia la Key (empieza con `re_...`). **No la pierdas.**

## 2. Configurar Supabase (SMTP)
Supabase usará Resend como "motor" para enviar los correos de Auth.

1.  Ve a tu **Dashboard de Supabase**.
2.  Navega a: **Project Settings** (engranaje abajo) -> **Authentication** -> **SMTP Settings**.
3.  Activa **Enable Custom SMTP**.
4.  Llena los datos así:

| Campo | Valor |
| :--- | :--- |
| **User** | `resend` |
| **Password** | `re_12345...` (Tu API Key completa) |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Minimum Encryption** | `SSL` (o STARTTLS si falla) |
| **Sender Email** | `onboarding@resend.dev` (si no tienes dominio) o `noreply@tu-dominio.com` |
| **Sender Name** | `Turnes App` |

5.  Haz clic en **Save**.

## 3. Configurar Email Templates (Supabase)
Ahora personaliza el correo que recibirán los usuarios.

1.  Ve a **Authentication** -> **Email Templates**.
2.  En **Confirm Signup**, modifica el "Message Body":

```html
<h2>¡Bienvenido a Turnes!</h2>
<p>Gracias por registrarte. Para activar tu cuenta, confirma tu correo:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
     Confirmar mi Cuenta
  </a>
</p>
<p>Si no solicitaste esto, ignora este mensaje.</p>
```

## 4. Probar
1.  Asegúrate que en **Authentication** -> **URL Configuration**, tu **Site URL** sea `http://localhost:5173` (para pruebas locales).
2.  Ve a tu App (Localhost) -> Registro.
3.  Crea un usuario nuevo con un correo real (si usas dominio propio) o tu correo de admin (si usas modo test).
4.  Revisa tu bandeja de entrada. ¡Debería llegar el correo vía Resend!
