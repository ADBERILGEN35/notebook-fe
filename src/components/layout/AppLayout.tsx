import { Outlet } from 'react-router-dom'
import Sidebar from '../navigation/Sidebar'
import TopBar from '../navigation/TopBar'
import '../../styles/layout.css'

const AppLayout = () => {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-shell__content">
        <Sidebar />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout

