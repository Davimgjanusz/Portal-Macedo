import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

const calendar = google.calendar({ version: 'v3', auth: getAuth() });

export async function criarEventoAula({ aluno, data, duracao, modalidade, linkChamada }) {
  const start = new Date(data);
  const end = new Date(start.getTime() + duracao * 60 * 60 * 1000);

  const event = {
    summary: `Aula — ${aluno}${modalidade === 'presencial' ? ' [Presencial]' : ''}`,
    description: modalidade === 'presencial'
      ? 'Aula presencial de matemática'
      : 'Aula por chamada de vídeo',
    start: { dateTime: start.toISOString(), timeZone: 'America/Sao_Paulo' },
    end: { dateTime: end.toISOString(), timeZone: 'America/Sao_Paulo' },
    ...(modalidade === 'online' && {
      conferenceData: {
        createRequest: { requestId: `aula-${Date.now()}` },
      },
    }),
  };

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    resource: event,
    conferenceDataVersion: modalidade === 'online' ? 1 : 0,
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink || linkChamada || null,
  };
}

export async function listarEventos(timeMin, timeMax) {
  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  return response.data.items || [];
}
