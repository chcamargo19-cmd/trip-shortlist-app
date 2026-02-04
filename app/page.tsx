'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/utils/supabase/client'

export default function Home() {
  const supabase = createBrowserClient()
  const [session, setSession] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [accommodations, setAccommodations] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchTrips()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select(`
        *, 
        trip_members!inner(user_id)
      `)
    setTrips(data || [])
  }

  const fetchAccommodations = async (tripId: string) => {
    const { data } = await supabase
      .from('accommodations')
      .select(`
        *, 
        pricing(*),
        scores(*)
      `)
      .eq('trip_id', tripId)
    setAccommodations(data || [])
  }

  const selectTrip = (trip: any) => {
    setSelectedTrip(trip)
    fetchAccommodations(trip.id)
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Welcome to Trip Shortlist</h2>
        <p className="text-lg text-gray-600 mb-8">Sign in to start shortlisting accommodations</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your trips</h2>
      
      <div className="grid gap-4 mb-8">
        {trips.map((trip) => (
          <div key={trip.id} className="p-4 border rounded-lg cursor-pointer hover:bg-white" onClick={() => selectTrip(trip)}>
            <h3 className="font-semibold">{trip.name}</h3>
            <p className="text-sm text-gray-600">{trip.destination}</p>
          </div>
        ))}
      </div>

      {selectedTrip && (
        <>
          <h3 className="text-xl font-bold mb-4">{selectedTrip.name}</h3>
          
          {/* Add accommodation form */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h4 className="text-lg font-semibold mb-4">Add accommodation</h4>
            <form className="space-y-4">
              <input 
                type="url" 
                placeholder="Paste Booking/Airbnb/hotel URL" 
                className="w-full p-3 border rounded-lg"
              />
              <button 
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Let AI fill details
              </button>
            </form>
          </div>

          {/* Accommodations list */}
          <div className="grid gap-4">
            {accommodations.map((acc) => (
              <div key={acc.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md">
                <div className="flex gap-4">
                  <img src={acc.image_url} alt={acc.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{acc.name}</h4>
                    <p className="text-sm text-gray-600">{acc.vibe}</p>
                    <p className="font-bold mt-2">{acc.pricing?.price_per_night} {acc.pricing?.currency}/night</p>
                    <div className="flex gap-2 mt-2">
                      {acc.tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
