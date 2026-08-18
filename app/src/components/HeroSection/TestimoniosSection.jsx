import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import useTestimonios from '../../hooks/useTestimonios'
import styles from './TestimoniosSection.module.css'

export default function TestimoniosSection() {
  const { testimonios, agregar } = useTestimonios()
  const [formData, setFormData] = useState({ nombre: '', email: '', texto: '', rating: 0 })
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.texto.trim() || formData.rating === 0) return

    setEnviando(true)
    await new Promise(r => setTimeout(r, 400))

    await agregar({
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      texto: formData.texto.trim(),
      rating: formData.rating,
    })

    setFormData({ nombre: '', email: '', texto: '', rating: 0 })
    setEnviando(false)
    setExito(true)
    setTimeout(() => setExito(false), 3000)
  }

  const promedio = testimonios.length > 0
    ? Math.round((testimonios.reduce((acc, t) => acc + t.rating, 0) / testimonios.length) * 10) / 10
    : 0

  return (
    <section className={styles.section} id="testimonios">
      <div className={styles.container}>
        <div className={styles.badge}>TESTIMONIOS</div>
        <h2 className={styles.title}>Tu opinión nos importa</h2>
        <p className={styles.subtitle}>
          Déjanos tu valoración y ayúdanos a mejorar
        </p>

        {testimonios.length > 0 && (
          <div className={styles.average}>
            <div className={styles.averageStars}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(promedio) ? styles.starFilled : styles.starEmpty}
                  fill={i < Math.round(promedio) ? '#f59e0b' : 'none'}
                />
              ))}
            </div>
            <span className={styles.averageText}>
              {promedio}/5 ({testimonios.length} {testimonios.length === 1 ? 'valoración' : 'valoraciones'})
            </span>
          </div>
        )}

        <div className={styles.grid}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {exito && (
              <div className={styles.success}>
                ✅ ¡Gracias por tu valoración!
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email (opcional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tu valoración *</label>
              <div className={styles.stars}>
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    aria-label={`${i + 1} estrella${i > 0 ? 's' : ''}`}
                  >
                    <Star
                      size={32}
                      className={i < formData.rating ? styles.starFilled : styles.starEmpty}
                      fill={i < formData.rating ? '#f59e0b' : 'none'}
                    />
                  </button>
                ))}
              </div>
              {formData.rating === 0 && (
                <span className={styles.starHint}>Selecciona de 1 a 5 estrellas</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Comentario *</label>
              <textarea
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                placeholder="¿Qué te ha parecido? ¿Qué mejorarías?"
                rows={4}
                required
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={enviando || formData.rating === 0}
              className={styles.submit}
            >
              {enviando ? 'Enviando...' : 'Enviar valoración'}
            </button>
          </form>

          {testimonios.length > 0 && (
            <div className={styles.list}>
              <h3 className={styles.listTitle}>Últimas valoraciones</h3>
              {testimonios.slice(0, 5).map((t, i) => (
                <motion.div
                  key={t.id || i}
                  className={styles.testimonioCard}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={styles.testimonioHeader}>
                    <span className={styles.testimonioNombre}>{t.nombre}</span>
                    <div className={styles.testimonioStars}>
                      {Array.from({ length: 5 }, (_, starI) => (
                        <Star
                          key={starI}
                          size={14}
                          className={starI < t.rating ? styles.starSmallFilled : styles.starSmallEmpty}
                          fill={starI < t.rating ? '#f59e0b' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.testimonioTexto}>{t.texto}</p>
                  <time className={styles.testimonioFecha}>
                    {t.created_at
                      ? new Date(t.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
