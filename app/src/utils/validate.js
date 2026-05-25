export function shape(schema) {
  return function validate(data, label = 'data') {
    if (!data) return null
    if (Array.isArray(data)) {
      return data.map((item, i) => validate(item, `${label}[${i}]`))
    }
    const result = {}
    for (const [key, rules] of Object.entries(schema)) {
      const raw = data[key]
      if (raw === undefined || raw === null) {
        if (rules.required) {
          console.warn(`⚠️ validate: missing required key "${key}" in ${label}`)
        }
        result[key] = rules.default !== undefined ? rules.default : null
        continue
      }
      let value = raw
      if (rules.type === 'string' && typeof value !== 'string') {
        value = String(value)
      } else if (rules.type === 'number') {
        value = Number(value)
        if (isNaN(value)) value = rules.default ?? 0
      } else if (rules.type === 'boolean') {
        value = Boolean(value)
      }
      if (rules.trim && typeof value === 'string') value = value.trim()
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        value = value.slice(0, rules.maxLength)
      }
      result[key] = value
    }
    return result
  }
}

export const productSchema = {
  id: { type: 'number', required: true },
  ref_fabricante: { type: 'string', required: true, trim: true, maxLength: 100 },
  name: { type: 'string', default: '', trim: true, maxLength: 500 },
  marca: { type: 'string', default: '', trim: true, maxLength: 200 },
  brand_id: { type: 'number' },
  familia: { type: 'string', default: '', trim: true, maxLength: 200 },
  subfamilia: { type: 'string', default: '', trim: true, maxLength: 200 },
  tipo: { type: 'string', default: '', trim: true, maxLength: 200 },
  gama: { type: 'string', default: '', trim: true, maxLength: 200 },
  Gama: { type: 'string', default: '', trim: true, maxLength: 200 },
  subgama: { type: 'string', default: '', trim: true, maxLength: 200 },
  Subgama: { type: 'string', default: '', trim: true, maxLength: 200 },
  descripcion: { type: 'string', default: '', maxLength: 2000 },
  imagen: { type: 'string', default: '', maxLength: 1000 },
  pdf_url: { type: 'string', default: '', maxLength: 1000 },
  precio: { type: 'number', default: 0 },
}

export const brandSchema = {
  id: { type: 'number', required: true },
  name: { type: 'string', required: true, trim: true, maxLength: 200 },
}

export const validateProduct = shape(productSchema)
export const validateBrand = shape(brandSchema)