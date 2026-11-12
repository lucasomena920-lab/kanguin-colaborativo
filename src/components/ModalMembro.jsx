import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

// Cores que a pessoa pode escolher para o avatar (da paleta Ocean Flow)
const coresMembro = ['#2563EB', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899']

function ModalMembro({ equipe, onSalvar, onFechar }) {
  const { t } = useTranslation()

  // Começa com a primeira cor que ainda ninguém está usando
  const corLivre = coresMembro.find((cor) => !equipe.some((m) => m.cor === cor)) ?? coresMembro[0]

  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(corLivre)

  const nomeLimpo = nome.trim()
  const nomeRepetido = equipe.some((m) => m.nome.toLowerCase() === nomeLimpo.toLowerCase())

  function enviar(e) {
    e.preventDefault()
    if (!nomeLimpo || nomeRepetido) return
    onSalvar({ nome: nomeLimpo, cor })
  }

  return (
    <Modal show onHide={onFechar} centered size="sm">
      <Form onSubmit={enviar}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">{t('membro.titulo')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="fNomeMembro">
            <Form.Label>{t('membro.nome')}</Form.Label>
            <Form.Control
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              isInvalid={nomeRepetido}
              maxLength={30}
              required
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{t('membro.nomeRepetido')}</Form.Control.Feedback>
          </Form.Group>

          <p className="form-label mb-2">{t('membro.cor')}</p>
          <div className="d-flex gap-2" role="radiogroup" aria-label={t('membro.cor')}>
            {coresMembro.map((opcao) => (
              <button
                key={opcao}
                type="button"
                role="radio"
                aria-checked={cor === opcao}
                aria-label={opcao}
                className={`amostra-cor ${cor === opcao ? 'ativa' : ''}`}
                style={{ backgroundColor: opcao }}
                onClick={() => setCor(opcao)}
              />
            ))}
          </div>

          {/* Prévia de como o avatar vai ficar */}
          <div className="d-flex align-items-center gap-2 mt-3">
            <span className="avatar" style={{ backgroundColor: cor }}>
              {nomeLimpo ? nomeLimpo[0].toUpperCase() : '?'}
            </span>
            <span className="text-body-secondary">{nomeLimpo || '...'}</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onFechar}>
            {t('modal.cancelar')}
          </Button>
          <Button type="submit" variant="primary" disabled={!nomeLimpo || nomeRepetido}>
            {t('modal.salvar')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ModalMembro
