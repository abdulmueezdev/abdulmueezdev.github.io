import { Hero } from './components/Hero/Hero'
import { SelectedWork } from './components/SelectedWork/SelectedWork'
import { Profile } from './components/Profile/Profile'
import { Contact } from './components/Contact/Contact'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#work">Skip to selected work</a>
      <main>
        <Hero />
        <SelectedWork />
        <Profile />
      </main>
      <Contact />
    </>
  )
}
