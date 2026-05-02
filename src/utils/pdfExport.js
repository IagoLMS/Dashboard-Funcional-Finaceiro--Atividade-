import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KPI_DATA, DEPARTMENTS } from './data';

export function exportPDF() {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString(
    'pt-BR', 
    { day: '2-digit', month: 'long', year: 'numeric' }
  );

  // Header bar
  doc.setFillColor(17, 73, 126)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Start Solidarium', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório Financeiro Mensal', 14, 21)
  doc.text(`Gerado em: ${now}`, 140, 21)

  // KPI section
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Indicadores-Chave (KPIs)', 14, 40)

  const fmt = (v) => `R$ ${v.toLocaleString('pt-BR')}`
  const kpis = [
    ['Receita Mensal', fmt(KPI_DATA.receita), `+${KPI_DATA.receitaTrend}% vs mês anterior`],
    ['Despesas Mensais', fmt(KPI_DATA.despesas), `${KPI_DATA.custosTrend}% vs mês anterior`],
    ['Lucro Líquido', fmt(KPI_DATA.lucro), ''],
    ['Margem de Lucro', `${KPI_DATA.margem}%`, ''],
  ]

  autoTable(doc, {
    startY: 45,
    head: [['Indicador', 'Valor', 'Variação']],
    body: kpis,
    headStyles: { fillColor: [27, 157, 70], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  })

  // Departments table
  const deptY = doc.lastAutoTable.finalY + 12
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Custos por Departamento', 14, deptY)

  const total = DEPARTMENTS.reduce((s, d) => s + d.value, 0)
  const deptRows = DEPARTMENTS.map(d => [
    d.name,
    `R$ ${d.value.toLocaleString('pt-BR')}`,
    `${((d.value / total) * 100).toFixed(1)}%`
  ])

  autoTable(doc, {
    startY: deptY + 5,
    head: [['Departamento', 'Custo', '% do Total']],
    body: deptRows,
    headStyles: { fillColor: [10, 74, 113], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageH = doc.internal.pageSize.height
  doc.setFillColor(240, 242, 245)
  doc.rect(0, pageH - 12, 210, 12, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('StartSolidarium — Sistema Financeiro Corporativo | Documento gerado automaticamente', 14, pageH - 4)

  doc.save(`relatorio-financeiro-${new Date().toISOString().slice(0,10)}.pdf`)
}

// -------- Receivables (Contas a Receber) --------

const STATUS_LABELS = { paid: 'Pago', pending: 'Pendente', overdue: 'Atrasado' };
const STATUS_COLORS = {
  paid:    [27,  157, 70],
  pending: [240, 153, 45],
  overdue: [215, 29,  45],
};

const fmtBRL  = (v) => `R$ ${(Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtDate = (s) => s ? new Date(s + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

export function exportReceivablesPDF({ items = [], kpis = {}, filters = {} } = {}) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString(
    'pt-BR',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );

  // Header bar
  doc.setFillColor(17, 73, 126)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Start Solidarium', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório de Contas a Receber', 14, 21)
  doc.text(`Gerado em: ${now}`, 140, 21)

  // Active filters summary
  let cursorY = 38

  const activeFilters = []
  if(filters.search)            activeFilters.push(`Cliente: "${filters.search}"`)
  if(filters.status !== 'all')  activeFilters.push(`Status: ${STATUS_LABELS[filters.status] || filters.status}`)
  if(filters.dateFrom)          activeFilters.push(`Venc. desde: ${fmtDate(filters.dateFrom)}`)
  if(filters.dateTo)            activeFilters.push(`Venc. até: ${fmtDate(filters.dateTo)}`)

  if(activeFilters.length > 0) {
    doc.setTextColor(100)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'italic')
    doc.text(`Filtros aplicados: ${activeFilters.join('  •  ')}`, 14, cursorY)
    cursorY += 8
  }

  // KPIs section
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Financeiro', 14, cursorY)

  const kpiRows = [
    ['Total a Receber', fmtBRL(kpis.totalReceivable), `${kpis.totalCount || 0} conta(s)`],
    ['Em Aberto',       fmtBRL(kpis.totalOpen),       `${kpis.openCount  || 0} pendente(s)`],
    ['Em Atraso',       fmtBRL(kpis.totalOverdue),    `${kpis.overdueCount || 0} conta(s) — Inadimplência: ${kpis.defaultRate || '0.0'}%`],
    ['Recebido no Mês', fmtBRL(kpis.totalReceivedMonth), 'Pagamentos confirmados'],
  ]

  autoTable(doc, {
    startY: cursorY + 4,
    head:   [['Indicador', 'Valor', 'Detalhe']],
    body:   kpiRows,
    styles:             { fontSize: 10, cellPadding: 4 },
    headStyles:         { fillColor: [27, 157, 70], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  // Receivables list
  cursorY = doc.lastAutoTable.finalY + 12
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`Lista de Contas (${items.length})`, 14, cursorY)

  const rows = items.map(r => {
    const balance = Math.max(0, (Number(r.totalValue) || 0) - (Number(r.paidValue) || 0))
    return [
      r.client,
      r.origin || '—',
      fmtBRL(r.totalValue),
      fmtBRL(r.paidValue),
      fmtBRL(balance),
      fmtDate(r.dueDate),
      STATUS_LABELS[r._status] || r._status || '—',
    ]
  })

  autoTable(doc, {
    startY: cursorY + 4,
    head:   [['Cliente', 'Origem', 'Total', 'Pago', 'Saldo', 'Vencimento', 'Status']],
    body:   rows.length > 0 ? rows : [[{ content: 'Nenhuma conta encontrada com os filtros aplicados.', colSpan: 7, styles: { halign: 'center', textColor: 120, fontStyle: 'italic' } }]],
    styles:             { fontSize: 8.5, cellPadding: 3 },
    headStyles:         { fillColor: [10, 74, 113], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right', textColor: [27, 157, 70] },
      4: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if(data.section !== 'body' || data.column.index !== 6) return
      const status = items[data.row.index]?._status
      const color  = STATUS_COLORS[status]
      if(color) data.cell.styles.textColor = color
    },
    margin: { left: 14, right: 14 },
  })

  // Footer + page numbers (in every page)
  const pageH     = doc.internal.pageSize.height
  const pageCount = doc.internal.getNumberOfPages()

  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(240, 242, 245)
    doc.rect(0, pageH - 12, 210, 12, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text('StartSolidarium — Sistema Financeiro Corporativo | Documento gerado automaticamente', 14, pageH - 4)
    doc.text(`Página ${i} de ${pageCount}`, 175, pageH - 4)
  }

  doc.save(`contas-a-receber-${new Date().toISOString().slice(0, 10)}.pdf`)
}
