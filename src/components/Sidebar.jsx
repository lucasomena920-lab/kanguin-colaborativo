import Logo from './Logo.jsx'
import ConteudoMenu from './ConteudoMenu.jsx'
import Notificacoes from './Notificacoes.jsx'

// As props das notificações ficam aqui; o resto vai para o ConteudoMenu
function Sidebar({ alertas, onAbrirTarefa, ...props }) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <div className="d-flex align-items-center justify-content-between">
        <Logo />
        <Notificacoes alertas={alertas} onAbrirTarefa={onAbrirTarefa} />
      </div>
      <ConteudoMenu {...props} />
    </aside>
  )
}

export default Sidebar
