import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider'
import { Preloader } from './components/ui/Preloader'
import { CustomCursor } from './components/ui/CustomCursor'
import { Hero } from './components/Hero/Hero'
import { SelectedWork } from './components/SelectedWork/SelectedWork'
import { SkillsAssets } from './components/SkillsAssets/SkillsAssets'
import { Profile } from './components/Profile/Profile'
import { Contact } from './components/Contact/Contact'

export default function App() {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <CustomCursor />
      <a className="skip-link" href="#work">Skip to selected work</a>
      <main>
        <Hero />
        <SelectedWork />
        <SkillsAssets />
        <Profile />
      </main>
      <Contact />
    </SmoothScrollProvider>
  )
}
