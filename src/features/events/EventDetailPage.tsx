import { Navigate, useParams } from 'react-router-dom'

/** Old full-page event view. Events now open in the shared popup on the Events page. */
export default function EventDetailPage() {
  const { slug = '' } = useParams()
  return <Navigate to={`/events?event=${encodeURIComponent(slug)}`} replace />
}
