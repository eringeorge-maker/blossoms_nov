import { DisplayText, ComicPanel } from '@/components/comic/ComicPrimitives'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <DisplayText as="h1" className="text-5xl mb-4">About Blossoms</DisplayText>
      <p className="text-lg text-ink/70 mb-10 max-w-2xl">
        Blossoms is the annual cultural festival of CHRIST (Deemed to be University), Central Campus.
        It celebrates student creativity, artistic expression, and the vibrant culture of the CHRIST community.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <ComicPanel>
          <h2 className="font-display text-3xl mb-3">🎭 What is Blossoms?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Blossoms is a multi-day student festival featuring events across Arts, Literature, Stage, Theatre,
            and Special categories. From solo performances to team competitions, every student has a chance to
            participate, showcase their talent, and be part of something memorable.
          </p>
        </ComicPanel>

        <ComicPanel>
          <h2 className="font-display text-3xl mb-3">🌟 Who Can Participate?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            All current CHRIST University Central Campus students are eligible to participate. Events are open
            across departments by default — your department does not restrict you from registering for any event.
            Some events have specific team-size requirements.
          </p>
        </ComicPanel>
      </div>

      <div className="comic-panel p-8 mb-12 text-center">
        <DisplayText as="h2" className="text-4xl mb-3 text-blossoms-red">
          Organised by DOC
        </DisplayText>
        <p className="text-ink/70 max-w-xl mx-auto">
          The Department of Cultures (DOC), CHRIST University, organises Blossoms every year.
          For queries, reach out to the official DOC contact.
        </p>
      </div>

      <div className="text-center">
        <Button size="lg" asChild>
          <Link to="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  )
}
