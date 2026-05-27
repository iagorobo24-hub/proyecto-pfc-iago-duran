let _jsPDF = null
let _html2canvas = null

async function getJsPDF() {
  if (!_jsPDF) {
    const mod = await import('jspdf')
    _jsPDF = mod.jsPDF
  }
  return _jsPDF
}

async function getHtml2canvas() {
  if (!_html2canvas) {
    const mod = await import('html2canvas')
    _html2canvas = mod.default
  }
  return _html2canvas
}

export async function captureElementToPDF(element, {
  filename = 'documento.pdf',
  format = 'a4',
  margin = 10,
  scale = 2,
} = {}) {
  const html2canvas = await getHtml2canvas()
  const { jsPDF } = await getJsPDF()
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({ format, unit: 'mm' })
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pdfWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = margin
  let page = 0

  pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
  heightLeft -= (pdfHeight - margin * 2)

  while (heightLeft > 0) {
    page++
    position = margin - (pdfHeight - margin * 2) * page
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
    heightLeft -= (pdfHeight - margin * 2)
  }

  pdf.save(filename)
  return pdf
}

export function generarPDFPresupuesto({ presupuesto, datosCliente, numPresupuesto, elemento }) {
  return captureElementToPDF(elemento, {
    filename: `presupuesto_${numPresupuesto || Date.now()}.pdf`,
    scale: 2,
  })
}

export function generarPDFIncidencias(incidencias, elemento) {
  return captureElementToPDF(elemento, {
    filename: `informe_incidencias_${Date.now()}.pdf`,
    scale: 2,
  })
}

export function generarPDFKPI({ datos, kpis, informe, elemento }) {
  return captureElementToPDF(elemento, {
    filename: `informe_kpi_${Date.now()}.pdf`,
    scale: 2,
  })
}

export async function generarPDFResumenIncidencias(incidencias, datosDelegacion = '') {
  const { jsPDF } = await getJsPDF()
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  let y = 20

  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Informe de Incidencias', 20, y)
  y += 8

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 20, y)
  if (datosDelegacion) {
    pdf.text(`Delegación: ${datosDelegacion}`, 20, y + 4)
  }
  y += 14

  const criticas = incidencias.filter(i => i.severidad === 'Crítica' && i.estado !== 'Resuelta')
  const abiertas = incidencias.filter(i => i.estado === 'Abierta' || i.estado === 'En diagnóstico')
  const resueltas = incidencias.filter(i => i.estado === 'Resuelta')

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Resumen', 20, y); y += 7
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`Total incidencias: ${incidencias.length}`, 20, y); y += 5
  pdf.text(`Críticas sin resolver: ${criticas.length}`, 20, y); y += 5
  pdf.text(`En curso: ${abiertas.length}`, 20, y); y += 5
  pdf.text(`Resueltas: ${resueltas.length}`, 20, y); y += 10

  if (criticas.length > 0) {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(200, 50, 50)
    pdf.text('Incidencias Críticas', 20, y); y += 7
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    criticas.forEach((inc, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${inc.equipo} — ${inc.sintoma} (${inc.zona})`, pageWidth - 40)
      lines.forEach(line => { pdf.text(line, 20, y); y += 4 })
      const t = Math.floor((Date.now() - inc.fechaCreacion) / 3600000)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`   Creada hace ${t}h · Severidad: ${inc.severidad}`, 20, y)
      pdf.setTextColor(0, 0, 0)
      y += 7
      if (y > 270) { pdf.addPage(); y = 20 }
    })
    y += 3
  }

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Todas las incidencias', 20, y); y += 7
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  incidencias.forEach((inc, i) => {
    const estadoIcon = inc.estado === 'Resuelta' ? '✓' : inc.estado === 'Crítica' ? '!!' : '○'
    const line = `${estadoIcon} [${inc.severidad}] ${inc.equipo} — ${inc.sintoma} | ${inc.zona} | ${inc.estado}`
    const lines = pdf.splitTextToSize(line, pageWidth - 40)
    lines.forEach(l => { pdf.text(l, 20, y); y += 4 })
    y += 2
    if (y > 275) { pdf.addPage(); y = 20 }
  })

  pdf.save(`incidencias_${Date.now()}.pdf`)
  return pdf
}

export async function generarPDFKPICompleto({ kpis, datos, informe, BENCHMARKS }) {
  const { jsPDF } = await getJsPDF()
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  let y = 20

  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Informe Ejecutivo KPI Logístico', 20, y)
  y += 8

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 20, y)
  y += 6
  if (datos.delegacion) { pdf.text(`Delegación: ${datos.delegacion}`, 20, y); y += 5 }
  pdf.text(`Turno: ${datos.turno} · Pedidos: ${datos.pedidos} · Horas: ${datos.horas} · Operarios: ${datos.operarios}`, 20, y)
  y += 12

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Indicadores', 20, y); y += 8

  const headers = [['Indicador', 'Valor', 'Objetivo', 'Estado']]
  const rows = Object.entries(BENCHMARKS).map(([key, b]) => {
    const valor = kpis[key]
    const objStr = b.invertido ? `< ${b.bueno}` : `> ${b.bueno}`
    let estado = '✓'
    if (b.invertido) { estado = valor <= b.bueno ? '✓ Objetivo' : valor >= b.malo ? '✗ Crítico' : '⚠ Atención' }
    else { estado = valor >= b.bueno ? '✓ Objetivo' : valor <= b.malo ? '✗ Crítico' : '⚠ Atención' }
    return [b.label, `${valor.toFixed(1)} ${b.unidad}`, objStr, estado]
  })

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  const colWidths = [60, 40, 30, 40]
  let x = 20
  headers[0].forEach((h, i) => { pdf.text(h, x, y); x += colWidths[i] })
  y += 5
  pdf.setDrawColor(200, 200, 200)
  pdf.line(20, y - 1, pageWidth - 20, y - 1)
  pdf.setFont('helvetica', 'normal')

  rows.forEach(row => {
    x = 20
    if (y > 270) { pdf.addPage(); y = 20 }
    row.forEach((cell, i) => {
      if (i === 3) {
        if (cell.includes('Crítico')) pdf.setTextColor(200, 50, 50)
        else if (cell.includes('Atención')) pdf.setTextColor(200, 150, 0)
        else pdf.setTextColor(50, 150, 50)
      }
      pdf.text(cell, x, y)
      if (i === 3) pdf.setTextColor(0, 0, 0)
      x += colWidths[i]
    })
    y += 6
  })

  y += 4

  if (informe) {
    if (y > 240) { pdf.addPage(); y = 20 }
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Informe de análisis', 20, y); y += 7
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const lines = pdf.splitTextToSize(informe, pageWidth - 40)
    lines.forEach(line => { pdf.text(line, 20, y); y += 5; if (y > 275) { pdf.addPage(); y = 20 } })
  }

  pdf.save(`informe_kpi_${Date.now()}.pdf`)
  return pdf
}
