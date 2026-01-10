export const useAuthStore = () => ({
  accessToken: null,
  validateToken: () => Promise.resolve(false)
});