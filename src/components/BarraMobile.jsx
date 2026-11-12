import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Logo from './Logo.jsx'
import ConteudoMenu from './ConteudoMenu.jsx'

function BarraMobile({ equipe, tema, onAlternarTema }) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)

  function fechar() {
    setAberto(false)
  }

  return (
    <>
      <div className="barra-mobile d-flex d-md-none align-items-center gap-2 px-3 py-2 border-bottom">
        <button
          className="btn btn-link text-body p-1 fs-3"
          onClick={() => setAberto(true)}
          aria-label={t('menu.titulo')}
        >
          <i className="bi bi-list" />
        </button>
        <Logo />
      </div>

      <Offcanvas show={aberto} onHide={fechar} placement="start" className="offcanvas-menu">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title as="div">
            <Logo />
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column gap-4">
          <ConteudoMenu
            equipe={equipe}
            tema={tema}
            onAlternarTema={onAlternarTema}
            onNavegar={fechar}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default BarraMobile