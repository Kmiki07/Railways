import { getPathFromFieldType } from "./field.js";

export function render(state) {
    return renderTable(state.board);
}

function renderTable(table) {
    return `
        <table>
            ${table.map(row => renderRow(row)).join("")}
        </table>
`
}

function renderRow(row) {
    return `
        <tr>
            ${row.map(field => renderField(field)).join("")}
        </tr>
    `
}

function renderField(field) {
    return `
        <td>
            <img src="${getPathFromFieldType(field.fieldType)}" class="rotate-${field.defaultRotation}">
        </td>
    `;
}

export function renderLeaderboard(leaderboard) {
    return `
        <h3>Leaderboard</h3>
        <ol>
            ${leaderboard.map(entry => `<li>${entry.name} - ${entry.time}</li>`).join('')}
        </ol>
    `;
}