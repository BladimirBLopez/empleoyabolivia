import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── EMPLEOS ──────────────────────────────────────────────────────────────────

export async function getEmpleos({ search = '', location = '', categoria = '', tipo = '', experiencia = '', estudio = '', limit = 20, offset = 0 } = {}) {
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
  if (experiencia) query = query.eq('experiencia_minima', experiencia);
  if (estudio) query = query.eq('estudio_minimo', estudio);

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
  const { data: postulaciones, error } = await supabase
    .from('postulaciones')
    .select('*')
    .eq('empleo_id', empleo_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!postulaciones || postulaciones.length === 0) return [];

  // No hay foreign key declarada entre postulaciones.clerk_user_id y
  // perfiles.clerk_user_id (Clerk maneja los usuarios, no Supabase Auth),
  // así que el join automático de Supabase (select('*, perfiles(*)')) no
  // funciona. Traemos los perfiles por separado y los unimos en memoria.
  const userIds = postulaciones.map(p => p.clerk_user_id);
  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles')
    .select('*')
    .in('clerk_user_id', userIds);
  if (perfilesError) throw perfilesError;

  const perfilPorUserId = new Map((perfiles || []).map(p => [p.clerk_user_id, p]));
  return postulaciones.map(p => ({ ...p, perfiles: perfilPorUserId.get(p.clerk_user_id) || null }));
}

// Trae TODAS las postulaciones de TODAS las ofertas de una empresa,
// incluyendo el perfil del candidato y el título de la oferta a la que postuló.
export async function getCandidatosPorEmpresa(clerk_empresa_id) {
  // 1. Ofertas de esta empresa
  const { data: empleos, error: empleosError } = await supabase
    .from('empleos')
    .select('id, titulo')
    .eq('clerk_empresa_id', clerk_empresa_id);
  if (empleosError) throw empleosError;
  if (!empleos || empleos.length === 0) return [];

  const empleoIds = empleos.map(e => e.id);
  const empleoPorId = new Map(empleos.map(e => [e.id, e]));

  // 2. Postulaciones a esas ofertas
  const { data: postulaciones, error: postError } = await supabase
    .from('postulaciones')
    .select('*')
    .in('empleo_id', empleoIds)
    .order('created_at', { ascending: false });
  if (postError) throw postError;
  if (!postulaciones || postulaciones.length === 0) return [];

  // 3. Perfiles de los candidatos que postularon (no hay FK declarada hacia
  // perfiles porque Clerk maneja los usuarios, no Supabase Auth, así que
  // unimos en memoria en vez de usar el join automático de Supabase).
  const userIds = postulaciones.map(p => p.clerk_user_id);
  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles')
    .select('*')
    .in('clerk_user_id', userIds);
  if (perfilesError) throw perfilesError;
  const perfilPorUserId = new Map((perfiles || []).map(p => [p.clerk_user_id, p]));

  return postulaciones.map(p => ({
    ...p,
    perfiles: perfilPorUserId.get(p.clerk_user_id) || null,
    empleos: empleoPorId.get(p.empleo_id) || null,
  }));
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

// ── EXPERIENCIAS (varias entradas por candidato, estilo InfoJobs) ──────────

export async function getExperiencias(clerk_user_id) {
  const { data, error } = await supabase
    .from('experiencias')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .order('fecha_inicio', { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearExperiencia(experiencia) {
  const { data, error } = await supabase
    .from('experiencias')
    .insert([experiencia])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarExperiencia(id, cambios) {
  const { data, error } = await supabase
    .from('experiencias')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarExperiencia(id) {
  const { error } = await supabase.from('experiencias').delete().eq('id', id);
  if (error) throw error;
}

// ── ESTUDIOS (varias entradas por candidato, estilo InfoJobs) ──────────────

export async function getEstudios(clerk_user_id) {
  const { data, error } = await supabase
    .from('estudios')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .order('fecha_inicio', { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearEstudio(estudio) {
  const { data, error } = await supabase
    .from('estudios')
    .insert([estudio])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarEstudio(id, cambios) {
  const { data, error } = await supabase
    .from('estudios')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarEstudio(id) {
  const { error } = await supabase.from('estudios').delete().eq('id', id);
  if (error) throw error;
}
