import { useState } from 'react'
import Button from '../ui/Button'
import styles from './SalaMultijugador.module.css'

export default function SalaMultijugador({
  roomCode, jugadores, rol, error, eventos, partidaIniciada,
  crearSala, unirseSala, iniciarPartida, abandonarSala,
}) {
  const [tab, setTab] = useState('crear')
  const [codigoInput, setCodigoInput] = useState('')

  const handleUnirse = () => { if (codigoInput.trim()) unirseSala(codigoInput) }

  if (roomCode) {
    const isHost = rol === 'host'
    const allReady = jugadores.length >= 1 && isHost

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.roomLabel}>SALA</span>
          <span className={styles.roomCode}>{roomCode}</span>
          <div className={styles.roleBadge} data-role={rol}>
            {isHost ? '🖥 Anfitrión' : '👤 Jugador'}
          </div>
        </div>

        {!partidaIniciada && (
          <div className={styles.shareHint}>
            Comparte este código con otros operarios para que se unan
          </div>
        )}

        <div className={styles.playerList}>
          <div className={styles.playerListHeader}>Jugadores ({jugadores.length})</div>
          {jugadores.length === 0 && (
            <div className={styles.emptyPlayers}>Esperando jugadores...</div>
          )}
          {jugadores.map((j, i) => (
            <div key={j.userId || i} className={styles.playerRow}>
              <div className={styles.playerInfo}>
                <span className={styles.playerRank}>#{i + 1}</span>
                <span className={styles.playerName}>{j.nombre}</span>
                {j.finalizado && <span className={styles.playerDone}>✅</span>}
              </div>
              <div className={styles.playerScore}>
                {j.finalizado ? `${j.puntuacion}pts` : j.etapa}
              </div>
            </div>
          ))}
        </div>

        {eventos.length > 0 && (
          <div className={styles.eventLog}>
            {eventos.slice(0, 5).map((ev, i) => (
              <div key={i} className={styles.eventItem}>{ev}</div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {!partidaIniciada && isHost && (
            <Button variant="primary" onClick={iniciarPartida} disabled={!allReady}>
              Iniciar simulación →
            </Button>
          )}
          {partidaIniciada && (
            <div className={styles.jugandoHint}>
              ⏳ Simulación en curso...
            </div>
          )}
          <Button variant="secondary" onClick={abandonarSala}>
            {partidaIniciada ? 'Salir' : 'Cancelar'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'crear' ? styles.tabActive : ''}`}
          onClick={() => setTab('crear')}
        >
          🆕 Crear sala
        </button>
        <button
          className={`${styles.tab} ${tab === 'unirse' ? styles.tabActive : ''}`}
          onClick={() => setTab('unirse')}
        >
          🔗 Unirse a sala
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {tab === 'crear' ? (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Crea una sala multijugador</div>
          <p className={styles.formDesc}>
            Compite contra otros operarios en el mismo simulador. Quien complete
            el pedido con mayor puntuación gana.
          </p>
          <Button variant="primary" onClick={crearSala}>
            Crear sala →
          </Button>
        </div>
      ) : (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Únete a una sala</div>
          <p className={styles.formDesc}>Introduce el código de 6 caracteres que te ha compartido el anfitrión.</p>
          <div className={styles.inputRow}>
            <input
              className={styles.codeInput}
              placeholder="Ej: AB3X9Z"
              value={codigoInput}
              onChange={e => setCodigoInput(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleUnirse()}
              maxLength={6}
              autoFocus
            />
            <Button variant="primary" onClick={handleUnirse} disabled={codigoInput.length < 4}>
              Unirse
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
