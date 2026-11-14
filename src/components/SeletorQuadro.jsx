import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { nomeDoQuadro } from '../utils/formatar.js'

// Escolher qual quadro está aberto, e criar quadros novos
function SeletorQuadro({ quadros, quadroAtual, onTrocar, onCriar, onNavegar }) {
  const { t } = useTranslation()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  if (!quadroAtual) return null

  function abrirCriacao() {
    setNome('')
    setErro(false)
    setCriando(true)
  }

  async function criar(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    const deuCerto = await onCriar(nome.trim())
    setSalvando(false)
    if (!deuCerto) {
      setErro(true)
      return
    }
    setCriando(false)
    onNavegar?.()
  }

  return (
    <>
      <div>
        <p className="menu-titulo">{t('quadros.titulo')}</p>
        <Dropdown>
          <Dropdown.Toggle bsPrefix="seletor-quadro" variant="" className="w-100">
            <i className="bi bi-kanban text-primary" />
            <span className="flex-grow-1 text-start text-truncate fw-semibold">
              {nomeDoQuadro(quadroAtual, t)}
            </span>
            <i className="bi bi-chevron-down small text-body-secondary" />
          </Dropdown.Toggle>

          <Dropdown.Menu className="menu-quadros shadow">
            {quadros.map((quadro) => (
              <Dropdown.Item
                key={quadro.id}
                as="button"
                active={quadro.id === quadroAtual.id}
                onClick={() => {
                  onTrocar(quadro.id)
                  onNavegar?.()
                }}
                className="d-flex align-items-center gap-2"
              >
                <span className="flex-grow-1 text-truncate">{nomeDoQuadro(quadro, t)}</span>
                <span className={`badge-papel ${quadro.papel}`}>{t(`quadros.papeis.${quadro.papel}`)}</span>
              </Dropdown.Item>
            ))}
            <Dropdown.Divider />
            <Dropdown.Item as="button" onClick={abrirCriacao}>
              <i className="bi bi-plus-lg me-2" />
              {t('quadros.novo')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {criando && (
        <Modal show onHide={() => setCriando(false)} centered size="sm">
          <Form onSubmit={criar}>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h5">{t('quadros.novo')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="fNomeQuadro">
                <Form.Label>{t('quadros.nome')}</Form.Label>
                <Form.Control
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={t('quadros.nomePlaceholder')}
                  maxLength={60}
                  required
                  autoFocus
                />
              </Form.Group>
              {erro && <div className="alert alert-danger py-2 small mt-3 mb-0">{t('auth.erros.generico')}</div>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setCriando(false)}>
                {t('modal.cancelar')}
              </Button>
              <Button type="submit" variant="primary" disabled={!nome.trim() || salvando}>
                {salvando && <span className="spinner-border spinner-border-sm me-2" />}
                {t('quadros.criar')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default SeletorQuadro
