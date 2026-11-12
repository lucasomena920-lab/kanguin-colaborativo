import Logo from './Logo.jsx'
import ConteudoMenu from './ConteudoMenu.jsx'

function Sidebar({ equipe, tema, onAlternarTema }) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <Logo />
      <ConteudoMenu equipe={equipe} tema={tema} onAlternarTema={onAlternarTema} />
    </aside>
  )
}

export default Sidebar