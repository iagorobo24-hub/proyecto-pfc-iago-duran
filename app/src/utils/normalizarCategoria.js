/**
 * UTILIDAD DE NORMALIZACIÓN DE CATEGORÍAS
 * 
 * PROBLEMA QUE SOLUCIONA:
 * Las categorías se normalizan en dos lugares distintos (getCategorias() y initCatalog()),
 * cada uno con reglas diferentes. Esto causa que las claves no coincidan y el árbol
 * jerárquico aparezca vacío.
 * 
 * SOLUCIÓN:
 * Una única función de normalización que use TODOS los componentes del stack.
 * - Elimina acentos y caracteres especiales
 * - Pasa a mayúsculas
 * - Reemplaza guiones y espacios múltiples
 * - Trimea espacios al inicio/final
 */

import { FAMILIA_A_CATEGORIA, CATEGORIAS_VALIDAS } from '../data/familiaMapping';

/**
 * Normaliza cualquier string de categoría a un formato canónico
 * @param {string} texto - Texto a normalizar
 * @returns {string|null} - Texto normalizado o null si es inválido
 */
export function normalizarCategoria(texto) {
  if (!texto || typeof texto !== 'string') return null;

  return texto
    .toUpperCase()
    .trim()
    // Eliminar acentos (todas las versiones)
    .replace(/[ÁÀÂÄáàâä]/g, 'A')
    .replace(/[ÉÈÊËéèêë]/g, 'E')
    .replace(/[ÍÌÊÏíìîï]/g, 'I')
    .replace(/[ÓÒÔÖóòôö]/g, 'O')
    .replace(/[ÚÙÛÜúùûü]/g, 'U')
    .replace(/[Ññ]/g, 'N')
    .replace(/[Çç]/g, 'C')
    // Eliminar caracteres no alfanuméricos excepto espacios y guiones
    .replace(/[^A-Z0-9\s\-]/g, '')
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ')
    // Normalizar guiones (reemplazar por espacio para consistencia)
    .replace(/[-]+/g, ' ')
    // Trim final
    .trim();
}

/**
 * Verifica si una categoría normalizada es válida
 * @param {string} categoriaNormalizada
 * @returns {boolean}
 */
export function esCategoriaValida(categoriaNormalizada) {
  if (!categoriaNormalizada) return false;
  const normalizada = normalizarCategoria(categoriaNormalizada);
  return CATEGORIAS_VALIDAS.includes(normalizada);
}

/**
 * Normaliza un valor de familia del campo 'familia' de products
 * Incluye el mapeo manual de familias conocidas
 * @param {string} familia - Valor del campo familia
 * @returns {string|null} - Categoría normalizada o null
 */
export function normalizarFamilia(familia) {
  if (!familia) return null;

  // Primero limpiar el valor
  const limpio = normalizarCategoria(familia);
  if (!limpio) return null;

  // 1. Buscar coincidencia exacta en el mapeo
  if (FAMILIA_A_CATEGORIA[limpio]) {
    return FAMILIA_A_CATEGORIA[limpio];
  }

  // 2. Buscar coincidencia parcial
  for (const [key, value] of Object.entries(FAMILIA_A_CATEGORIA)) {
    const keyNormalizado = normalizarCategoria(key);
    if (limpio.includes(keyNormalizado) || keyNormalizado.includes(limpio.slice(0, 20))) {
      return value;
    }
  }

  // 3. Si no hay coincidencia, verificar si ya es una categoría válida
  if (CATEGORIAS_VALIDAS.includes(limpio)) {
    return limpio;
  }

  // 4. No se pudo clasificar
  return null;
}

/**
 * Normaliza el nombre de categoría desde la tabla 'categories' de Supabase
 * @param {string} name - Campo name de la tabla categories
 * @returns {string|null}
 */
export function normalizarNombreCategoria(name) {
  if (!name) return null;
  return normalizarCategoria(name);
}

export default {
  normalizarCategoria,
  esCategoriaValida,
  normalizarFamilia,
  normalizarNombreCategoria
};
