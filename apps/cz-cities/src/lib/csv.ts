// Minimal RFC 4180 CSV parser — no dependency needed for the three small
// standard tables (persons/organizations/memberships, a few hundred rows
// each) this app reads. Handles quoted fields, doubled-quote escaping,
// embedded commas, and embedded newlines inside quoted fields (the city data
// pipeline's `sources`/`identifiers` columns are JSON blobs that legally
// contain commas and quotes — see src/fixtures/praha/data/*.csv).
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  // last field/row (file may or may not end with a newline)
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  if (rows.length === 0) return [];
  const header = rows[0]!;
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = cols[idx] ?? "";
    });
    return obj;
  });
}
