import { describe, it, expect } from 'vitest'
import { supportsTableView, groupByTable, extractPoles, extractAmps, extractCurve, extractSensitivity, ampToStandard } from '../hooks/useProductTable'

describe('extractPoles', () => {
  it('parses "1P" format', () => {
    expect(extractPoles('Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva')).toBe('1P')
  })
  it('parses "2P" format', () => {
    expect(extractPoles('Magnetotérmico, Acti9 iC60N, 2P, 16 A, C curva')).toBe('2P')
  })
  it('parses "3P" format', () => {
    expect(extractPoles('Multi 9 - C60N - MCB - 3P - 10 A - C Curve')).toBe('3P')
  })
  it('parses "4P" format', () => {
    expect(extractPoles('Multi 9 - C60N - MCB - 4P - 10 A - D Curve')).toBe('4P')
  })
  it('parses "1P+N" format', () => {
    expect(extractPoles('Magnetotérmico RX³ - 1P+N - 230V~ - 10A - curva C')).toBe('1P+N')
  })
  it('parses "1P+N" with space format', () => {
    expect(extractPoles('R9F12620 Interruptor Magnetotérmico; Resi9; 1P+N; 20 A')).toBe('1P+N')
  })
  it('returns "?" for unparseable names', () => {
    expect(extractPoles('Accesorio genérico')).toBe('?')
  })
  it('returns "?" for null/undefined', () => {
    expect(extractPoles(null)).toBe('?')
    expect(extractPoles(undefined)).toBe('?')
  })
})

describe('extractAmps', () => {
  it('parses "10 A" with space', () => {
    expect(extractAmps('Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva')).toBe(10)
  })
  it('parses "4 A" small value', () => {
    expect(extractAmps('A9F04104 Magnetotérmico, Acti9 iC60N, 1P, 4 A, C curva')).toBe(4)
  })
  it('parses "10A" without space', () => {
    expect(extractAmps('Magnetotérmico RX³ - 1P+N - 230V~ - 10A - curva C')).toBe(10)
  })
  it('parses "0.5 A" decimal value', () => {
    expect(extractAmps('A9F75370 Magnetotérmico, Acti9 iC60N, 3P, 0.5 A, D curva')).toBe(0.5)
  })
  it('parses "6.3 A" decimal', () => {
    expect(extractAmps('Magnetotérmico 1P 6.3 A Curva C')).toBe(6.3)
  })
  it('parses "63 A" higher value', () => {
    expect(extractAmps('A9F95463 Magnetotérmico, Acti9 iC60L, 4P, 63 A, K curva')).toBe(63)
  })
  it('ignores kA values', () => {
    expect(extractAmps('Acti9 iC60N, 1P, 4 A, C curva, 6000 A (IEC 60898-1), 50 kA')).toBe(4)
  })
  it('returns 0 for unparseable', () => {
    expect(extractAmps('Accesorio genérico')).toBe(0)
  })
  it('returns 0 for null', () => {
    expect(extractAmps(null)).toBe(0)
  })
})

describe('extractCurve', () => {
  it('parses "C curva" format (Spanish)', () => {
    expect(extractCurve('Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva')).toBe('C')
  })
  it('parses "curva C" format (Spanish reversed)', () => {
    expect(extractCurve('Magnetotérmico RX³ - 1P+N - 10A - curva C')).toBe('C')
  })
  it('parses "B curva" format', () => {
    expect(extractCurve('Magnetotérmico, Acti9 iC60N, 1P, 10 A, B curva')).toBe('B')
  })
  it('parses "D curva" format', () => {
    expect(extractCurve('Magnetotérmico, Acti9 iC60N, 1P, 10 A, D curva')).toBe('D')
  })
  it('parses "K curva" format', () => {
    expect(extractCurve('Magnetotérmico, Acti9 iC60L, 4P, 63 A, K curva')).toBe('K')
  })
  it('parses "C Curve" format (English)', () => {
    expect(extractCurve('Multi 9 - C60N - MCB - 3P - 10 A - C Curve')).toBe('C')
  })
  it('parses "D Curve" format (English)', () => {
    expect(extractCurve('Multi 9 - C60N - MCB - 4P - 10 A - D Curve')).toBe('D')
  })
  it('infers "C" for Resi9 products (R9F prefix)', () => {
    expect(extractCurve('R9F12620 Interruptor Magnetotérmico; Resi9; 1P+N; 20 A')).toBe('C')
  })
  it('infers "TMD" for ComPacT NSX', () => {
    expect(extractCurve('C10H6TM080 ComPacT NSX 6P 80A TMD')).toBe('TMD')
  })
  it('returns "?" for unparseable', () => {
    expect(extractCurve('Accesorio genérico')).toBe('?')
  })
  it('returns "?" for null', () => {
    expect(extractCurve(null)).toBe('?')
  })
})

