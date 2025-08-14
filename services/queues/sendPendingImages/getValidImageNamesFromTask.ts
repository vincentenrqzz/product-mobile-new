// ---- Minimal types you can reuse (adjust to your real types if you have them)
type ISODateString = string

type ImageLike =
  | string
  | { name?: string; filename?: string; fileName?: string | undefined | null }
  | null
  | undefined

interface TaskFormField {
  key: string
  inputType: string // e.g. "cameraButton" | "signature" | "attachButton" | ...
  value: unknown
}

interface TaskLike {
  taskId?: number
  form?: TaskFormField[]
}

// ---- Refactor
const IMAGE_FIELDS = new Set(['cameraButton', 'signature', 'attachButton'])

const toArray = <T>(v: T | T[] | null | undefined): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v]

const pickNameFromObject = (obj: Record<string, unknown>): string | null => {
  const candidates = ['name', 'filename', 'fileName'] as const
  for (const key of candidates) {
    const val = obj[key]
    if (typeof val === 'string' && val.trim()) return val
  }
  return null
}

/** Keep only the filename (strip any path-like prefix). */
const basename = (name: string): string => {
  // strip query/hash if any (defensive for URLs)
  const clean = name.split(/[?#]/)[0]
  const parts = clean.split('/')
  return (parts.pop() || clean).trim()
}

/** Extract array of raw names (strings) from any supported shape. */
const extractImageNames = (value: unknown): string[] => {
  const items = toArray<ImageLike>(value as ImageLike | ImageLike[])
  const out: string[] = []
  for (const item of items) {
    if (!item) continue

    if (typeof item === 'string') {
      if (item.trim()) out.push(item)
      continue
    }

    if (typeof item === 'object') {
      const picked = pickNameFromObject(item as Record<string, unknown>)
      if (picked) out.push(picked)
      continue
    }
  }

  return out
}

/**
 * Scan a task's form and collect unique, valid image file names (filenames only).
 * Returns a Set to guarantee uniqueness and fast lookup.
 */
export const getValidImageNamesFromTask = (
  task: TaskLike | null | undefined,
): Set<string> => {
  const result = new Set<string>()
  if (!task?.form?.length) return result

  for (const field of task.form) {
    if (!IMAGE_FIELDS.has(field.inputType)) continue
    const names = extractImageNames(field.value)
    for (const n of names) {
      const clean = basename(n)
      if (clean) result.add(clean)
    }
  }

  return result
}
