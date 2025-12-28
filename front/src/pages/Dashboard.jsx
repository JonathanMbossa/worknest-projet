import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { reservationsAPI, usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profileData } = useQuery(
    'userProfile',
    () => usersAPI.getProfile()
  )

  const { data: reservationsData, isLoading } = useQuery(
    'reservations',
    () => reservationsAPI.getAll()
  )

  const cancelMutation = useMutation(
    (id) => reservationsAPI.cancel(id),
    {
      onSuccess: () => {
        toast.success('Réservation annulée')
        queryClient.invalidateQueries('reservations')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de l\'annulation')
      },
    }
  )

  const handleCancel = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      cancelMutation.mutate(id)
    }
  }

  const reservations = reservationsData?.reservations || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Profil utilisateur */}
      {profileData?.user && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Mon profil</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium">
                {profileData.user.firstName} {profileData.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{profileData.user.email}</p>
            </div>
            {profileData.user.company && (
              <div>
                <p className="text-sm text-gray-600">Entreprise</p>
                <p className="font-medium">{profileData.user.company}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Rôle</p>
              <p className="font-medium">
                {profileData.user.role === 'CLIENT' ? 'Particulier' : 
                 profileData.user.role === 'ENTERPRISE' ? 'Entreprise' : 'Administrateur'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Réservations */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Mes réservations</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="mb-4">Aucune réservation pour le moment</p>
            <Link to="/spaces" className="btn btn-primary">
              Découvrir les espaces
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {reservation.space.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        📍 {reservation.space.location}, {reservation.space.city}
                      </p>
                      <p>
                        📅 {format(new Date(reservation.startDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })} - 
                        {format(new Date(reservation.endDate), " HH:mm", { locale: fr })}
                      </p>
                      <p>
                        💰 Total: {reservation.totalPrice}€
                      </p>
                      <p>
                        Statut:{' '}
                        <span className={`font-medium ${
                          reservation.status === 'CONFIRMED' ? 'text-green-600' :
                          reservation.status === 'PENDING' ? 'text-yellow-600' :
                          reservation.status === 'CANCELLED' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {reservation.status === 'CONFIRMED' ? 'Confirmée' :
                           reservation.status === 'PENDING' ? 'En attente' :
                           reservation.status === 'CANCELLED' ? 'Annulée' :
                           'Terminée'}
                        </span>
                      </p>
                      {reservation.payment && (
                        <p>
                          💳 Paiement:{' '}
                          <span className={`font-medium ${
                            reservation.payment.status === 'PAID' ? 'text-green-600' :
                            reservation.payment.status === 'PENDING' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {reservation.payment.status === 'PAID' ? 'Payé' :
                             reservation.payment.status === 'PENDING' ? 'En attente' :
                             'Échoué'}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/spaces/${reservation.space.id}`}
                      className="btn btn-secondary text-sm"
                    >
                      Voir l'espace
                    </Link>
                    {reservation.status !== 'CANCELLED' && 
                     reservation.status !== 'COMPLETED' &&
                     new Date(reservation.startDate) > new Date() && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="btn btn-danger text-sm"
                        disabled={cancelMutation.isLoading}
                      >
                        Annuler
                      </button>
                    )}
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

