/**
 * SERVICIO DE CATÁLOGO (SUPABASE)
 * Reemplaza a Firestore para la gestión del catálogo
 * Mantiene la misma interfaz pública para compatibilidad con hooks existentes
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';
import localHierarchy from '../data/hierarchy.json';

// Inicializar cliente de Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let hierarchyCache = null;
const productCache = new Map();

/**
 * Obtiene todas las categorías desde Supabase
 */
export async function getCategorias() {
 try {
 const { data: categories, error } = await supabase
 .from('categories')
 .select('id, name')
 .order('name');

 if (error) throw error;

 // Mapear a formato esperado por la UI
 return categories.map(cat => ({
 id: cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim(),
 label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
 icon: '📁',
 color: '#3b82f6'
 }));
 } catch (error) {
 console.error('Error al obtener categorías:', error);
 return [];
 }
}