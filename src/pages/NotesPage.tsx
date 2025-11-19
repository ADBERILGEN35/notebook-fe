import '../styles/pages.css'
import NotesPreviewTable from '../sections/NotesPreviewTable'

const NotesPage = () => {
  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>Notlar</h1>
          <p>Kullanıcı bazlı not listelerini backend API&apos;larıyla eşleştireceğiz.</p>
        </div>
        <button type="button">+ Yeni Not</button>
      </header>
      <NotesPreviewTable />
    </section>
  )
}

export default NotesPage

