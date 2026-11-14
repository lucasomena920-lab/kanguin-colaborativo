import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'
import { nomeDoQuadro } from '../utils/formatar.js'

// Um convite recebido, com os botões Aceitar e Recusar
function ItemConvite({ convite, onAceitar, onRecusar }) {
  const { t } = useTranslation()
  const [ocupado, setOcupado] = useState(null) // 'aceitar' | 'recusar' | null
  const [erro, setErro] = useState(false)

  // Mesmo formato de um quadro, para o nome sair igual ao do seletor
  const nome = nomeDoQuadro({ nome: convite.quadro_nome, dono_nome: convite.dono_nome, papel: 'convidado' }, t)

  async function responder(acao, funcao) {
    setOcupado(acao)
    setErro(false)
    const deuCerto = await funcao(convite)
    // Se deu certo, o convite some da lista (e este componente também)
    if (!deuCerto) {
      setOcupado(null)
      setErro(true)
    }
  }

  return (
    <div className="item-convite px-3 py-2">
      <p className="small mb-2">
        <strong>{convite.convidado_por_nome ?? '?'}</strong> {t('convites.texto')}{' '}
        <strong>{nome}</strong> {t('convites.como')}{' '}
        <span className={`badge-papel ${convite.papel}`}>{t(`quadros.papeis.${convite.papel}`)}</span>
      </p>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-primary flex-grow-1"
          disabled={ocupado !== null}
          onClick={() => responder('aceitar', onAceitar)}
        >
          {ocupado === 'aceitar' && <span className="spinner-border spinner-border-sm me-1" />}
          {t('convites.aceitar')}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary flex-grow-1"
          disabled={ocupado !== null}
          onClick={() => responder('recusar', onRecusar)}
        >
          {ocupado === 'recusar' && <span className="spinner-border spinner-border-sm me-1" />}
          {t('convites.recusar')}
        </button>
      </div>
      {erro && <p className="small text-danger mt-2 mb-0">{t('auth.erros.generico')}</p>}
    </div>
  )
}

// Sininho com os convites recebidos e a lista de prazos que precisam de atenção
function Notificacoes({
  alertas,
  onAbrirTarefa,
  convites = [],
  onAceitarConvite,
  onRecusarConvite,
  alinhamento = 'start',
}) {
  const { t } = useTranslation()
  const total = alertas.reduce((soma, grupo) => soma + grupo.itens.length, 0) + convites.length

  return (
    <Dropdown align={alinhamento}>
      <Dropdown.Toggle
        bsPrefix="sino"
        variant=""
        className={`btn position-relative ${total > 0 ? 'tem-alertas' : ''}`}
        aria-label={total > 0 ? `${t('notificacoes.titulo')}: ${total}` : t('notificacoes.titulo')}
        title={t('notificacoes.titulo')}
      >
        <i className={`bi ${total > 0 ? 'bi-bell-fill' : 'bi-bell'} fs-5`} />
        {total > 0 && <span className="contador-sino">{total > 9 ? '9+' : total}</span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="menu-notificacoes shadow">
        <Dropdown.Header className="fw-semibold">{t('notificacoes.titulo')}</Dropdown.Header>

        {/* CONVITES: aparecem primeiro, porque pedem uma resposta */}
        {convites.length > 0 && (
          <>
            <div className="grupo-notificacao text-primary">
              <i className="bi bi-envelope-paper me-1" />
              {t('convites.titulo')} ({convites.length})
            </div>
            {convites.map((convite) => (
              <ItemConvite
                key={convite.id}
                convite={convite}
                onAceitar={onAceitarConvite}
                onRecusar={onRecusarConvite}
              />
            ))}
          </>
        )}

        {total === 0 ? (
          <p className="px-3 py-2 small text-body-secondary mb-0">
            <i className="bi bi-check2-circle me-1" />
            {t('notificacoes.nada')}
          </p>
        ) : (
          alertas
            .filter((grupo) => grupo.itens.length > 0)
            .map((grupo) => (
              <Fragment key={grupo.id}>
                <div className="grupo-notificacao" style={{ color: grupo.cor }}>
                  <i className={`bi ${grupo.icone} me-1`} />
                  {t(`notificacoes.${grupo.id}`)} ({grupo.itens.length})
                </div>
                {grupo.itens.map((tarefa) => (
                  <Dropdown.Item key={tarefa.id} onClick={() => onAbrirTarefa(tarefa)} className="text-truncate">
                    {tarefa.titulo}
                  </Dropdown.Item>
                ))}
              </Fragment>
            ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default Notificacoes
