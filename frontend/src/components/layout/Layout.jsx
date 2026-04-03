// import { Outlet } from 'react-router-dom'
// import Sidebar from './Sidebar'

// export default function Layout() {
//   return (
//     <div className="flex h-screen bg-surface-50">
//       <Sidebar />
//       <main className="flex-1 overflow-y-auto">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   )
// }

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}