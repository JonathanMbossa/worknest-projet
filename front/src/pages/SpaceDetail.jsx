import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { spacesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function SpaceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery(
    ['space', id],
    () => spacesAPI.getById(id)
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !data?.space) {
    return (
      <div className="text-center text-red-600">
        Espace non trouvé
      </div>
    )
  }

  const space = data.space

  return (
    <div className="space-y-6">
      <Link to="/spaces" className="text-primary-600 hover:underline">
        ← Retour au catalogue
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {space.images?.length > 0 ? (
            <div className="space-y-4">
              <img
                src={space.images[0]}
                alt={space.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {space.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {space.images.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${space.name} ${idx + 2}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Aucune image disponible</span>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{space.name}</h1>
            <p className="text-gray-600 mb-4">{space.description}</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">📍 Localisation</span>
                <span className="font-medium">{space.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">🏢 Adresse</span>
                <span className="font-medium">{space.address}, {space.postalCode} {space.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">👥 Capacité</span>
                <span className="font-medium">{space.capacity} personnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">💰 Prix</span>
                <span className="font-medium text-primary-600 text-xl">{space.price}€/heure</span>
              </div>
            </div>
          </div>

          {space.equipment?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Équipements</h2>
              <div className="flex flex-wrap gap-2">
                {space.equipment.map((eq, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Planning */}
          {space.reservations?.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Créneaux réservés</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {space.reservations.map((reservation) => (
                  <div key={reservation.id} className="text-sm text-gray-600 border-l-2 border-primary-500 pl-3">
                    {format(new Date(reservation.startDate), "d MMM yyyy 'à' HH:mm", { locale: fr })} - 
                    {format(new Date(reservation.endDate), " HH:mm", { locale: fr })}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (user) {
                navigate(`/spaces/${id}/reserve`)
              } else {
                navigate('/login')
              }
            }}
            className="btn btn-primary w-full text-lg py-3"
          >
            {user ? 'Réserver maintenant' : 'Se connecter pour réserver'}
          </button>
        </div>
      </div>
    </div>
  )
}

