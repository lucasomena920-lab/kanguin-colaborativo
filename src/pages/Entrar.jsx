import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase.js'
import Logo from '../components/Logo.jsx'

// Erros do Supabase que têm mensagem própria nos arquivos de tradução
const errosConhecidos = [
  'invalid_credentials',
  'email_not_confirmed',
  'user_already_exists',
  'weak_password',
  'over_email_send_rate_limit',
]

function Entrar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [modo, setModo] = useState('entrar') // 'entrar' ou 'criar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

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
  }

  function mensagemDeErro(error) {
    return errosConhecidos.includes(error.code)
      ? t(`auth.erros.${error.code}`)
      : t('auth.erros.generico')
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
        return
      }
      navigate('/')
      return
    }

    // modo === 'criar'
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: window.location.origin },
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
            <div className="mb-3">
              <label htmlFor="authEmail" className="form-label">{t('auth.email')}</label>
              <input
                id="authEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="authSenha" className="form-label">{t('auth.senha')}</label>
              <input
                id="authSenha"
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              {modo === 'criar' && <div className="form-text">{t('auth.senhaDica')}</div>}
            </div>

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
          <Link to="/" className="small">
            <i className="bi bi-arrow-left me-1" />
            {t('auth.voltar')}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Entrar