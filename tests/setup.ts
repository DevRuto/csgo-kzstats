import { vi } from 'vitest'
import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { computed, ref, watch } from 'vue'
import {
  GOKZ_MODES,
  GOKZ_JUMP_TYPES,
  KZTIMER_JUMP_TYPES,
  gokzModeName,
  gokzJumpTypeName,
  kztimerJumpTypeName,
  steam2ToSteamId32,
  steamId32ToSteam2
} from '../shared/utils/kz'

// server/api/**, server/utils/**, and app/components/** all rely on Nuxt/Nitro's
// auto-imports (h3 helpers, Vue reactivity APIs, shared/utils/kz.ts, and the db/mapImages
// utils) instead of explicit imports, so tests import the modules directly and this file
// recreates that global surface. Nuxt-specific composables (useRoute, useFetch, ...) are
// not universal enough to stub here; component tests that need them stub per-file instead.
export const gokzDb = vi.fn()
export const kztimerDb = vi.fn()
export const getMapImage = vi.fn()
export const getMapImages = vi.fn()

Object.assign(globalThis, {
  defineEventHandler,
  getRouterParam,
  getQuery,
  createError,
  GOKZ_MODES,
  GOKZ_JUMP_TYPES,
  KZTIMER_JUMP_TYPES,
  gokzModeName,
  gokzJumpTypeName,
  kztimerJumpTypeName,
  steam2ToSteamId32,
  steamId32ToSteam2,
  ref,
  computed,
  watch,
  // Identity wrapper in real Nuxt too (used only for typing/HMR), safe to stub globally.
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  gokzDb,
  kztimerDb,
  getMapImage,
  getMapImages
})
