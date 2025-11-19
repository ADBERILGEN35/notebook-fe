import { useQuery } from '@tanstack/react-query'
import { notesQueries } from '../services/noteService'
import '../styles/table.css'

const NotesPreviewTable = () => {
  const { data, isFetching, isError } = useQuery(notesQueries.list())

  const rows = data?.content ?? []

  return (
    <div className="table-card">
      <div className="table-card__header">
        <div>
          <h2>Son Güncellenen Notlar</h2>
          <p>ElasticSearch destekli arama sonuçları burada listelenecek.</p>
        </div>
        <button type="button" className="outline">
          Filtrele
        </button>
      </div>
      <div className="table-card__body">
        <table>
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Notebook</th>
              <th>Etiketler</th>
              <th>Güncelleme</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && (
              <tr>
                <td colSpan={4} className="table__empty">
                  Veri çekiliyor...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={4} className="table__empty">
                  API erişimi yapılandırılana kadar örnek veri gösterilmeyecek.
                </td>
              </tr>
            )}

            {!isFetching &&
              !isError &&
              rows.map((note) => (
                <tr key={note.id}>
                  <td>{note.title}</td>
                  <td>{note.notebookName ?? '—'}</td>
                  <td>
                    {note.tags.length
                      ? note.tags.map((tag) => tag.name).join(', ')
                      : '—'}
                  </td>
                  <td>
                    {note.updatedAt
                      ? new Date(note.updatedAt).toLocaleString('tr-TR', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })
                      : '—'}
                  </td>
                </tr>
              ))}

            {!isFetching && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="table__empty">
                  Backend API bağlantısı kurulduğunda veriler otomatik gelecek.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default NotesPreviewTable

