import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function EditProfile() {
  const { user: currentUser, fetchUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: profileData, isLoading } = useQuery(
    'userProfile',
    () => usersAPI.getProfile()
  )

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: ''
  })

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if (profileData?.user) {
      setFormData({
        email: profileData.user.email || '',
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phone: profileData.user.phone || '',
        company: profileData.user.company || ''
      })
    }
  }, [profileData])

  const updateMutation = useMutation(
    (data) => usersAPI.updateProfile(data),
    {
      onSuccess: async (data) => {
        toast.success('Profil mis à jour avec succès')
        await fetchUser() // Rafraîchir les données utilisateur
        queryClient.invalidateQueries('userProfile')
        navigate('/dashboard')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la mise à jour')
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Modifier mon profil</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input
                type="text"
                className="input"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"
                className="input"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0612345678"
            />
          </div>

          {currentUser?.role === 'ENTERPRISE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Entreprise</label>
              <input
                type="text"
                className="input"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {updateMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

