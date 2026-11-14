import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { supabase } from '../lib/supabase.js'
import { nomeDoQuadro } from '../utils/formatar.js'

// Ordem em que os papéis aparecem na lista (do que pode mais para o que pode menos)
const ordemPapeis = ['dono', 'admin', 'editor', 'colaborador', 'leitor']

// Quais papéis cada um pode dar aos outros (o banco confere as mesmas regras)
function papeisQuePossoDar(meuPapel) {
  if (meuPapel === 'dono') return ['admin', 'editor', 'colaborador', 'leitor']
  if (meuPapel === 'admin') return ['editor', 'colaborador', 'leitor']
  return []
}

// Posso mudar o papel ou remover essa pessoa?
function possoGerenciar(meuPapel, membro, meuId) {
  if (membro.user_id === meuId || membro.papel === 'dono') return false
  if (meuPapel === 'dono') return true
  return meuPapel === 'admin' && membro.papel !== 'admin'
}

function ModalCompartilhar({ quadro, usuario, onFechar }) {
  const { t } = useTranslation()
  const meuPapel = quadro.papel
  const podeConvidar = meuPapel === 'dono' || meuPapel === 'admin'
  const opcoesPapel = papeisQuePossoDar(meuPapel)

  const [membros, setMembros] = useState(null) // null = carregando
  const [convites, setConvites] = useState([])
  const [erro, setErro] = useState('')
  const [email, setEmail] = useState('')
  const [papel, setPapel] = useState('editor')
  const [enviando, setEnviando] = useState(false)
  const [removendo, setRemovendo] = useState(null) // user_id de quem está para ser removido

  // Carrega quem participa (com nome e email) e os convites pendentes
  useEffect(() => {
    let cancelado = false

    async function carregar() {
      const { data: linhas, error } = await supabase
        .from('quadro_membros')
        .select('user_id, papel, entrou_em')
        .eq('quadro_id', quadro.id)
      if (cancelado) return
      if (error) {
        setErro(t('auth.erros.generico'))
        setMembros([])
        return
      }

      // Os nomes ficam na tabela "perfis"
      const ids = linhas.map((m) => m.user_id)
      const { data: perfis } = await supabase.from('perfis').select('id, nome, email').in('id', ids)
      const perfilDe = Object.fromEntries((perfis ?? []).map((p) => [p.id, p]))

      let pendentes = []
      if (podeConvidar) {
        const { data } = await supabase
          .from('convites')
          .select('id, email, papel, criado_em')
          .eq('quadro_id', quadro.id)
          .order('criado_em')
        pendentes = data ?? []
      }
      if (cancelado) return

      const lista = linhas
        .map((m) => ({ ...m, nome: perfilDe[m.user_id]?.nome ?? '?', email: perfilDe[m.user_id]?.email ?? '' }))
        .sort((a, b) => ordemPapeis.indexOf(a.papel) - ordemPapeis.indexOf(b.papel) || a.nome.localeCompare(b.nome))
      setMembros(lista)
      setConvites(pendentes)
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [quadro.id, podeConvidar, t])

  async function convidar(e) {
    e.preventDefault()
    setErro('')
    const emailLimpo = email.trim().toLowerCase()

    // Conferências antes de mandar para o banco
    if (emailLimpo === usuario.email?.toLowerCase()) return setErro(t('compartilhar.erros.voceMesmo'))
    if (membros?.some((m) => m.email === emailLimpo)) return setErro(t('compartilhar.erros.jaMembro'))
    if (convites.some((c) => c.email === emailLimpo)) return setErro(t('compartilhar.erros.jaConvidado'))

    setEnviando(true)
    const { data, error } = await supabase
      .from('convites')
      .insert({ quadro_id: quadro.id, email: emailLimpo, papel })
      .select('id, email, papel, criado_em')
      .single()
    setEnviando(false)

    if (error) {
      // 23505 = já existe um convite igual (unique); 42501 = a regra de segurança barrou
      if (error.code === '23505') setErro(t('compartilhar.erros.jaConvidado'))
      else if (error.code === '42501') setErro(t('compartilhar.erros.semPermissao'))
      else setErro(t('auth.erros.generico'))
      return
    }
    setConvites((atual) => [...atual, data])
    setEmail('')
  }

  async function cancelarConvite(id) {
    setErro('')
    const { error } = await supabase.from('convites').delete().eq('id', id)
    if (error) return setErro(t('auth.erros.generico'))
    setConvites((atual) => atual.filter((c) => c.id !== id))
  }

  async function mudarPapel(membro, novoPapel) {
    setErro('')
    // O .select() devolve as linhas alteradas: se vier vazio, a regra de segurança não deixou
    const { data, error } = await supabase
      .from('quadro_membros')
      .update({ papel: novoPapel })
      .eq('quadro_id', quadro.id)
      .eq('user_id', membro.user_id)
      .select('user_id')
    if (error || !data?.length) return setErro(t('compartilhar.erros.semPermissao'))
    setMembros((atual) => atual.map((m) => (m.user_id === membro.user_id ? { ...m, papel: novoPapel } : m)))
  }

  async function remover(membro) {
    setErro('')
    const { data, error } = await supabase
      .from('quadro_membros')
      .delete()
      .eq('quadro_id', quadro.id)
      .eq('user_id', membro.user_id)
      .select('user_id')
    setRemovendo(null)
    if (error || !data?.length) return setErro(t('compartilhar.erros.semPermissao'))
    setMembros((atual) => atual.filter((m) => m.user_id !== membro.user_id))
  }

  return (
    <Modal show onHide={onFechar} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5">
          {t('compartilhar.titulo')}
          <small className="d-block text-body-secondary fw-normal fs-6 mt-1">{nomeDoQuadro(quadro, t)}</small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex flex-column gap-4">
        {/* CONVIDAR */}
        {podeConvidar ? (
          <Form onSubmit={convidar}>
            <Form.Label htmlFor="fEmailConvite" className="fw-semibold">{t('compartilhar.convidar')}</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              <Form.Control
                id="fEmailConvite"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('compartilhar.emailPlaceholder')}
                className="flex-grow-1 campo-convite"
                required
              />
              <Form.Select
                value={papel}
                onChange={(e) => setPapel(e.target.value)}
                className="w-auto"
                aria-label={t('compartilhar.papel')}
              >
                {opcoesPapel.map((p) => (
                  <option key={p} value={p}>{t(`quadros.papeis.${p}`)}</option>
                ))}
              </Form.Select>
              <Button type="submit" variant="primary" disabled={!email.trim() || enviando}>
                {enviando ? <span className="spinner-border spinner-border-sm" /> : t('compartilhar.enviar')}
              </Button>
            </div>
            <Form.Text>
              <strong>{t(`quadros.papeis.${papel}`)}:</strong> {t(`compartilhar.descricoes.${papel}`)}
            </Form.Text>
          </Form>
        ) : (
          <p className="small text-body-secondary mb-0">
            <i className="bi bi-info-circle me-1" />
            {t('compartilhar.soDonoAdmin')}
          </p>
        )}

        {erro && <div className="alert alert-danger py-2 small mb-0" role="alert">{erro}</div>}

        {/* QUEM PARTICIPA */}
        <section>
          <h3 className="h6 fw-semibold mb-2">
            {t('compartilhar.membros')}
            {membros && <span className="text-body-secondary fw-normal"> ({membros.length})</span>}
          </h3>

          {membros === null ? (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : (
            <ul className="list-unstyled mb-0 lista-compartilhar">
              {membros.map((membro) => {
                const souEu = membro.user_id === usuario.id
                const gerenciavel = possoGerenciar(meuPapel, membro, usuario.id)

                return (
                  <li key={membro.user_id} className="d-flex align-items-center gap-2 py-2">
                    <span className="avatar-membro" aria-hidden="true">{membro.nome.charAt(0).toUpperCase()}</span>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold text-truncate">
                        {membro.nome}
                        {souEu && <span className="text-body-secondary fw-normal"> ({t('compartilhar.voce')})</span>}
                      </div>
                      <div className="small text-body-secondary text-truncate">{membro.email}</div>
                    </div>

                    {removendo === membro.user_id ? (
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="danger" onClick={() => remover(membro)}>
                          {t('compartilhar.remover')}
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => setRemovendo(null)}>
                          {t('modal.cancelar')}
                        </Button>
                      </div>
                    ) : gerenciavel ? (
                      <>
                        <Form.Select
                          size="sm"
                          className="w-auto"
                          value={membro.papel}
                          onChange={(e) => mudarPapel(membro, e.target.value)}
                          aria-label={t('compartilhar.papelDe', { nome: membro.nome })}
                        >
                          {/* Um admin vendo outro admin não chega aqui, então a lista de opções sempre serve */}
                          {opcoesPapel.map((p) => (
                            <option key={p} value={p}>{t(`quadros.papeis.${p}`)}</option>
                          ))}
                        </Form.Select>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger px-1"
                          onClick={() => setRemovendo(membro.user_id)}
                          title={t('compartilhar.remover')}
                          aria-label={t('compartilhar.removerNome', { nome: membro.nome })}
                        >
                          <i className="bi bi-person-dash" />
                        </button>
                      </>
                    ) : (
                      <span className={`badge-papel ${membro.papel}`}>{t(`quadros.papeis.${membro.papel}`)}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* CONVITES PENDENTES */}
        {podeConvidar && convites.length > 0 && (
          <section>
            <h3 className="h6 fw-semibold mb-2">{t('compartilhar.pendentes')}</h3>
            <ul className="list-unstyled mb-0 lista-compartilhar">
              {convites.map((convite) => (
                <li key={convite.id} className="d-flex align-items-center gap-2 py-2">
                  <span className="avatar-membro pendente" aria-hidden="true">
                    <i className="bi bi-envelope" />
                  </span>
                  <div className="flex-grow-1 min-w-0">
                    <div className="text-truncate">{convite.email}</div>
                    <div className="small text-body-secondary">{t('compartilhar.aguardando')}</div>
                  </div>
                  <span className={`badge-papel ${convite.papel}`}>{t(`quadros.papeis.${convite.papel}`)}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-body-secondary px-1"
                    onClick={() => cancelarConvite(convite.id)}
                    title={t('compartilhar.cancelarConvite')}
                    aria-label={t('compartilhar.cancelarConvite')}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="small text-body-secondary mt-2 mb-0">{t('compartilhar.notaConvite')}</p>
          </section>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ModalCompartilhar
