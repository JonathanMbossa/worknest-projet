import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Réservez votre espace de coworking
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Découvrez 25 espaces de coworking en France. Salles de réunion, bureaux individuels 
          et zones créatives pour tous vos besoins professionnels.
        </p>
        <Link to="/spaces" className="btn btn-primary text-lg px-8 py-3">
          Découvrir les espaces
        </Link>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">Recherche avancée</h3>
          <p className="text-gray-600">
            Filtrez par capacité, équipement, prix et localisation pour trouver l'espace parfait.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">Réservation simple</h3>
          <p className="text-gray-600">
            Réservez en quelques clics et recevez une confirmation immédiate.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">Paiement sécurisé</h3>
          <p className="text-gray-600">
            Paiement en ligne sécurisé avec plusieurs méthodes de paiement disponibles.
          </p>
        </div>
      </section>
    </div>
  )
}

