import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'
import ModalFeedback from '../components/ModalFeedback.jsx'

// Regras de uma senha forte (as mesmas configuradas no Supabase)
const regrasSenha = [
  { id: 'tamanho', ok: (senha) => senha.length >= 8 },
  { id: 'minuscula', ok: (senha) => /[a-z]/.test(senha) },
  { id: 'maiuscula', ok: (senha) => /[A-Z]/.test(senha) },
  { id: 'numero', ok: (senha) => /[0-9]/.test(senha) },
  { id: 'simbolo', ok: (senha) => /[^A-Za-z0-9]/.test(senha) },
]

// Erros do Supabase que têm mensagem própria nos arquivos de tradução
const errosConhecidos = [
  'invalid_credentials',
  'email_not_confirmed',
  'user_already_exists',
  'weak_password',
  'over_email_send_rate_limit',
  'signup_disabled',
  'email_address_invalid',
]

function Entrar({ onSemConta }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [modo, setModo] = useState('entrar') // 'entrar' ou 'criar'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  // Email ou senha errados: deixa os dois campos vermelhos até a pessoa mexer neles
  const [credenciaisErradas, setCredenciaisErradas] = useState(false)
  const campoSenha = useRef(null)
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [mandandoFeedback, setMandandoFeedback] = useState(false)

  // Ao criar conta: a senha digitada cumpre todas as regras?
  const senhaForte = regrasSenha.every((regra) => regra.ok(senha))

  // Sem as chaves do Supabase, o login não existe (o app continua funcionando sem conta)
  if (!supabase) {
    return (
      <main className="p-3 p-md-4">
        <p className="vazio py-5">{t('auth.indisponivel')}</p>
      </main>
    )
  }

  function trocarModo(novoModo) {
    setModo(novoModo)
    setErro('')
    setAviso('')
    setConfirmarSenha('')
    setCredenciaisErradas(false)
  }

  function mensagemDeErro(error) {
    if (errosConhecidos.includes(error.code)) return t(`auth.erros.${error.code}`)
    // Versões antigas do Supabase mandam só a mensagem, sem o código
    if (error.message === 'Invalid login credentials') return t('auth.erros.invalid_credentials')
    // Erro desconhecido: mostra o código, para ajudar a descobrir o que aconteceu
    console.error('Erro do Supabase:', error)
    const codigo = error.code || error.status
    return codigo ? `${t('auth.erros.generico')} (${codigo})` : t('auth.erros.generico')
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setCarregando(true)

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      setCarregando(false)

      if (error) {
        setErro(mensagemDeErro(error))
        if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
          // Por segurança, o Supabase não diz QUAL dos dois está errado
          // (senão alguém poderia descobrir quais emails têm conta)
          setCredenciaisErradas(true)
          setSenha('')
          campoSenha.current?.focus()
        }
        return
      }
      navigate('/')
      return
    }

    // modo === 'criar': as duas senhas precisam ser iguais
    if (!senhaForte) {
      setCarregando(false)
      setErro(t('auth.erros.weak_password'))
      return
    }
    if (senha !== confirmarSenha) {
      setCarregando(false)
      setErro(t('auth.senhasDiferentes'))
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        // O nome vai junto; o banco usa ele para criar o perfil da pessoa
        data: { nome: nome.trim() },
      },
    })
    setCarregando(false)

    if (error) {
      setErro(mensagemDeErro(error))
      return
    }

    // Email já cadastrado: por segurança, o Supabase não dá erro, mas devolve a conta sem "identidades"
    if (data.user && data.user.identities?.length === 0) {
      setErro(t('auth.erros.user_already_exists'))
      return
    }

    if (data.session) {
      navigate('/') // confirmação de email desligada: já entra direto
    } else {
      setAviso(t('auth.confirmeEmail', { email }))
    }
  }

  return (
    <main className="min-vh-100 p-3 d-flex align-items-center justify-content-center">
      <div className="painel p-4 w-100" style={{ maxWidth: 420 }}>
        <div className="d-flex justify-content-center mb-4">
          <Logo />
        </div>

        <div className="nav nav-pills nav-fill mb-4" role="tablist">
          <button
            type="button"
            className={`nav-link ${modo === 'entrar' ? 'active' : ''}`}
            onClick={() => trocarModo('entrar')}
          >
            {t('auth.entrar')}
          </button>
          <button
            type="button"
            className={`nav-link ${modo === 'criar' ? 'active' : ''}`}
            onClick={() => trocarModo('criar')}
          >
            {t('auth.criarConta')}
          </button>
        </div>

        {aviso ? (
          <div className="alert alert-success" role="status">
            <i className="bi bi-envelope-check me-2" />
            {aviso}
          </div>
        ) : (
          <form onSubmit={enviar}>
            {/* Nome: só ao criar conta */}
            {modo === 'criar' && (
              <div className="mb-3">
                <label htmlFor="authNome" className="form-label">{t('auth.seuNome')}</label>
                <input
                  id="authNome"
                  className="form-control"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={t('auth.seuNomePlaceholder')}
                  autoComplete="given-name"
                  maxLength={40}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="authEmail" className="form-label">{t('auth.email')}</label>
              <input
                id="authEmail"
                type="email"
                className={`form-control ${credenciaisErradas ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setCredenciaisErradas(false)
                }}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="authSenha" className="form-label">{t('auth.senha')}</label>
              {/* Campo de senha com o "olhinho" para mostrar ou esconder o que foi digitado */}
              <div className="input-group">
                <input
                  id="authSenha"
                  ref={campoSenha}
                  type={mostrarSenha ? 'text' : 'password'}
                  className={`form-control ${credenciaisErradas ? 'is-invalid' : ''}`}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    setCredenciaisErradas(false)
                    setErro('')
                  }}
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  minLength={modo === 'criar' ? 8 : 6}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary botao-olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? t('auth.esconderSenha') : t('auth.mostrarSenha')}
                  title={mostrarSenha ? t('auth.esconderSenha') : t('auth.mostrarSenha')}
                  aria-pressed={mostrarSenha}
                >
                  <i className={`bi ${mostrarSenha ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {/* Ao criar conta: lista das regras, que vão ficando verdes enquanto a pessoa digita */}
              {modo === 'criar' && (
                <ul className="regras-senha list-unstyled small mt-2 mb-0">
                  {regrasSenha.map((regra) => {
                    const cumpriu = regra.ok(senha)
                    return (
                      <li key={regra.id} className={cumpriu ? 'ok' : ''}>
                        <i className={`bi ${cumpriu ? 'bi-check-circle-fill' : 'bi-circle'} me-2`} />
                        {t(`auth.regras.${regra.id}`)}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Repetir a senha: só ao criar conta, para evitar erro de digitação */}
            {modo === 'criar' && (
              <div className="mb-3">
                <label htmlFor="authConfirmar" className="form-label">{t('auth.repetirSenha')}</label>
                <input
                  id="authConfirmar"
                  type={mostrarSenha ? 'text' : 'password'}
                  className={`form-control ${
                    confirmarSenha && confirmarSenha !== senha ? 'is-invalid' : ''
                  } ${confirmarSenha && confirmarSenha === senha ? 'is-valid' : ''}`}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <div className="invalid-feedback">{t('auth.senhasDiferentes')}</div>
              </div>
            )}

            {erro && (
              <div className="alert alert-danger py-2 small" role="alert">
                {erro}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
              {carregando && <span className="spinner-border spinner-border-sm me-2" />}
              {modo === 'entrar' ? t('auth.entrar') : t('auth.criarConta')}
            </button>
          </form>
        )}

        {/* Aviso para quem vai usar sem conta */}
        <div className="aviso-convidado mt-4" role="note">
          <i className="bi bi-exclamation-triangle-fill" />
          <div>
            <strong className="d-block mb-1">{t('auth.semContaTitulo')}</strong>
            {t('auth.semConta')}
          </div>
        </div>

        <div className="text-center mt-3">
          <Link to="/" className="small" onClick={onSemConta}>
            <i className="bi bi-arrow-left me-1" />
            {t('auth.voltar')}
          </Link>
        </div>

        {/* Problema para entrar ou criar conta: dá para avisar sem ter conta */}
        <div className="text-center mt-2">
          <button type="button" className="btn btn-link btn-sm link-secondary" onClick={() => setMandandoFeedback(true)}>
            <i className="bi bi-chat-heart me-1" />
            {t('feedback.problemaEntrar')}
          </button>
        </div>

        {mandandoFeedback && <ModalFeedback usuario={null} onFechar={() => setMandandoFeedback(false)} />}
      </div>
    </main>
  )
}

export default Entrar