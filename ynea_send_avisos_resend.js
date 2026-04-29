const SUPABASE_URL = "https://vadohvwjoxghubceffpn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZG9odndqb3hnaHViY2VmZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzQxMjksImV4cCI6MjA5MjkxMDEyOX0.hrO9FcE32tlw6fL0I6EFu1sLFpBq_k6QBJ-LJIsvk24";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_STATE_KEY = "agenda_ynea_definitiva";
const FROM_EMAIL = process.env.FROM_EMAIL || "Ynea <onboarding@resend.dev>";

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
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
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
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#1f2937">
      <h2 style="color:#9f244f">Recordatorio de cita - Ynea</h2>
      <p>Hola ${nombre},</p>
      <p>Le recordamos su cita en Ynea:</p>
      <ul>
        <li><b>Fecha:</b> ${formatoFechaES(cita.fecha)}</li>
        <li><b>Hora:</b> ${cita.hora}</li>
        <li><b>Profesional:</b> ${cita.profesional || ""}</li>
        <li><b>Tipo:</b> ${cita.tipo || ""}</li>
      </ul>
      <p>Si no puede asistir, por favor contacte con la clínica.</p>
      <p>Gracias.</p>
      <p style="color:#64748b;font-size:13px">Ynea</p>
    </div>
  `;
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }

  return res.json();
}

async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${body}`);
  return body;
}

async function main() {
  if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY en GitHub Secrets.");

  const nowMadrid = madridParts();
console.log("MODO PRUEBA ACTIVADO");
nowMadrid.hour = 11;
  if (nowMadrid.hour !== 11) {
    console.log(`No es hora de envío en Madrid. Hora actual: ${nowMadrid.hour}:${nowMadrid.minute}`);
    return;
  }

  const targetDate = addDaysISO(nowMadrid.date, 2);
  console.log(`Buscando citas para avisar. Hoy Madrid: ${nowMadrid.date}. Citas objetivo: ${targetDate}`);

  const rows = await supabaseRequest(`app_state?key=eq.${encodeURIComponent(APP_STATE_KEY)}&select=*`);
  if (!rows.length) throw new Error("No existe fila app_state con key agenda_ynea_definitiva.");

  const row = rows[0];
  const data = row.data || {};
  data.avisosEnviados = data.avisosEnviados || {};

  const citas = (data.citas || []).filter(c => c.fecha === targetDate);
  let enviados = 0, omitidos = 0, errores = 0;

  for (const cita of citas) {
    const key = avisoKey(cita);
    const p = pacienteDeCita(data, cita);

    if (data.avisosEnviados[key]) {
      omitidos++;
      continue;
    }

    if (!p.email) {
      console.log(`Sin email para cita ${cita.id} paciente ${p.nombre || cita.pacienteId}`);
      omitidos++;
      continue;
    }

    try {
      await sendEmail(
        p.email,
        `Recordatorio de cita en Ynea - ${formatoFechaES(cita.fecha)} ${cita.hora}`,
        mensajeEmail(data, cita)
      );

      data.avisosEnviados[key] = {
        fecha: new Date().toISOString(),
        canal: "email",
        citaId: cita.id,
        pacienteId: cita.pacienteId,
        email: p.email
      };

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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
