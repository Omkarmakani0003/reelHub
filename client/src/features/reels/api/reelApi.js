import api from '../../../api/axios.js'

export const getReels = async (params = {}) => {
  const response = await api.get('/reels', { params })
  return response.data?.data ?? response.data ?? { reels: [], pagination: null }
}

export const getReelById = async (reelId) => {
  const response = await api.get(`/v1/reels/${reelId}`)
  return response.data?.data ?? response.data ?? {}
}
