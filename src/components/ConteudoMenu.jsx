import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase.js'
import CartaoConta from './CartaoConta.jsx'
import ModalMeuNome from './ModalMeuNome.jsx'
import ModalFeedback from './ModalFeedback.jsx'
import SeletorQuadro from './SeletorQuadro.jsx'
import { usePermissoes, possoGerenciar } from '../contexts/permissoes.js'
import { corDaPessoa } from '../utils/cores.js'

const idiomas = [
  { codigo: 'pt', rotulo: 'PT' },
  { codigo: 'es', rotulo: 'ES' },
  { codigo: 'en', rotulo: 'EN' },
]

function ConteudoMenu({
  equipe,
  participantes = [],
  meuNome,
  onMudarNome,
  onRemoverParticipante,
  tema,
  totalLixeira,
  usuario,
  statusNuvem,
  quadros,
  quadroAtual,
  onTrocarQuadro,
  onCriarQuadro,
  onExcluirQuadro,
  onSair,
  onAlternarTema,
  onNavegar,
  onAdicionarMembro,
  onRemoverMembro,
}) {
  const { t, i18n } = useTranslation()
  // Só dono, admin e editor mudam a equipe
  const { podeTudo: podeMudarEquipe, papel: meuPapel } = usePermissoes()

  // Meu nome: o escolhido pela pessoa; enquanto carrega, o começo do email
  const nomeExibido = meuNome || usuario?.email?.split('@')[0] || ''
  const [editandoNome, setEditandoNome] = useState(false)
  const [mandandoFeedback, setMandandoFeedback] = useState(false)

  return (
    <>
      {/* Seletor de quadros: só com login */}
      {usuario && (
        <SeletorQuadro
          quadros={quadros}
          quadroAtual={quadroAtual}
          onTrocar={onTrocarQuadro}
          onCriar={onCriarQuadro}
          onExcluir={onExcluirQuadro}
          onNavegar={onNavegar}
        />
      )}

      <nav>
        <p className="menu-titulo">{t('menu.titulo')}</p>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <NavLink to="/" end className="nav-link" onClick={onNavegar}>
              <i className="bi bi-columns-gap me-2" />
              {t('menu.quadro')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/estatisticas" className="nav-link" onClick={onNavegar}>
              <i className="bi bi-bar-chart-line me-2" />
              {t('menu.estatisticas')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/calendario" className="nav-link" onClick={onNavegar}>
              <i className="bi bi-calendar3 me-2" />
              {t('menu.calendario')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/lixeira" className="nav-link d-flex align-items-center" onClick={onNavegar}>
              <i className="bi bi-trash3 me-2" />
              {t('menu.lixeira')}
              {totalLixeira > 0 && (
                <span className="badge rounded-pill contador-lixeira ms-auto">{totalLixeira}</span>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div>
        <div className="d-flex align-items-center mb-2">
          <p className="menu-titulo mb-0 me-auto">{t('equipe')}</p>
          {podeMudarEquipe && (
            <button
              type="button"
              className="btn btn-sm btn-icone"
              onClick={onAdicionarMembro}
              aria-label={t('membro.adicionar')}
              title={t('membro.adicionar')}
            >
              <i className="bi bi-person-plus" />
            </button>
          )}
        </div>

        {/* Pessoas com conta que participam do quadro (entram sozinhas) */}
        {participantes.length > 0 && (
          <ul className="list-unstyled d-flex flex-column gap-1 px-2 mb-0">
            {participantes.map((pessoa) => (
              <li key={pessoa.user_id} className="membro d-flex align-items-center gap-2">
                <span className="avatar" style={{ backgroundColor: corDaPessoa(pessoa.user_id) }}>
                  {pessoa.nome[0].toUpperCase()}
                </span>
                <span className="me-auto text-truncate">
                  {pessoa.nome}
                  {pessoa.user_id === usuario?.id && (
                    <span className="text-body-secondary small"> ({t('membro.voce')})</span>
                  )}
                </span>
                {/* Na minha linha: lápis para mudar como eu apareço */}
                {pessoa.user_id === usuario?.id && (
                  <button
                    type="button"
                    className="btn btn-sm btn-icone"
                    onClick={() => setEditandoNome(true)}
                    aria-label={t('auth.mudarNome')}
                    title={t('auth.mudarNome')}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                )}
                <span className={`badge-papel ${pessoa.papel}`}>{t(`quadros.papeis.${pessoa.papel}`)}</span>
                {/* Dono e admin podem tirar a pessoa do quadro (mesmas regras do Compartilhar) */}
                {possoGerenciar(meuPapel, pessoa, usuario?.id) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-icone btn-remover"
                    onClick={() => onRemoverParticipante(pessoa)}
                    aria-label={t('membro.tirar', { nome: pessoa.nome })}
                    title={t('membro.tirar', { nome: pessoa.nome })}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Nomes adicionados à mão: pessoas sem conta no Kanguin */}
        {participantes.length > 0 && equipe.length > 0 && (
          <p className="menu-subtitulo">{t('membro.semConta')}</p>
        )}

        {participantes.length === 0 && equipe.length === 0 ? (
          <p className="small text-body-secondary px-2 mb-0">{t('membro.vazia')}</p>
        ) : equipe.length === 0 ? null : (
          <ul className="list-unstyled d-flex flex-column gap-1 px-2 mb-0">
            {equipe.map((membro) => (
              <li key={membro.nome} className="membro d-flex align-items-center gap-2">
                <span className="avatar" style={{ backgroundColor: membro.cor }}>
                  {membro.nome[0].toUpperCase()}
                </span>
                <span className="me-auto text-truncate">{membro.nome}</span>
                {podeMudarEquipe && (
                  <button
                    type="button"
                    className="btn btn-sm btn-icone btn-remover"
                    onClick={() => onRemoverMembro(membro)}
                    aria-label={t('membro.remover', { nome: membro.nome })}
                    title={t('membro.remover', { nome: membro.nome })}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto d-flex flex-column gap-3">
        {/* Suporte e feedback: só com o Supabase configurado (é lá que as mensagens ficam) */}
        {supabase && (
          <button type="button" className="btn btn-link link-secondary botao-feedback" onClick={() => setMandandoFeedback(true)}>
            <i className="bi bi-chat-heart me-2" />
            {t('feedback.botao')}
          </button>
        )}

        <div>
          <p className="menu-titulo">{t('idioma')}</p>
          <div className="btn-group w-100" role="group" aria-label={t('idioma')}>
            {idiomas.map((idioma) => (
              <button
                key={idioma.codigo}
                type="button"
                className={`btn btn-sm ${
                  i18n.resolvedLanguage === idioma.codigo ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => i18n.changeLanguage(idioma.codigo)}
              >
                {idioma.rotulo}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-outline-secondary" onClick={onAlternarTema}>
          <i className={tema === 'light' ? 'bi bi-moon-stars me-2' : 'bi bi-sun me-2'} />
          {tema === 'light' ? t('tema.escuro') : t('tema.claro')}
        </button>

        {/* Conta: só aparece se o Supabase estiver configurado */}
        {supabase &&
          (usuario ? (
            <CartaoConta
              usuario={usuario}
              nome={nomeExibido}
              statusNuvem={statusNuvem}
              onEditarNome={() => setEditandoNome(true)}
              onSair={onSair}
            />
          ) : (
            <div>
              <p className="menu-titulo">{t('auth.conta')}</p>
              <NavLink to="/entrar" className="btn btn-outline-primary w-100" onClick={onNavegar}>
                <i className="bi bi-person-circle me-2" />
                {t('auth.entrar')}
              </NavLink>
            </div>
          ))}
      </div>

      {mandandoFeedback && <ModalFeedback usuario={usuario} onFechar={() => setMandandoFeedback(false)} />}

      {editandoNome && (
        <ModalMeuNome nomeAtual={nomeExibido} onSalvar={onMudarNome} onFechar={() => setEditandoNome(false)} />
      )}
    </>
  )
}

export default ConteudoMenu