describe('ampToStandard', () => {
  it('returns exact match for standard value', () => {
    expect(ampToStandard(10)).toBe(10)
    expect(ampToStandard(16)).toBe(16)
    expect(ampToStandard(63)).toBe(63)
  })
  it('rounds to nearest standard step', () => {
    expect(ampToStandard(15.5)).toBe(16)
    expect(ampToStandard(9.5)).toBe(10)
    expect(ampToStandard(5.5)).toBe(6)
  })
})

describe('supportsTableView', () => {
  it('returns false for empty/null/undefined', () => {
    expect(supportsTableView(null)).toBe(false)
    expect(supportsTableView(undefined)).toBe(false)
    expect(supportsTableView([])).toBe(false)
  })

  it('returns true for Schneider Acti 9 iC60 magnetotérmicos', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Schneider ComPacT NSX', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'ComPacT NSX' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Schneider C60 UL CSA IEC', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'C60 UL CSA IEC' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Schneider Resi9', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Resi9' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Legrand RX³ Magnetotermico', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'RX³ Magnetotermico' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Legrand TX³ Magnetotermico', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'TX³ Magnetotermico' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Mosaic magnetotérmicos', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Mosaic' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('handles subfamilia with extra whitespace', () => {
    const products = [
      { subfamilia: '  Interruptor Magnetotérmico  ', Gama: 'Acti 9 iC60' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('falls back to lowercase gama if Gama is undefined', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', gama: 'Acti 9 iC60' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns false for non-magnetotérmico products', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Acti 9 iC60' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })

  it('returns false for mixed subfamilias', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Acti 9 iID' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })

  it('returns false for unknown Gama', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Unknown Gama X' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })

  it('returns false when no Gama and no gama', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })
})

describe('groupByTable', () => {
  it('returns null for empty products', () => {
    expect(groupByTable([])).toBeNull()
    expect(groupByTable(null)).toBeNull()
  })

  it('returns null for non-magnetotérmico products', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Acti 9 iID', name: 'Diferencial Acti9 1P 40A' },
    ]
    expect(groupByTable(products)).toBeNull()
  })

  it('groups Acti 9 iC60 products correctly', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60', name: 'Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60', name: 'Magnetotérmico, Acti9 iC60N, 2P, 16 A, C curva' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60', name: 'Magnetotérmico, Acti9 iC60N, 1P, 16 A, B curva' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('C')
    expect(table.curvas).toContain('B')
    expect(table.polas).toContain('1P')
    expect(table.polas).toContain('2P')
    expect(table.calibres).toContain(10)
    expect(table.calibres).toContain(16)
  })

  it('groups Legrand RX³ products correctly', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'RX³ Magnetotermico', name: 'Magnetotérmico RX³ - 1P+N - 230V~ - 10A - curva C' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'RX³ Magnetotermico', name: 'Magnetotérmico RX³ - 1P+N - 230V~ - 16A - curva C' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'RX³ Magnetotermico', name: 'Magnetotérmico RX³ - 2P - 230/400V~ - 20A - curva C' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('C')
    expect(table.polas).toContain('1P+N')
    expect(table.polas).toContain('2P')
    expect(table.calibres).toContain(10)
    expect(table.calibres).toContain(16)
    expect(table.calibres).toContain(20)
  })

  it('groups Legrand TX³ products correctly', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'TX³ Magnetotermico', name: 'Magnetotérmico TX³ - 1P - 230/400V~ - 6A - curva C - 1 módulo' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'TX³ Magnetotermico', name: 'Magnetotérmico TX³ - 1P - 230/400V~ - 10A - curva C - 1 módulo' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('C')
    expect(table.polas).toContain('1P')
    expect(table.calibres).toContain(6)
    expect(table.calibres).toContain(10)
  })

  it('groups Resi9 products (infer curve C from ref prefix)', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Resi9', name: 'R9F12620 Interruptor Magnetotérmico; Resi9; 1P+N; 20 A' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Resi9', name: 'R9F12625 Interruptor Magnetotérmico; Resi9; 1P+N; 25 A' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('C')
    expect(table.polas).toContain('1P+N')
    expect(table.calibres).toContain(20)
    expect(table.calibres).toContain(25)
  })

  it('groups C60 UL CSA IEC products (D Curve format)', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'C60 UL CSA IEC', name: 'Multi 9 - C60N - MCB - 4P - 10 A - D Curve - 415 V' },
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'C60 UL CSA IEC', name: 'Multi 9 - C60H - MCB - 3P - 20 A - D Curve - 415 V' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('D')
    expect(table.polas).toContain('4P')
    expect(table.polas).toContain('3P')
    expect(table.calibres).toContain(10)
    expect(table.calibres).toContain(20)
  })

  it('handles ComPacT NSX with TMD curve', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'ComPacT NSX', name: 'C10H6TM080 ComPacT NSX 6P 80A TMD' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.curvas).toContain('TMD')
  })
})

