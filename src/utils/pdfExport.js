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
