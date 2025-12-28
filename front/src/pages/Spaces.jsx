import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { spacesAPI } from '../services/api'

export default function Spaces() {
  const [filters, setFilters] = useState({
    capacity: '',
    minPrice: '',
    maxPrice: '',
    equipment: '',
    city: '',
    page: 1,
  })

  const { data, isLoading, error } = useQuery(
    ['spaces', filters],
    () => spacesAPI.getAll(filters),
    { keepPreviousData: true }
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Erreur lors du chargement des espaces
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Catalogue des espaces</h1>

      {/* Filtres */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Filtres de recherche</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Capacité min.</label>
            <input
              type="number"
              className="input"
              placeholder="Ex: 5"
              value={filters.capacity}
              onChange={(e) => handleFilterChange('capacity', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Prix min. (€)</label>
            <input
              type="number"
              className="input"
              placeholder="Ex: 20"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Prix max. (€)</label>
            <input
              type="number"
              className="input"
              placeholder="Ex: 100"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Équipement</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: WiFi"
              value={filters.equipment}
              onChange={(e) => handleFilterChange('equipment', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ville</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Paris"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Liste des espaces */}
      {data?.spaces?.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          Aucun espace trouvé avec ces critères
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.spaces?.map((space) => (
              <div key={space.id} className="card hover:shadow-lg transition-shadow">
                {space.images?.[0] && (
                  <img
                    src={space.images[0]}
                    alt={space.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{space.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{space.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">
                    📍 {space.city} • 👥 {space.capacity} personnes
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {space.price}€/h
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {space.equipment?.slice(0, 3).map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/spaces/${space.id}`}
                  className="btn btn-primary w-full text-center"
                >
                  Voir les détails
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-gray-600">
                Page {data.pagination.page} sur {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page >= data.pagination.totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

