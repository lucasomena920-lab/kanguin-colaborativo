import Logo from './Logo.jsx'
import ConteudoMenu from './ConteudoMenu.jsx'

// Recebe todas as props e repassa para o ConteudoMenu
function Sidebar(props) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <Logo />
      <ConteudoMenu {...props} />
    </aside>
  )
}

export default Sidebar
