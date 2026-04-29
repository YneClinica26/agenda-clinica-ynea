const SUPABASE_URL = "https://vadohvwjoxghubceffpn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZG9odndqb3hnaHViY2VmZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzQxMjksImV4cCI6MjA5MjkxMDEyOX0.hrO9FcE32tlw6fL0I6EFu1sLFpBq_k6QBJ-LJIsvk24";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_STATE_KEY = "agenda_ynea_definitiva";
const FROM_EMAIL = process.env.FROM_EMAIL || "Ynea <onboarding@resend.dev>";
const LOGO_YNEA = "data:image/png;base64,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";

function madridParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), minute: Number(parts.minute) };
}

function addDaysISO(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatoFechaES(fecha) {
  const d = new Date(`${fecha}T00:00:00`);
  return d.toLocaleDateString("es-ES");
}

function pacienteDeCita(data, cita) {
  return (data.pacientes || []).find(p => String(p.id) === String(cita.pacienteId)) || {};
}

function avisoKey(cita) {
  return `email_48h_${cita.id}`;
}

function mensajeEmail(data, cita) {
  const p = pacienteDeCita(data, cita);
  const nombre = p.nombre || "paciente";

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7f7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f7;margin:0;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#ffffff;border:1px solid #ead5de;border-collapse:collapse;">
            <tr>
              <td style="padding:24px 28px 10px 28px;font-family:Arial,Helvetica,sans-serif;">
                <h1 style="margin:0;color:#9f244f;font-size:20px;line-height:26px;font-weight:700;">Recordatorio de cita</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:14px;line-height:21px;">
                <p style="margin:0 0 14px 0;">Hola ${nombre},</p>
                <p style="margin:0 0 18px 0;">Le recordamos que tiene la siguiente cita en nuestra clínica:</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 20px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff3f8;border:1px solid #f1c7d8;border-collapse:collapse;">
                  <tr>
                    <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:14px;line-height:22px;">
                      <p style="margin:0 0 7px 0;"><strong>Fecha:</strong> ${formatoFechaES(cita.fecha)}</p>
                      <p style="margin:0 0 7px 0;"><strong>Hora:</strong> ${cita.hora}</p>
                      <p style="margin:0 0 7px 0;"><strong>Profesional:</strong> ${cita.profesional || ""}</p>
                      <p style="margin:0;"><strong>Tipo:</strong> ${cita.tipo || ""}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 22px 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:14px;line-height:21px;">
                <p style="margin:0 0 10px 0;">Si no puede asistir, por favor comuníquenoslo respondiendo a este email.</p>
                <p style="margin:0;">Gracias.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 18px 28px;border-top:1px solid #ead5de;background:#fffafc;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="145" valign="top" style="width:145px;padding-right:16px;">
                      <img src="${LOGO_YNEA}" width="120" alt="Ynea" style="display:block;width:120px;max-width:120px;height:auto;border:0;outline:none;text-decoration:none;">
                    </td>
                    <td valign="top" style="font-family:Arial,Helvetica,sans-serif;color:#374151;font-size:12px;line-height:18px;border-left:1px solid #ead5de;padding-left:16px;">
                      Avenida Jacinto Benavente, 26<br>
                      Valencia, 46005<br>
                      Tel. 963 95 59 31<br>
                      ynea.es
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${body}`);
  return body;
}

async function main() {
  if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY en GitHub Secrets.");
  const nowMadrid = madridParts();

  if (false) {
    console.log(`No es hora de envío en Madrid. Hora actual: ${nowMadrid.hour}:${nowMadrid.minute}`);
    return;
  }

  const targetDate = addDaysISO(nowMadrid.date, 2);
  console.log(`Buscando citas para avisar. Hoy Madrid: ${nowMadrid.date}. Citas objetivo: ${targetDate}`);

  const rows = await supabaseRequest(`app_state?key=eq.${encodeURIComponent(APP_STATE_KEY)}&select=*`);
  if (!rows.length) throw new Error("No existe fila app_state con key agenda_ynea_definitiva.");
  const data = rows[0].data || {};
  data.avisosEnviados = data.avisosEnviados || {};

  const citas = (data.citas || []).filter(c => c.fecha === targetDate);
  let enviados = 0, omitidos = 0, errores = 0;

  for (const cita of citas) {
    const key = avisoKey(cita);
    const p = pacienteDeCita(data, cita);
    if (data.avisosEnviados[key]) { omitidos++; continue; }
    if (!p.email) { console.log(`Sin email para cita ${cita.id}`); omitidos++; continue; }

    try {
      await sendEmail(p.email, `Recordatorio de cita en Ynea - ${formatoFechaES(cita.fecha)} ${cita.hora}`, mensajeEmail(data, cita));
      data.avisosEnviados[key] = { fecha: new Date().toISOString(), canal: "email", citaId: cita.id, pacienteId: cita.pacienteId, email: p.email };
      enviados++;
      console.log(`Email enviado a ${p.email} para cita ${cita.id}`);
    } catch (err) {
      errores++;
      console.error(`Error enviando cita ${cita.id}:`, err.message);
    }
  }

  if (enviados > 0) {
    await supabaseRequest(`app_state?key=eq.${encodeURIComponent(APP_STATE_KEY)}`, {
      method: "PATCH",
      body: JSON.stringify({ data, updated_at: new Date().toISOString() })
    });
  }

  console.log(`Resumen: enviados=${enviados}, omitidos=${omitidos}, errores=${errores}`);
}

main().catch(err => { console.error(err); process.exit(1); });
