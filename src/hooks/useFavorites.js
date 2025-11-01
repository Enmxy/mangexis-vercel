import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

/**
 * Custom hook for managing user favorites with Clerk metadata
 * Favorites are stored in user's public metadata for cross-device sync
 */
export const useFavorites = () => {
  const { user, isSignedIn } = useUser()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // Load favorites from Clerk user metadata
  useEffect(() => {
    if (isSignedIn && user) {
      const userFavorites = user.publicMetadata?.favorites || []
      setFavorites(userFavorites)
    } else {
      // Load from localStorage if not signed in
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorites(localFavorites)
    }
  }, [isSignedIn, user])

  // Add manga to favorites
  const addFavorite = async (mangaSlug) => {
    if (!mangaSlug) return

    try {
      setLoading(true)
      const newFavorites = [...favorites, mangaSlug]

      if (isSignedIn && user) {
        // Save to Clerk metadata
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            favorites: newFavorites
          }
        })
      } else {
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
      }

      setFavorites(newFavorites)
    } catch (error) {
      console.error('Error adding favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  // Remove manga from favorites
  const removeFavorite = async (mangaSlug) => {
    if (!mangaSlug) return

    try {
      setLoading(true)
      const newFavorites = favorites.filter(slug => slug !== mangaSlug)

      if (isSignedIn && user) {
        // Save to Clerk metadata
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            favorites: newFavorites
          }
        })
      } else {
        // Save to localStorage
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
      }

      setFavorites(newFavorites)
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle favorite
  const toggleFavorite = async (mangaSlug) => {
    if (isFavorite(mangaSlug)) {
      await removeFavorite(mangaSlug)
    } else {
      await addFavorite(mangaSlug)
    }
  }

  // Check if manga is in favorites
  const isFavorite = (mangaSlug) => {
    return favorites.includes(mangaSlug)
  }

  // Migrate localStorage favorites to Clerk on sign in
  const migrateFavorites = async () => {
    if (!isSignedIn || !user) return

    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (localFavorites.length > 0) {
      const clerkFavorites = user.publicMetadata?.favorites || []
      const merged = [...new Set([...clerkFavorites, ...localFavorites])]

      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          favorites: merged
        }
      })

      // Clear localStorage after migration
      localStorage.removeItem('favorites')
      setFavorites(merged)
    }
  }

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    migrateFavorites,
    isSignedIn
  }
}
