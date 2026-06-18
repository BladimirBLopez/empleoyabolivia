import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── EMPLEOS ──────────────────────────────────────────────────────────────────

export async function getEmpleos({ search = '', location = '', categoria = '', tipo = '', limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('empleos')
    .select('*', { count: 'exact' })
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.or(`titulo.ilike.%${search}%,empresa.ilike.%${search}%,descripcion.ilike.%${search}%`);
  if (location) query = query.ilike('ciudad', `%${location}%`);
  if (categoria) query = query.eq('categoria', categoria);
  if (tipo) query = query.eq('tipo_contrato', tipo);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getEmpleo(id) {
  const { data, error } = await supabase
    .from('empleos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function crearEmpleo(empleo) {
  const { data, error } = await supabase.from('empleos').insert([empleo]).select().single();
  if (error) throw error;
  return data;
}

export async function getEmpleosPorEmpresa(clerk_empresa_id) {
  const { data, error } = await supabase
    .from('empleos')
    .select('*, postulaciones(count)')
    .eq('clerk_empresa_id', clerk_empresa_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function toggleEmpleo(id, activo) {
  const { error } = await supabase.from('empleos').update({ activo }).eq('id', id);
  if (error) throw error;
}

export async function eliminarEmpleo(id) {
  const { error } = await supabase.from('empleos').delete().eq('id', id);
  if (error) throw error;
}

// ── POSTULACIONES ─────────────────────────────────────────────────────────────

export async function postular(empleo_id, clerk_user_id) {
  const { data: existe } = await supabase
    .from('postulaciones')
    .select('id')
    .eq('empleo_id', empleo_id)
    .eq('clerk_user_id', clerk_user_id)
    .single();
  if (existe) return { yaPostulo: true };

  const { data, error } = await supabase
    .from('postulaciones')
    .insert([{ empleo_id, clerk_user_id, estado: 'pendiente' }])
    .select()
    .single();
  if (error) throw error;
  return { data, yaPostulo: false };
}

export async function getPostulacionesCandidato(clerk_user_id) {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*, empleos(*)')
    .eq('clerk_user_id', clerk_user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPostulacionesEmpleo(empleo_id) {
  const { data, error } = await supabase
    .from('postulaciones')
    .select('*, perfiles(*)')
    .eq('empleo_id', empleo_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function yaPostulo(empleo_id, clerk_user_id) {
  const { data } = await supabase
    .from('postulaciones')
    .select('id')
    .eq('empleo_id', empleo_id)
    .eq('clerk_user_id', clerk_user_id)
    .single();
  return !!data;
}

export async function actualizarEstadoPostulacion(id, estado) {
  const { error } = await supabase.from('postulaciones').update({ estado }).eq('id', id);
  if (error) throw error;
}

// ── PERFILES ──────────────────────────────────────────────────────────────────

export async function getPerfil(clerk_user_id) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertPerfil(perfil) {
  const { data, error } = await supabase
    .from('perfiles')
    .upsert([perfil], { onConflict: 'clerk_user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
