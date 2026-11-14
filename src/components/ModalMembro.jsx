import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { coresMembro } from '../utils/cores.js'
import { papeisQuePossoDar } from '../contexts/permissoes.js'
import { enviarConvite } from '../lib/convites.js'

// Adicionar pessoa à equipe, de dois jeitos:
// - "Convidar por email": a pessoa ganha acesso ao quadro (só dono e admin, com login)
// - "Só o nome": para quem não tem conta (aparece como responsável, mas não acessa o quadro)
function ModalMembro({ equipe, quadro, usuario, participantes = [], onSalvar, onFechar }) {
  const { t } = useTranslation()

  const opcoesPapel = papeisQuePossoDar(quadro?.papel)
  const podeConvidar = Boolean(usuario && quadro) && opcoesPapel.length > 0

  const [modo, setModo] = useState(podeConvidar ? 'convidar' : 'nome')

  // ===== SÓ O NOME =====
  // Começa com a primeira cor que ainda ninguém está usando
  const corLivre = coresMembro.find((cor) => !equipe.some((m) => m.cor === cor)) ?? coresMembro[0]
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(corLivre)

  const nomeLimpo = nome.trim()
  const nomeRepetido = equipe.some((m) => m.nome.toLowerCase() === nomeLimpo.toLowerCase())

  function salvarNome(e) {
    e.preventDefault()
    if (!nomeLimpo || nomeRepetido) return
    onSalvar({ nome: nomeLimpo, cor })
  }

  // ===== CONVIDAR POR EMAIL =====
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState('editor')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [enviadoPara, setEnviadoPara] = useState('') // email do último convite que deu certo

  async function convidar(e) {
    e.preventDefault()
    setErro('')
    const emailLimpo = email.trim().toLowerCase()

    if (emailLimpo === usuario.email?.toLowerCase()) return setErro(t('compartilhar.erros.voceMesmo'))
    if (participantes.some((p) => p.email === emailLimpo)) return setErro(t('compartilhar.erros.jaMembro'))

    setEnviando(true)
    const { erro: chaveErro } = await enviarConvite(quadro.id, emailLimpo, papel)
    setEnviando(false)
    if (chaveErro) return setErro(t(chaveErro))

    setEnviadoPara(emailLimpo)
    setEmail('')
  }

  function trocarModo(novo) {
    setModo(novo)
    setErro('')
    setEnviadoPara('')
  }

  return (
    <Modal show onHide={onFechar} centered size={podeConvidar ? undefined : 'sm'}>
      <Form onSubmit={modo === 'convidar' ? convidar : salvarNome}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">{t('membro.titulo')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Abas: só aparecem para quem pode convidar */}
          {podeConvidar && (
            <div className="nav nav-pills nav-fill mb-3 abas-membro" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'convidar'}
                className={`nav-link ${modo === 'convidar' ? 'active' : ''}`}
                onClick={() => trocarModo('convidar')}
              >
                <i className="bi bi-envelope me-1" />
                {t('membro.porEmail')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modo === 'nome'}
                className={`nav-link ${modo === 'nome' ? 'active' : ''}`}
                onClick={() => trocarModo('nome')}
              >
                <i className="bi bi-person me-1" />
                {t('membro.soNome')}
              </button>
            </div>
          )}

          {modo === 'convidar' ? (
            <>
              <p className="small text-body-secondary">{t('membro.explicaConvite')}</p>

              {enviadoPara && (
                <div className="alert alert-success py-2 small" role="status">
                  <i className="bi bi-check2-circle me-1" />
                  {t('membro.conviteEnviado', { email: enviadoPara })}
                </div>
              )}

              <Form.Group className="mb-3" controlId="fEmailMembro">
                <Form.Label>{t('auth.email')}</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('compartilhar.emailPlaceholder')}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group controlId="fPapelMembro">
                <Form.Label>{t('compartilhar.papel')}</Form.Label>
                <Form.Select value={papel} onChange={(e) => setPapel(e.target.value)}>
                  {opcoesPapel.map((p) => (
                    <option key={p} value={p}>{t(`quadros.papeis.${p}`)}</option>
                  ))}
                </Form.Select>
                <Form.Text>
                  <strong>{t(`quadros.papeis.${papel}`)}:</strong> {t(`compartilhar.descricoes.${papel}`)}
                </Form.Text>
              </Form.Group>

              {erro && <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">{erro}</div>}
            </>
          ) : (
            <>
              {podeConvidar && <p className="small text-body-secondary">{t('membro.explicaNome')}</p>}

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
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onFechar}>
            {enviadoPara ? t('modal.fechar') : t('modal.cancelar')}
          </Button>
          {modo === 'convidar' ? (
            <Button type="submit" variant="primary" disabled={!email.trim() || enviando}>
              {enviando && <span className="spinner-border spinner-border-sm me-2" />}
              {t('compartilhar.enviar')}
            </Button>
          ) : (
            <Button type="submit" variant="primary" disabled={!nomeLimpo || nomeRepetido}>
              {t('modal.salvar')}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ModalMembro
