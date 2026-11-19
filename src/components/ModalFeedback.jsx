import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { supabase } from '../lib/supabase.js'

const tipos = [
  { id: 'sugestao', icone: 'bi-lightbulb' },
  { id: 'problema', icone: 'bi-bug' },
  { id: 'elogio', icone: 'bi-heart' },
  { id: 'outro', icone: 'bi-chat-dots' },
]

const LIMITE = 2000

// Formulário de suporte e feedback. A mensagem vai para a tabela "feedback"
// do Supabase, que só o dono do projeto consegue ler.
function ModalFeedback({ usuario, onFechar }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  const [tipo, setTipo] = useState('sugestao')
  const [mensagem, setMensagem] = useState('')
  const [email, setEmail] = useState(usuario?.email ?? '')
  // "Pote de mel": campo escondido que pessoas não veem, mas robôs de spam preenchem
  const [armadilha, setArmadilha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    if (!mensagem.trim()) return

    // Robô preencheu o campo escondido: finge que deu certo e não manda nada
    if (armadilha) {
      setEnviado(true)
      return
    }

    setEnviando(true)
    setErro(false)
    // Sem .select() no fim: a tabela não deixa ninguém ler, nem quem acabou de mandar
    const { error } = await supabase.from('feedback').insert({
      tipo,
      mensagem: mensagem.trim(),
      email: email.trim() || null,
      pagina: pathname,
      idioma: i18n.resolvedLanguage,
    })
    setEnviando(false)

    if (error) {
      console.error('Erro ao enviar feedback:', error)
      setErro(true)
      return
    }
    setEnviado(true)
  }

  return (
    <Modal show onHide={onFechar} centered>
      {enviado ? (
        <>
          <Modal.Body className="text-center py-5">
            <i className="bi bi-check2-circle text-success display-5 d-block mb-3" />
            <h2 className="h5">{t('feedback.obrigado')}</h2>
            <p className="text-body-secondary mb-0">
              {email.trim() ? t('feedback.vamosResponder') : t('feedback.recebido')}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={onFechar}>
              {t('modal.fechar')}
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form onSubmit={enviar}>
          <Modal.Header closeButton>
            <Modal.Title as="h2" className="h5">{t('feedback.titulo')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="small text-body-secondary">{t('feedback.descricao')}</p>

            <p className="form-label mb-2">{t('feedback.sobre')}</p>
            <div className="d-flex flex-wrap gap-2 mb-3" role="radiogroup" aria-label={t('feedback.sobre')}>
              {tipos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={tipo === item.id}
                  className={`btn btn-sm ${tipo === item.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setTipo(item.id)}
                >
                  <i className={`bi ${item.icone} me-1`} />
                  {t(`feedback.tipos.${item.id}`)}
                </button>
              ))}
            </div>

            <Form.Group className="mb-3" controlId="fMensagem">
              <Form.Label>{t('feedback.mensagem')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder={t(`feedback.placeholders.${tipo}`)}
                maxLength={LIMITE}
                required
                autoFocus
              />
              <Form.Text className="d-block text-end">
                {mensagem.length}/{LIMITE}
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="fEmailFeedback">
              <Form.Label>{t('feedback.email')}</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('compartilhar.emailPlaceholder')}
                maxLength={200}
              />
              <Form.Text>{t('feedback.emailAjuda')}</Form.Text>
            </Form.Group>

            {/* Campo armadilha para robôs: fica fora da tela e longe do teclado */}
            <input
              type="text"
              name="site"
              value={armadilha}
              onChange={(e) => setArmadilha(e.target.value)}
              className="campo-armadilha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {erro && <div className="alert alert-danger py-2 small mt-3 mb-0">{t('auth.erros.generico')}</div>}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={onFechar}>
              {t('modal.cancelar')}
            </Button>
            <Button type="submit" variant="primary" disabled={!mensagem.trim() || enviando}>
              {enviando && <span className="spinner-border spinner-border-sm me-2" />}
              <i className="bi bi-send me-1" />
              {t('feedback.enviar')}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  )
}

export default ModalFeedback
