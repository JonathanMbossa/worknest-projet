import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { spacesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminSpaces() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editingSpace, setEditingSpace] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const { data: spacesData, isLoading } = useQuery(
    'spaces',
    () => spacesAPI.getAll({})
  )

  const createMutation = useMutation(
    (data) => spacesAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Espace créé avec succès')
        queryClient.invalidateQueries('spaces')
        setShowForm(false)
        setEditingSpace(null)
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la création')
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => spacesAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Espace modifié avec succès')
        queryClient.invalidateQueries('spaces')
        setEditingSpace(null)
        setShowForm(false)
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la modification')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => spacesAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Espace désactivé avec succès')
        queryClient.invalidateQueries('spaces')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    }
  )

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    price: '',
    location: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    equipment: [],
    images: []
  })

  const handleEdit = (space) => {
    setEditingSpace(space)
    setFormData({
      name: space.name,
      description: space.description,
      capacity: space.capacity.toString(),
      price: space.price.toString(),
      location: space.location,
      address: space.address,
      city: space.city,
      postalCode: space.postalCode,
      country: space.country || 'France',
      equipment: space.equipment || [],
      images: space.images || []
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      capacity: parseInt(formData.capacity),
      price: parseFloat(formData.price),
      equipment: formData.equipment.filter(e => e.trim() !== ''),
      images: formData.images.filter(i => i.trim() !== '')
    }

    if (editingSpace) {
      updateMutation.mutate({ id: editingSpace.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet espace ?')) {
      deleteMutation.mutate(id)
    }
  }

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, '']
    }))
  }

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }))
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    )
  }

  const spaces = spacesData?.spaces || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des espaces</h1>
        <button
          onClick={() => {
            setEditingSpace(null)
            setFormData({
              name: '',
              description: '',
              capacity: '',
              price: '',
              location: '',
              address: '',
              city: '',
              postalCode: '',
              country: 'France',
              equipment: [],
              images: []
            })
            setShowForm(true)
          }}
          className="btn btn-primary"
        >
          + Créer un espace
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {editingSpace ? 'Modifier l\'espace' : 'Nouvel espace'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacité *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                className="input"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prix par heure (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Localisation *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Paris Centre"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adresse *</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ville *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code postal *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pays</label>
                <input
                  type="text"
                  className="input"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Équipements</label>
              {formData.equipment.map((eq, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={eq}
                    onChange={(e) => {
                      const newEquipment = [...formData.equipment]
                      newEquipment[index] = e.target.value
                      setFormData(prev => ({ ...prev, equipment: newEquipment }))
                    }}
                    placeholder="WiFi, Projecteur, etc."
                  />
                  <button
                    type="button"
                    onClick={() => removeEquipment(index)}
                    className="btn btn-danger"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addEquipment}
                className="btn btn-secondary text-sm"
              >
                + Ajouter un équipement
              </button>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {createMutation.isLoading || updateMutation.isLoading
                  ? 'Enregistrement...'
                  : editingSpace ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSpace(null)
                }}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Liste des espaces</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Aucun espace pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{space.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📍 {space.location}, {space.city}</p>
                      <p>👥 Capacité: {space.capacity} personnes</p>
                      <p>💰 Prix: {space.price}€/heure</p>
                      <p className={`font-medium ${space.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {space.isActive ? '✅ Actif' : '❌ Désactivé'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/spaces/${space.id}`}
                      className="btn btn-secondary text-sm"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => handleEdit(space)}
                      className="btn btn-primary text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(space.id)}
                      className="btn btn-danger text-sm"
                      disabled={deleteMutation.isLoading}
                    >
                      {space.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

