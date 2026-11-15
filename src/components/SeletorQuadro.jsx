import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { nomeDoQuadro } from '../utils/formatar.js'

// Escolher qual quadro está aberto, e criar quadros novos
function SeletorQuadro({ quadros, quadroAtual, onTrocar, onCriar, onExcluir, onNavegar }) {
  const { t } = useTranslation()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  // Excluir: para confirmar, a pessoa digita o nome do quadro
  const [excluindo, setExcluindo] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [apagando, setApagando] = useState(false)
  const [erroExcluir, setErroExcluir] = useState(false)

  if (!quadroAtual) return null

  function abrirCriacao() {
    setNome('')
    setErro(false)
    setCriando(true)
  }

  const nomeAtual = quadroAtual ? nomeDoQuadro(quadroAtual, t) : ''
  const confirmou = confirmacao.trim().toLowerCase() === nomeAtual.toLowerCase()

  function abrirExclusao() {
    setConfirmacao('')
    setErroExcluir(false)
    setExcluindo(true)
  }

  async function excluir(e) {
    e.preventDefault()
    if (!confirmou) return
    setApagando(true)
    const deuCerto = await onExcluir(quadroAtual)
    setApagando(false)
    if (!deuCerto) {
      setErroExcluir(true)
      return
    }
    setExcluindo(false)
    onNavegar?.()
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
            {/* Só o dono pode excluir o quadro aberto */}
            {quadroAtual.papel === 'dono' && (
              <Dropdown.Item as="button" onClick={abrirExclusao} className="text-danger">
                <i className="bi bi-trash3 me-2" />
                {t('quadros.excluir')}
              </Dropdown.Item>
            )}
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

      {excluindo && (
        <Modal show onHide={() => setExcluindo(false)} centered>
          <Form onSubmit={excluir}>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h5 text-danger">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {t('quadros.excluirTitulo', { nome: nomeAtual })}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-3">{t('quadros.excluirAviso')}</p>
              <Form.Group controlId="fConfirmarExclusao">
                <Form.Label className="small">
                  {t('quadros.excluirDigite')} <strong>{nomeAtual}</strong>
                </Form.Label>
                <Form.Control
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </Form.Group>
              {erroExcluir && <div className="alert alert-danger py-2 small mt-3 mb-0">{t('auth.erros.generico')}</div>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setExcluindo(false)}>
                {t('modal.cancelar')}
              </Button>
              <Button type="submit" variant="danger" disabled={!confirmou || apagando}>
                {apagando && <span className="spinner-border spinner-border-sm me-2" />}
                {t('quadros.excluirConfirmar')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default SeletorQuadro
