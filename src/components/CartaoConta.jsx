import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

// Ícone de cada situação da nuvem
const iconesNuvem = {
  carregando: 'bi-cloud-arrow-down',
  salvando: 'bi-arrow-repeat',
  sincronizado: 'bi-cloud-check',
  erro: 'bi-cloud-slash',
}

// Cartão da conta no rodapé do menu: avatar, nome e situação da nuvem.
// Ao clicar, abre um menu com o email completo, "Mudar meu nome" e o botão de sair.
function CartaoConta({ usuario, meuNome, statusNuvem, onMudarNome, onSair }) {
  const { t } = useTranslation()
  const [editando, setEditando] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  // O nome escolhido pela pessoa; enquanto carrega, o começo do email
  const nome = meuNome || usuario.email.split('@')[0]

  function abrirEdicao() {
    setNovoNome(nome)
    setErro(false)
    setEditando(true)
  }

  async function salvarNome(e) {
    e.preventDefault()
    const limpo = novoNome.trim()
    if (!limpo) return
    setSalvando(true)
    const deuCerto = await onMudarNome(limpo)
    setSalvando(false)
    if (deuCerto) setEditando(false)
    else setErro(true)
  }

  return (
    <>
      <Dropdown drop="up" className="w-100">
        <Dropdown.Toggle bsPrefix="cartao-conta" variant="" className="w-100">
          <span className="avatar-conta">
            {nome[0].toUpperCase()}
            <span className={`ponto-status ${statusNuvem}`} />
          </span>

          <span className="flex-grow-1 min-w-0 text-start">
            <span className="d-block fw-semibold text-truncate">{nome}</span>
            <span className={`status-nuvem ${statusNuvem} d-block text-truncate`}>
              <i className={`bi ${iconesNuvem[statusNuvem]} me-1`} />
              {t(`auth.nuvem.${statusNuvem}`)}
            </span>
          </span>

          <i className="bi bi-chevron-expand text-body-secondary" />
        </Dropdown.Toggle>

        <Dropdown.Menu className="menu-conta shadow">
          <div className="px-3 py-2">
            <div className="small text-body-secondary">{t('auth.conectadoComo')}</div>
            <div className="small fw-semibold text-truncate" title={usuario.email}>
              {usuario.email}
            </div>
          </div>
          <Dropdown.Divider />
          <Dropdown.Item as="button" onClick={abrirEdicao}>
            <i className="bi bi-pencil me-2" />
            {t('auth.mudarNome')}
          </Dropdown.Item>
          <Dropdown.Item as="button" onClick={onSair} className="text-danger">
            <i className="bi bi-box-arrow-right me-2" />
            {t('auth.sair')}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {editando && (
        <Modal show onHide={() => setEditando(false)} centered size="sm">
          <Form onSubmit={salvarNome}>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h5">{t('auth.mudarNome')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="fMeuNome">
                <Form.Label>{t('auth.seuNome')}</Form.Label>
                <Form.Control
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  maxLength={40}
                  required
                  autoFocus
                />
                <Form.Text>{t('auth.seuNomeAjuda')}</Form.Text>
              </Form.Group>
              {erro && <div className="alert alert-danger py-2 small mt-3 mb-0">{t('auth.erros.generico')}</div>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setEditando(false)}>
                {t('modal.cancelar')}
              </Button>
              <Button type="submit" variant="primary" disabled={!novoNome.trim() || salvando}>
                {salvando && <span className="spinner-border spinner-border-sm me-2" />}
                {t('modal.salvar')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default CartaoConta
