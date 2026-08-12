export default defineNuxtRouteMiddleware((to) => {
  const { public: pub } = useRuntimeConfig()

  if (to.path.startsWith('/gokz') && !pub.gokzEnabled) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'GOKZ is not configured on this server' }))
  }
  if (to.path.startsWith('/kztimer') && !pub.kztimerEnabled) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'KZTimer is not configured on this server' }))
  }
})
