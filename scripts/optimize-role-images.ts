/**
 * Downloads all role images from GitHub CDN, converts to WebP,
 * and saves optimized versions to public/roles/.
 *
 * Original PNGs are ~77KB each. Optimized WebP at 80px = ~2-4KB each.
 * Total: ~12MB -> ~500KB
 *
 * Usage: npx tsx scripts/optimize-role-images.ts
 */

import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const SOURCE_URL
  // eslint-disable-next-line vue/max-len
  = 'https://raw.githubusercontent.com/chizmw/json-on-the-clocktower/main/data/generated/roles-combined.json'

const OUTPUT_DIR = resolve(import.meta.dirname, '../public/roles')

const META_IDS = new Set(['_dawn', '_dusk', '_demon', '_minion'])

const IMAGE_SIZE = 160 // px — enough for 40px display at 4x / 80px at 2x retina

interface SourceRole {
  id: string
  team: string
  edition: string
  remote_image?: string
}

async function main() {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Fetch roles JSON
  const res = await fetch(SOURCE_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
  }

  const data = await res.json() as {
    character_by_id: Record<string, SourceRole>
  }

  const roles = Object.values(data.character_by_id)
    .filter(c =>
      !META_IDS.has(c.id)
      && c.team !== '_meta'
      && c.edition !== '_meta'
      && c.remote_image,
    )

  // eslint-disable-next-line no-console
  console.log(`Found ${roles.length} roles with images`)

  let downloaded = 0
  let skipped = 0
  let failed = 0

  // Process in batches of 10 to avoid hammering the server
  const BATCH_SIZE = 10
  for (let i = 0; i < roles.length; i += BATCH_SIZE) {
    const batch = roles.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (role) => {
      const outputPath = resolve(OUTPUT_DIR, `${role.id}.webp`)

      // Skip if already exists
      if (existsSync(outputPath)) {
        skipped++
        return
      }

      try {
        const imgRes = await fetch(role.remote_image!)
        if (!imgRes.ok) {
          // eslint-disable-next-line no-console
          console.warn(`  SKIP ${role.id}: HTTP ${imgRes.status}`)
          failed++
          return
        }

        const buffer = Buffer.from(await imgRes.arrayBuffer())

        await sharp(buffer)
          .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(outputPath)

        downloaded++
      }
      catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`  FAIL ${role.id}:`, (err as Error).message)
        failed++
      }
    }))

    // eslint-disable-next-line no-console
    console.log(`  Processed ${Math.min(i + BATCH_SIZE, roles.length)}/${roles.length}`)
  }

  // eslint-disable-next-line no-console
  console.log(`\nDone! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Image optimization failed:', err)
  process.exit(1)
})
