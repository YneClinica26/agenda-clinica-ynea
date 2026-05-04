CONFIGURAR SUPABASE PARA AGENDA CLINICA YNEA

1. Entra en https://supabase.com y crea un proyecto.
2. Abre SQL Editor y ejecuta el archivo SQL_SUPABASE_YNEA.sql.
3. En Supabase ve a Project Settings > API.
4. Copia Project URL y anon public key.
5. Publica estos archivos en GitHub/Vercel.
6. Abre la app en Chrome, entra en Configuración > Base de datos Supabase.
7. Pega Project URL y anon public key.
8. Pulsa “Subir datos actuales” si quieres conservar tus datos locales actuales.
9. En iPhone abre la URL de Vercel: la app cargará los datos desde Supabase.

IMPORTANTE: la anon public key es normal que esté en el frontend. Para una clínica real con usuarios, lo siguiente sería añadir login y políticas por usuario.
