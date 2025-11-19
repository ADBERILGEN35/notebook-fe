import '../styles/pages.css'

const UsersPage = () => {
  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>Kullanıcılar</h1>
          <p>Roller, izinler ve hesap durumu değişiklikleri bu ekrandan yapılacak.</p>
        </div>
        <div className="cluster">
          <button type="button" className="outline">
            Roller
          </button>
          <button type="button" className="outline">
            İzinler
          </button>
        </div>
      </header>
      <div className="placeholder">
        <p>
          Kullanıcı arama, kilitleme/aktif etme ve rol atama akışları için
          komponentler, backend entegrasyonu tamamlandığında eklenecek.
        </p>
      </div>
    </section>
  )
}

export default UsersPage

