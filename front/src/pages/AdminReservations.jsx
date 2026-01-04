import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { reservationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminReservations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editingReservation, setEditingReservation] = useState(null)

  const { data: reservationsData, isLoading } = useQuery(
    'allReservations',
    () => reservationsAPI.getAll({})
  )

  const updateMutation = useMutation(
    ({ id, data }) => reservationsAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Réservation modifiée avec succès')
        queryClient.invalidateQueries('allReservations')
        setEditingReservation(null)
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la modification')
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => reservationsAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Réservation supprimée avec succès')
        queryClient.invalidateQueries('allReservations')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    }
  )

  const confirmMutation = useMutation(
    (id) => reservationsAPI.confirm(id),
    {
      onSuccess: () => {
        toast.success('Réservation confirmée')
        queryClient.invalidateQueries('allReservations')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la confirmation')
      }
    }
  )

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'PENDING'
  })

  const handleEdit = (reservation) => {
    setEditingReservation(reservation)
    setFormData({
      startDate: reservation.startDate ? new Date(reservation.startDate).toISOString().slice(0, 16) : '',
      endDate: reservation.endDate ? new Date(reservation.endDate).toISOString().slice(0, 16) : '',
      status: reservation.status
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      id: editingReservation.id,
      data: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      }
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      deleteMutation.mutate(id)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    )
  }

  const reservations = reservationsData?.reservations || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des réservations</h1>

      {editingReservation && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Modifier la réservation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de début *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de fin *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Statut *</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="CANCELLED">Annulée</option>
                <option value="COMPLETED">Terminée</option>
              </select>
            </div>

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
                onClick={() => setEditingReservation(null)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Toutes les réservations</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Aucune réservation pour le moment</p>
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
                      {reservation.space?.name || 'Espace supprimé'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {reservation.user && (
                        <p>
                          👤 Utilisateur: {reservation.user.firstName} {reservation.user.lastName} ({reservation.user.email})
                        </p>
                      )}
                      <p>
                        📅 {format(new Date(reservation.startDate), "d MMMM yyyy 'à' HH:mm", { locale: fr })} - 
                        {format(new Date(reservation.endDate), " HH:mm", { locale: fr })}
                      </p>
                      <p>💰 Total: {reservation.totalPrice}€</p>
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
                          💳 Paiement: {reservation.payment.status === 'PAID' ? 'Payé' : 
                                       reservation.payment.status === 'PENDING' ? 'En attente' : 
                                       'Échoué'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {reservation.status === 'PENDING' && (
                      <button
                        onClick={() => confirmMutation.mutate(reservation.id)}
                        className="btn btn-primary text-sm"
                        disabled={confirmMutation.isLoading}
                      >
                        Confirmer
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(reservation)}
                      className="btn btn-secondary text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className="btn btn-danger text-sm"
                      disabled={deleteMutation.isLoading}
                    >
                      Supprimer
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

