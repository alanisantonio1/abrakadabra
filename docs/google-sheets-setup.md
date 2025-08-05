import { Event } from '../types';

/**
 * Google Sheets helpers for Abrakadabra
 * -------------------------------------
 * Lee y escribe filas en la pestaña "Sheet1" (columnas A‑I).
 *
 * Requisitos para que funcione el modo API Key (sin OAuth):
 *  1) La hoja debe estar en modo «Anyone with the link **can edit**».
 *  2) La clave API debe tener habilitada la Google Sheets API.
 *  3) (Opcional) Restringe la clave a tu dominio en la consola de GCP.
 *
 * ⚠️  Para producción te conviene cambiar a Service Account u OAuth.
 */

// -----------------------------------------------------------------------------
// CONFIGURACIÓN ----------------------------------------------------------------
// -----------------------------------------------------------------------------

// ID de tu spreadsheet (el largo hash en la URL)
const SPREADSHEET_ID = '13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s';

// Nombre de la pestaña + rango de columnas que usamos
const RANGE = 'Sheet1!A:I';

// Reemplázalo por tu propia clave de la consola de Google Cloud
const API_KEY = '8aff616a2f0872fb097d6217fa4685715601daf5';

// -----------------------------------------------------------------------------
// MAPEO DE COLUMNAS ------------------------------------------------------------
// -----------------------------------------------------------------------------

const COL = {
  fecha: 0,
  nombre: 1,
  telefono: 2,
  paquete: 3,
  estado: 4,
  anticipoPagado: 5,
  totalEvento: 6,
  fechaPago: 7,
  notificadoLunes: 8
} as const;

type ColKey = keyof typeof COL;

interface GoogleSheetsRow {
  [K in ColKey]: string;
}

// -----------------------------------------------------------------------------
// CONVERSORES ------------------------------------------------------------------
// -----------------------------------------------------------------------------

/** Convierte un objeto Event a la forma de fila que espera la hoja */
const eventToSheetRow = (event: Event): GoogleSheetsRow => ({
  fecha: event.date,
  nombre: `${event.customerName} (${event.childName})`,
  telefono: event.customerPhone,
  paquete: event.packageType,
  estado: event.isPaid ? 'Pagado' : 'Pendiente',
  anticipoPagado: String(event.deposit),
  totalEvento: String(event.totalAmount),
  fechaPago: event.isPaid ? event.date : '',
  notificadoLunes: 'No'
});

/** Convierte una fila de la hoja en Event (o null si está mal formada) */
const sheetRowToEvent = (row: any[], index: number): Event | null => {
  if (!row || row.length < 4) return null;

  const rawName = row[COL.nombre] ?? '';
  const nameMatch = rawName.match(/^(.+?)\s*\((.+?)\)$/);

  return {
    id: `sheet_${index}`,
    date: row[COL.fecha] ?? '',
    time: '15:00', // no se guarda la hora en la hoja
    customerName: nameMatch ? nameMatch[1].trim() : rawName,
    childName: nameMatch ? nameMatch[2].trim() : '',
    customerPhone: row[COL.telefono] ?? '',
    packageType: (row[COL.paquete] as 'Abra' | 'Kadabra' | 'Abrakadabra') ?? 'Abra',
    totalAmount: parseFloat(row[COL.totalEvento] ?? '0'),
    deposit: parseFloat(row[COL.anticipoPagado] ?? '0'),
    remainingAmount: parseFloat(row[COL.totalEvento] ?? '0') - parseFloat(row[COL.anticipoPagado] ?? '0'),
    isPaid: String(row[COL.estado] ?? '').toLowerCase() === 'pagado',
    notes: '',
    createdAt: new Date().toISOString()
  };
};

// -----------------------------------------------------------------------------
// ENDPOINT BASE ----------------------------------------------------------------
// -----------------------------------------------------------------------------

const sheetsBaseURL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// -----------------------------------------------------------------------------
// FUNCIONES PÚBLICAS -----------------------------------------------------------
// -----------------------------------------------------------------------------

/** Descarga todos los eventos de la hoja */
export async function loadEventsFromGoogleSheets(): Promise<Event[]> {
  try {
    const res = await fetch(`${sheetsBaseURL}/${encodeURIComponent(RANGE)}?key=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rows: any[][] = data.values ?? [];

    const events: Event[] = [];
    for (let i = 1; i < rows.length; i++) { // salta encabezado
      const ev = sheetRowToEvent(rows[i], i);
      if (ev) events.push(ev);
    }

    return events;
  } catch (err) {
    console.error('loadEventsFromGoogleSheets:', err);
    return [];
  }
}

/** Agrega un nuevo evento (append) */
export async function saveEventToGoogleSheets(event: Event): Promise<boolean> {
  try {
    const r = eventToSheetRow(event);

    const body = {
      values: [[
        r.fecha,
        r.nombre,
        r.telefono,
        r.paquete,
        r.estado,
        r.anticipoPagado,
        r.totalEvento,
        r.fechaPago,
        r.notificadoLunes
      ]]
    };

    const res = await fetch(`${sheetsBaseURL}/${encodeURIComponent(RANGE)}:append?valueInputOption=RAW&key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error('saveEventToGoogleSheets:', err);
    return false;
  }
}

/** Actualiza la fila indicada (empieza en 1 sin contar encabezado) */
export async function updateEventInGoogleSheets(event: Event, rowIndex: number): Promise<boolean> {
  try {
    const r = eventToSheetRow(event);
    const range = `Sheet1!A${rowIndex + 1}:I${rowIndex + 1}`;

    const body = {
      values: [[
        r.fecha,
        r.nombre,
        r.telefono,
        r.paquete,
        r.estado,
        r.anticipoPagado,
        r.totalEvento,
        r.fechaPago,
        r.notificadoLunes
      ]]
    };

    const res = await fetch(`${sheetsBaseURL}/${encodeURIComponent(range)}?valueInputOption=RAW&key=${API_KEY}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error('updateEventInGoogleSheets:', err);
    return false;
  }
}

/**
 * Eliminar filas vía API Key requiere un batchUpdate y el sheetId numérico.
 * Se deja como pendiente porque suele usarse poco en flujo móvil.
 */
export async function deleteEventFromGoogleSheets(_rowIndex: number): Promise<boolean> {
  console.warn('deleteEventFromGoogleSheets: not implemented (API key mode)');
  return false;
}
