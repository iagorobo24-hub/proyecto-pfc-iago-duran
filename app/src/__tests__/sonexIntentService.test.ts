import { describe, expect, it } from 'vitest';
import { detectSonexIntent } from '../services/sonexIntentService';

describe('detectSonexIntent', () => {
  it('extracts product criteria with brand and complete technical specs', () => {
    const result = detectSonexIntent('Necesito magnetotérmico marca Marca Norte 2P curva C 16A');

    expect(result.intent).toBe('catalog_lookup');
    expect(result.needsClarification).toBe(false);
    expect(result.criteria.subfamily).toBe('Interruptor Magnetotérmico');
    expect(result.criteria.family).toBe('Protecciones y Cuadros');
    expect(result.criteria.brand).toBe('Marca Norte');
    expect(result.criteria.poles).toBe('2P');
    expect(result.criteria.curve).toBe('C');
    expect(result.criteria.amps).toBe(16);
    expect(result.criteria.confidence).toBeGreaterThan(0.7);
  });

  it('detects recommendation intent without brand', () => {
    const result = detectSonexIntent('Recomienda un magnetotermico 1P+N 20 A curva C');

    expect(result.intent).toBe('product_recommendation');
    expect(result.criteria.brand).toBeUndefined();
    expect(result.criteria.poles).toBe('1P+N');
    expect(result.criteria.amps).toBe(20);
    expect(result.criteria.curve).toBe('C');
  });

  it('asks for clarification on ambiguous product lookup', () => {
    const result = detectSonexIntent('Necesito un magnetotermico');

    expect(result.intent).toBe('clarification_needed');
    expect(result.needsClarification).toBe(true);
    expect(result.clarificationQuestion).toContain('calibre');
  });

  it('keeps general technical questions out of catalog lookup', () => {
    const result = detectSonexIntent('Como se calcula la proteccion de una linea industrial');

    expect(result.intent).toBe('technical_question');
    expect(result.needsClarification).toBe(false);
    expect(result.criteria.productType).toBeUndefined();
  });

  it('detects budget action when product criteria are present', () => {
    const result = detectSonexIntent('Añadir magnetotermico 2P curva C 16A a presupuesto');

    expect(result.intent).toBe('budget_action');
    expect(result.criteria.subfamily).toBe('Interruptor Magnetotérmico');
    expect(result.criteria.amps).toBe(16);
  });
});
