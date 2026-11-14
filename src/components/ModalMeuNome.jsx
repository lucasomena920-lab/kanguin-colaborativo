import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

// Janela para a pessoa logada escolher como quer ser chamada
function ModalMeuNome({ nomeAtual, onSalvar, onFechar }) {
  const { t } = useTranslation()
  const [nome, setNome] = useState(nomeAtual)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  async function salvar(e) {
    e.preventDefault()
    const limpo = nome.trim()
    if (!limpo) return
    setSalvando(true)
    setErro(false)
    const deuCerto = await onSalvar(limpo)
    setSalvando(false)
    if (deuCerto) onFechar()
    else setErro(true)
  }

  return (
    <Modal show onHide={onFechar} centered size="sm">
      <Form onSubmit={salvar}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">{t('auth.mudarNome')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="fMeuNome">
            <Form.Label>{t('auth.seuNome')}</Form.Label>
            <Form.Control
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t('auth.seuNomePlaceholder')}
              maxLength={40}
              required
              autoFocus
            />
            <Form.Text>{t('auth.seuNomeAjuda')}</Form.Text>
          </Form.Group>
          {erro && <div className="alert alert-danger py-2 small mt-3 mb-0">{t('auth.erros.generico')}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onFechar}>
            {t('modal.cancelar')}
          </Button>
          <Button type="submit" variant="primary" disabled={!nome.trim() || salvando}>
            {salvando && <span className="spinner-border spinner-border-sm me-2" />}
            {t('modal.salvar')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ModalMeuNome