describe('extractSensitivity', () => {
  it('parses "30mA" from product name', () => {
    expect(extractSensitivity('Diferencial RX³ - 2P - 230V~ - 30mA- 25A - Tipo AC')).toBe(30)
  })
  it('parses "30 mA" with space', () => {
    expect(extractSensitivity('Acti 9 iID - RCCB - 4P - 63A - 230 V - 30 mA - type A')).toBe(30)
  })
  it('parses "300mA" from product name', () => {
    expect(extractSensitivity('Acti9 iID - 2P - 25A - 300mA - tipo B-SI')).toBe(300)
  })
  it('parses "500mA" from iID name', () => {
    expect(extractSensitivity('iID 4P 40A 500mA-S AC')).toBe(500)
  })
  it('parses "10mA" from Mosaic product', () => {
    expect(extractSensitivity('Interruptor automático diferencial Mosaic - 1P+N - 10A - 30mA')).toBe(30)
  })
  it('parses "1000mA" from product', () => {
    expect(extractSensitivity('Diferencial - 2P - 25A - 1000mA - tipo AC')).toBe(1000)
  })
  it('returns 0 for null/undefined', () => {
    expect(extractSensitivity(null)).toBe(0)
    expect(extractSensitivity(undefined)).toBe(0)
  })
  it('returns 0 for names without mA', () => {
    expect(extractSensitivity('Magnetotérmico 1P 10A Curva C')).toBe(0)
  })
})

describe('supportsTableView — Diferenciales', () => {
  it('returns true for Schneider Acti 9 iID differentials', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Schneider iD differentials', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'iD' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Schneider Vigi differentials', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Acti 9 Vigi para iC60' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Legrand RX³ Diferencial', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'RX³ Diferencial' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Legrand TX³ Diferencial', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'TX³ Diferencial' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns true for Mosaic differentials', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Mosaic' },
    ]
    expect(supportsTableView(products)).toBe(true)
  })

  it('returns false for mixed subfamilias (magnetotérmico + diferencial)', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })

  it('returns false for unknown differential Gama', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Unknown Gama' },
    ]
    expect(supportsTableView(products)).toBe(false)
  })

  it('returns false for empty/null/undefined', () => {
    expect(supportsTableView(null)).toBe(false)
    expect(supportsTableView(undefined)).toBe(false)
    expect(supportsTableView([])).toBe(false)
  })
})

describe('groupByTable — Diferenciales', () => {
  it('groups Schneider Acti 9 iID products by sensitivity × poles × amperage', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID', name: 'Acti9 iID - 4P - 25A - 300mA - tipo AC' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID', name: 'Acti9 iID - 4P - 40A - 300mA - tipo AC' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID', name: 'Acti9 iID - 2P - 25A - 30mA - tipo AC' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'Interruptor diferencial Acti 9 iID', name: 'Acti9 iID - 2P - 40A - 30mA - tipo AC' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.type).toBe('diferencial')
    expect(table.sensitivities).toEqual([30, 300])
    expect(table.polas).toEqual(['2P', '4P'])
    expect(table.calibres).toContain(25)
    expect(table.calibres).toContain(40)
    expect(table.curvas).toBeUndefined()
  })

  it('groups Legrand RX³ Diferencial products', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'RX³ Diferencial', name: 'Diferencial RX³ - 2P - 230V~ - 30mA- 25A - Tipo AC' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'RX³ Diferencial', name: 'Diferencial RX³ - 2P - 230V~ - 30mA- 40A - Tipo AC' },
      { subfamilia: 'Interruptor Diferencial', Gama: 'RX³ Diferencial', name: 'Diferencial RX³ - 2P - 230V~ - 30mA- 25A - Tipo A' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.type).toBe('diferencial')
    expect(table.sensitivities).toEqual([30])
    expect(table.polas).toEqual(['2P'])
    expect(table.calibres).toContain(25)
    expect(table.calibres).toContain(40)
  })

  it('returns null for non-diferencial products', () => {
    const products = [
      { subfamilia: 'Interruptor Diferencial', Gama: 'Unknown Gama', name: 'Diferencial 2P 25A 30mA' },
    ]
    expect(groupByTable(products)).toBeNull()
  })

  it('still works for magnetotérmicos (regression check)', () => {
    const products = [
      { subfamilia: 'Interruptor Magnetotérmico', Gama: 'Acti 9 iC60', name: 'Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva' },
    ]
    const table = groupByTable(products)
    expect(table).not.toBeNull()
    expect(table.type).toBe('magnetotermico')
    expect(table.curvas).toContain('C')
  })
})
