import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'

const ROOM_PREFIX = 'simulacion:'
const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()

export default function useSimuladorMultijugador(operario) {
  const [roomCode, setRoomCode] = useState(null)
  const [jugadores, setJugadores] = useState([])
  const [rol, setRol] = useState(null)
  const [estado, setEstado] = useState('idle')
  const [error, setError] = useState(null)
  const [partidaIniciada, setPartidaIniciada] = useState(false)
  const [eventos, setEventos] = useState([])
  const channelRef = useRef(null)
  const presenciaRef = useRef(null)

  const limpiarCanal = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      presenciaRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const crearSala = useCallback(() => {
    const code = genCode()
    setRoomCode(code)
    setRol('host')
    setError(null)

    const channel = supabase.channel(`${ROOM_PREFIX}${code}`, {
      config: { broadcast: { self: true }, presence: { key: '' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const lista = Object.values(state).flat().map(p => ({
          userId: p.userId,
          nombre: p.nombre,
          puntuacion: p.puntuacion ?? 0,
          etapa: p.etapa ?? 'Esperando',
          tiempoTotal: p.tiempoTotal ?? 0,
          finalizado: p.finalizado ?? false,
          conectado: true,
        })).sort((a, b) => b.puntuacion - a.puntuacion || a.tiempoTotal - b.tiempoTotal)
        setJugadores(lista)
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .on('broadcast', { event: 'game:start' }, () => {
        setPartidaIniciada(true)
        setEstado('jugando')
      })
      .on('broadcast', { event: 'player:finish' }, ({ payload }) => {
        setEventos(prev => [`🏁 ${payload.nombre} finalizó con ${payload.puntuacion}pts`, ...prev].slice(0, 20))
      })
      .on('broadcast', { event: 'player:progress' }, ({ payload }) => {
        setEventos(prev => [`▶ ${payload.nombre} completó etapa ${payload.etapa} (${payload.tiempoEtapa}s)`, ...prev].slice(0, 20))
      })
      .on('broadcast', { event: 'game:abort' }, () => {
        setEstado('idle')
        setPartidaIniciada(false)
        setEventos([])
      })

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track({
        userId: operario?.userId || 'anon',
        nombre: operario?.nombre || 'Anónimo',
        puntuacion: 0,
        etapa: 'Esperando',
        tiempoTotal: 0,
        finalizado: false,
      })
    })

    channelRef.current = channel
    setEstado('espera')
  }, [operario])

  const unirseSala = useCallback((code) => {
    const normalized = code.toUpperCase().trim()
    setRoomCode(normalized)
    setRol('player')
    setError(null)

    const channel = supabase.channel(`${ROOM_PREFIX}${normalized}`, {
      config: { broadcast: { self: true }, presence: { key: '' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const lista = Object.values(state).flat().map(p => ({
          userId: p.userId, nombre: p.nombre, puntuacion: p.puntuacion ?? 0,
          etapa: p.etapa ?? 'Esperando', tiempoTotal: p.tiempoTotal ?? 0,
          finalizado: p.finalizado ?? false, conectado: true,
        })).sort((a, b) => b.puntuacion - a.puntuacion || a.tiempoTotal - b.tiempoTotal)
        setJugadores(lista)
        const host = lista[0]
        if (host && host.finalizado) setPartidaIniciada(true)
      })
      .on('broadcast', { event: 'game:start' }, () => {
        setPartidaIniciada(true); setEstado('jugando')
      })
      .on('broadcast', { event: 'player:finish' }, ({ payload }) => {
        setEventos(prev => [`🏁 ${payload.nombre} finalizó con ${payload.puntuacion}pts`, ...prev].slice(0, 20))
      })
      .on('broadcast', { event: 'player:progress' }, ({ payload }) => {
        setEventos(prev => [`▶ ${payload.nombre} completó etapa ${payload.etapa} (${payload.tiempoEtapa}s)`, ...prev].slice(0, 20))
      })
      .on('broadcast', { event: 'game:abort' }, () => {
        setEstado('idle'); setPartidaIniciada(false); setEventos([])
      })

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') {
        setError('No se pudo conectar a la sala. Verifica el código.')
        return
      }
      await channel.track({
        userId: operario?.userId || 'anon',
        nombre: operario?.nombre || 'Anónimo',
        puntuacion: 0, etapa: 'Esperando', tiempoTotal: 0, finalizado: false,
      })
    })

    channelRef.current = channel
    setEstado('espera')
  }, [operario])

  const iniciarPartida = useCallback(() => {
    if (rol !== 'host' || !channelRef.current) return
    channelRef.current.send({ type: 'broadcast', event: 'game:start', payload: {} })
    setPartidaIniciada(true)
    setEstado('jugando')
  }, [rol])

  const actualizarProgreso = useCallback(({ etapa, puntuacion, tiempoTotal }) => {
    if (!channelRef.current) return
    channelRef.current.track({
      userId: operario?.userId || 'anon',
      nombre: operario?.nombre || 'Anónimo',
      puntuacion,
      etapa: String(etapa),
      tiempoTotal,
      finalizado: false,
    })
    channelRef.current.send({
      type: 'broadcast',
      event: 'player:progress',
      payload: { nombre: operario?.nombre || 'Anónimo', etapa, puntuacion, tiempoEtapa: tiempoTotal },
    })
  }, [operario])

  const finalizarPartida = useCallback(({ puntuacion, tiempoTotal }) => {
    if (!channelRef.current) return
    channelRef.current.track({
      userId: operario?.userId || 'anon',
      nombre: operario?.nombre || 'Anónimo',
      puntuacion,
      etapa: 'Completado',
      tiempoTotal,
      finalizado: true,
    })
    channelRef.current.send({
      type: 'broadcast',
      event: 'player:finish',
      payload: { nombre: operario?.nombre || 'Anónimo', puntuacion, tiempoTotal },
    })
    setEstado('resultados')
  }, [operario])

  const abandonarSala = useCallback(() => {
    limpiarCanal()
    setRoomCode(null)
    setJugadores([])
    setRol(null)
    setEstado('idle')
    setPartidaIniciada(false)
    setEventos([])
    setError(null)
  }, [limpiarCanal])

  return {
    roomCode, jugadores, rol, estado, error, eventos, partidaIniciada,
    crearSala, unirseSala, iniciarPartida, actualizarProgreso, finalizarPartida, abandonarSala,
  }
}
