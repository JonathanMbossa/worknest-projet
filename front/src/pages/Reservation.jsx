import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { spacesAPI, reservationsAPI, paymentsAPI } from '../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Reservation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notes: '',
  })

  const { data: spaceData } = useQuery(
    ['space', id],
    () => spacesAPI.getById(id)
  )

  const reservationMutation = useMutation(
    (data) => reservationsAPI.create(data),
    {
      onSuccess: async (data) => {
        toast.success('Réservation créée avec succès')
        // Créer automatiquement le paiement
        try {
          await paymentMutation.mutateAsync({
            reservationId: data.reservation.id,
            method: 'CARD',
          })
        } catch (error) {
          console.error('Erreur lors du paiement:', error)
        }
        queryClient.invalidateQueries(['reservations'])
        navigate('/dashboard')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la création de la réservation')
      },
    }
  )

  const paymentMutation = useMutation(
    (data) => paymentsAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Paiement effectué avec succès')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors du paiement')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const startDate = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDate = new Date(`${formData.endDate}T${formData.endTime}`)

    if (startDate >= endDate) {
      toast.error('La date de fin doit être après la date de début')
      return
    }

    if (startDate < new Date()) {
      toast.error('La date de début ne peut pas être dans le passé')
      return
    }

    reservationMutation.mutate({
      spaceId: id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes: formData.notes,
    })
  }

  const space = spaceData?.space
  if (!space) {
    return <div>Chargement...</div>
  }

  const calculateTotal = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      return 0
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`)
    const end = new Date(`${formData.endDate}T${formData.endTime}`)
    const hours = (end - start) / (1000 * 60 * 60)
    return hours > 0 ? (hours * space.price).toFixed(2) : 0
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Réserver : {space.name}</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date de début *
            </label>
            <input
              type="date"
              className="input"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Heure de début *
            </label>
            <input
              type="time"
              className="input"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date de fin *
            </label>
            <input
              type="date"
              className="input"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Heure de fin *
            </label>
            <input
              type="time"
              className="input"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notes (optionnel)
          </label>
          <textarea
            className="input"
            rows="4"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informations complémentaires..."
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary-600">
              {calculateTotal()}€
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Prix: {space.price}€/heure × {calculateTotal() > 0 ? ((calculateTotal() / space.price).toFixed(1)) : 0} heures
          </p>
        </div>

        <button
          type="submit"
          disabled={reservationMutation.isLoading || paymentMutation.isLoading}
          className="btn btn-primary w-full text-lg py-3 disabled:opacity-50"
        >
          {reservationMutation.isLoading || paymentMutation.isLoading
            ? 'Traitement...'
            : 'Confirmer la réservation et payer'}
        </button>
      </form>
    </div>
  )
}

