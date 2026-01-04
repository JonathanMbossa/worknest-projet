import { useQuery, useMutation, useQueryClient } from 'react-query'
import { usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery(
    'allUsers',
    () => usersAPI.getAll(),
    {
      enabled: currentUser?.role === 'ADMIN'
    }
  )

  const deleteMutation = useMutation(
    (id) => usersAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Utilisateur désactivé avec succès')
        queryClient.invalidateQueries('allUsers')
      },
      onError: (error) => {
        toast.error(error.error || 'Erreur lors de la désactivation')
      }
    }
  )

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas désactiver votre propre compte')
      return
    }

    if (window.confirm(
      `Êtes-vous sûr de vouloir désactiver l'utilisateur ${user.firstName} ${user.lastName} (${user.email}) ?\n\n` +
      `Cette action désactivera l'accès de l'utilisateur à la plateforme.`
    )) {
      deleteMutation.mutate(user.id)
    }
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    )
  }

  const users = usersData?.users || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Aucun utilisateur pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nom complet</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Téléphone</th>
                  <th className="text-left p-3">Entreprise</th>
                  <th className="text-left p-3">Rôle</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Réservations</th>
                  <th className="text-left p-3">Inscription</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone || '-'}</td>
                    <td className="p-3">{user.company || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'ENTERPRISE' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'ADMIN' ? 'Admin' :
                         user.role === 'ENTERPRISE' ? 'Entreprise' : 'Client'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.reservations?.length || 0} réservation(s)
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="p-3">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="btn btn-danger text-sm"
                          disabled={deleteMutation.isLoading || !user.isActive}
                        >
                          {user.isActive ? 'Désactiver' : 'Désactivé'}
                        </button>
                      )}
                      {user.id === currentUser?.id && (
                        <span className="text-sm text-gray-500">Vous</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

