import Navbar from '../components/layout/Navbar'
import EditorLayout from '../components/layout/EditorLayout'

export default function EditorPage() {
  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Navbar />
      <EditorLayout />
    </div>
  )
}
