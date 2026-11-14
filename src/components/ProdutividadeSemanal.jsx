import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { tarefasPorSemana, paraData } from '../utils/produtividade.js'

// Mismos colores que usa la página de Estadísticas (paleta Ocean Flow)
const corCriadas = '#2563EB'
const corConcluidas = '#10B981'

// Cajita que aparece al pasar el mouse por el gráfico (igual que en Estatisticas.jsx)
const estiloTooltip = {
  backgroundColor: 'var(--fundo-cards)',
  border: '1px solid var(--bordas)',
  borderRadius: 8,
  color: 'var(--texto-principal)',
}

// Gráfico de barras: tareas creadas y concluidas por semana.
// Recibe la lista de tareas del tablero. Se coloca dentro de un <div className="row g-3">.
function ProdutividadeSemanal({ tarefas }) {
  const { t, i18n } = useTranslation()

  const dados = tarefasPorSemana(tarefas).map((semana) => ({
    ...semana,
    nome: paraData(semana.semana).toLocaleDateString(i18n.resolvedLanguage, {
      day: '2-digit',
      month: 'short',
    }),
  }))

  if (dados.length === 0) return null

  return (
    <div className="col-12">
      <div className="painel p-3">
        <h2 className="h6 mb-3">
          {t('estatisticas.porSemana', { defaultValue: 'Tareas por semana' })}
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dados}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="nome" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={estiloTooltip} cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
            <Legend iconType="circle" />
            <Bar
              dataKey="criadas"
              name={t('estatisticas.criadas', { defaultValue: 'Creadas' })}
              fill={corCriadas}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="concluidas"
              name={t('estatisticas.concluidas', { defaultValue: 'Concluidas' })}
              fill={corConcluidas}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ProdutividadeSemanal