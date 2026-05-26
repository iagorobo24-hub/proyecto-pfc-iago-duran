import styles from './RankingMultijugador.module.css'

export default function RankingMultijugador({ jugadores, puntuacionPropia }) {
  const sorted = [...jugadores]
    .filter(j => j.finalizado)
    .sort((a, b) => b.puntuacion - a.puntuacion || a.tiempoTotal - b.tiempoTotal)

  if (sorted.length === 0) return null

  return (
    <div className={styles.container}>
      <div className={styles.title}>🏆 Ranking multijugador</div>
      <div className={styles.list}>
        {sorted.map((j, i) => {
          const isPlayer = j.puntuacion === puntuacionPropia && j.finalizado
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`
          return (
            <div key={j.userId || i} className={`${styles.row} ${isPlayer ? styles.rowSelf : ''}`}>
              <div className={styles.medal}>{medal}</div>
              <div className={styles.info}>
                <span className={styles.name}>{j.nombre}</span>
                {isPlayer && <span className={styles.you}>(tú)</span>}
              </div>
              <div className={styles.stats}>
                <span className={styles.score}>{j.puntuacion}pts</span>
                <span className={styles.time}>{j.tiempoTotal}s</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
