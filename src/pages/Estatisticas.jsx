import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  contarPor,
  tarefasAtrasadas,
  porcentagemConcluida,
  tempoMedioConclusao,
} from '../utils/estatisticas.js'

// Cores da paleta Ocean Flow (os gráficos precisam do código da cor)
const coresStatus = { 'a-fazer': '#EF4444', fazendo: '#F59E0B', feito: '#10B981' }
const coresPrioridade = { alta: '#EF4444', media: '#F59E0B', baja: '#10B981' }
const prioridades = ['alta', 'media', 'baja']

// Caixinha que aparece ao passar o mouse num gráfico
const estiloTooltip = {
  backgroundColor: 'var(--fundo-cards)',
  border: '1px solid var(--bordas)',
  borderRadius: 8,
  color: 'var(--texto-principal)',
}

function CardResumo({ icone, cor, titulo, valor, detalhe }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="painel h-100 p-3">
        <div className="d-flex align-items-center gap-2 mb-2 small text-body-secondary">
          <span
            className="icone-resumo"
            style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 15%, transparent)` }}
          >
            <i className={`bi ${icone}`} />
          </span>
          {titulo}
        </div>
        <div className="fs-3 fw-bold">{valor}</div>
        {detalhe && <div className="small text-body-secondary">{detalhe}</div>}
      </div>
    </div>
  )
}

function Estatisticas({ tarefas, colunas, equipe }) {
  const { t, i18n } = useTranslation()

  if (tarefas.length === 0) {
    return (
      <main className="p-3 p-md-4">
        <h1 className="h3 mb-4">{t('menu.estatisticas')}</h1>
        <p className="vazio py-5">{t('estatisticas.semDados')}</p>
      </main>
    )
  }

  // ===== CÁLCULOS =====
  const porStatus = contarPor(tarefas, 'status')
  const porPrioridade = contarPor(tarefas, 'prioridad')
  const porResponsavel = contarPor(tarefas, 'responsable')
  const atrasadas = tarefasAtrasadas(tarefas).length
  const concluido = porcentagemConcluida(tarefas)
  const tempoMedio = tempoMedioConclusao(tarefas)

  // ===== DADOS NO FORMATO DOS GRÁFICOS =====
  const dadosStatus = colunas.map((coluna) => ({
    nome: t(`colunas.${coluna.id}`),
    total: porStatus[coluna.id] || 0,
    cor: coresStatus[coluna.id],
  }))

  const dadosPrioridade = prioridades
    .map((p) => ({
      nome: t(`prioridade.${p}`),
      total: porPrioridade[p] || 0,
      cor: coresPrioridade[p],
    }))
    .filter((d) => d.total > 0)

  const dadosResponsavel = equipe.map((membro) => ({
    nome: membro.nome,
    total: porResponsavel[membro.nome] || 0,
    cor: membro.cor,
  }))

  return (
    <main className="p-3 p-md-4">
      <h1 className="h3 mb-4">{t('menu.estatisticas')}</h1>

      {/* ===== CARDS DE RESUMO ===== */}
      <div className="row g-3 mb-3">
        <CardResumo
          icone="bi-list-task"
          cor="#2563EB"
          titulo={t('estatisticas.total')}
          valor={tarefas.length}
        />
        <CardResumo
          icone="bi-check2-circle"
          cor="#10B981"
          titulo={t('estatisticas.concluido')}
          valor={`${concluido}%`}
          detalhe={t('estatisticas.deTotal', { feitas: porStatus.feito || 0, total: tarefas.length })}
        />
        <CardResumo
          icone="bi-exclamation-triangle"
          cor="#EF4444"
          titulo={t('estatisticas.atrasadas')}
          valor={atrasadas}
        />
        <CardResumo
          icone="bi-stopwatch"
          cor="#06B6D4"
          titulo={t('estatisticas.tempoMedio')}
          valor={tempoMedio === null ? '–' : tempoMedio.toLocaleString(i18n.resolvedLanguage)}
          detalhe={tempoMedio === null ? null : t('estatisticas.diasAteConcluir')}
        />
      </div>

      {/* ===== GRÁFICOS ===== */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="painel h-100 p-3">
            <h2 className="h6 mb-3">{t('estatisticas.porColuna')}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dadosStatus}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="nome" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={estiloTooltip} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
                <Bar dataKey="total" name={t('estatisticas.tarefas')} radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {dadosStatus.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="painel h-100 p-3">
            <h2 className="h6 mb-3">{t('estatisticas.porPrioridade')}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dadosPrioridade}
                  dataKey="total"
                  nameKey="nome"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {dadosPrioridade.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={estiloTooltip} />
                <Legend iconType="circle" itemSorter={null} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12">
          <div className="painel p-3">
            <h2 className="h6 mb-3">{t('estatisticas.porResponsavel')}</h2>
            <ResponsiveContainer width="100%" height={60 + dadosResponsavel.length * 40}>
              <BarChart data={dadosResponsavel} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="nome" tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={estiloTooltip} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
                <Bar dataKey="total" name={t('estatisticas.tarefas')} radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {dadosResponsavel.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Estatisticas