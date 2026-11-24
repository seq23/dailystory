import type { ReactNode } from "react";

export interface SchoolTableRow {
  key: string;
  /** The row's name: a student, a skill or a roster entry. */
  title: ReactNode;
  /** One value per column, in order. */
  cells: ReactNode[];
}

/**
 * Every table in the school workspace. On a wide screen it is a plain table; below 480 px
 * each row is a card (.stack-on-phone in index.css): its title, then each value with its
 * column name. One list names both the header row and those labels, so they cannot drift.
 * At 320 and 390 px the tables either clipped or broke words mid-letter (e2e/tables-phone.spec.ts).
 * The explicit roles keep the table's meaning for screen readers once its parts are blocks.
 */
export function SchoolTable({
  caption,
  title,
  columns,
  rows,
}: {
  caption: ReactNode;
  title: string;
  columns: string[];
  rows: SchoolTableRow[];
}) {
  return (
    <div className="school-table">
      <table className="stack-on-phone" role="table">
        <caption>{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              {title}
            </th>
            {columns.map((c) => (
              <th key={c} scope="col" role="columnheader">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((r) => (
            <tr key={r.key} role="row">
              <th scope="row" role="rowheader">
                {r.title}
              </th>
              {columns.map((c, i) => (
                <td key={c} role="cell" data-label={c}>
                  {r.cells[i]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
