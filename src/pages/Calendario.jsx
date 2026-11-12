import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../components/Card.jsx'

const localidades = { pt: 'pt-PT', es: 'es-ES', en: 'en-GB' }

// Date -> 'AAAA-MM-DD' (no fuso horário local)
function paraISO(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// "novembro de 2026" -> "Novembro de 2026"
function primeiraMaiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Todos os dias que aparecem na grade do mês, começando na segunda-feira.
// Inclui o fim do mês anterior e o começo do próximo para completar as semanas.
function diasDaGrade(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1)
  const inicio = (primeiroDia.getDay() + 6) % 7 // segunda = 0 ... domingo = 6
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const totalCelulas = Math.ceil((inicio + diasNoMes) / 7) * 7

  return Array.from({ length: totalCelulas }, (_, i) => new Date(ano, mes, i - inicio + 1))
}

function Calendario({ tarefas, equipe, onEditar, onAdicionar }) {
  const { t, i18n } = useTranslation()
  const local = localidades[i18n.resolvedLanguage] || 'pt-PT'
  const hoje = paraISO(new Date())

  const [mesAtual, setMesAtual] = useState(() => {
    const agora = new Date()
    return new Date(agora.getFullYear(), agora.getMonth(), 1)
  })
  const [diaSelecionado, setDiaSelecionado] = useState(hoje)

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const dias = diasDaGrade(ano, mes)

  // Agrupa as tarefas pela data-limite: { '2026-11-20': [tarefa, tarefa], ... }
  const porDia = {}
  tarefas.forEach((tarefa) => {
    if (!tarefa.fecha_limite) return
    if (!porDia[tarefa.fecha_limite]) porDia[tarefa.fecha_limite] = []
    porDia[tarefa.fecha_limite].push(tarefa)
  })

  // Tarefas sem data (por horas ou sem prazo) que ainda não foram feitas
  const semData = tarefas.filter((item) => !item.fecha_limite && item.status !== 'feito')
  const tarefasDoDia = porDia[diaSelecionado] || []

  // Nomes traduzidos pelo próprio navegador (01/01/2024 foi uma segunda-feira).
  // Ficam só as 3 primeiras letras: "seg", "ter"... / "lun", "mar"... / "Mon", "Tue"...
  const nomesSemana = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i)
      .toLocaleDateString(local, { weekday: 'short' })
      .replace('.', '')
      .slice(0, 3)
  )
  const tituloMes = primeiraMaiuscula(
    mesAtual.toLocaleDateString(local, { month: 'long', year: 'numeric' })
  )
  const tituloDia = primeiraMaiuscula(
    new Date(diaSelecionado + 'T00:00').toLocaleDateString(local, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  function mudarMes(quantos) {
    setMesAtual(new Date(ano, mes + quantos, 1))
  }

  function irParaHoje() {
    const agora = new Date()
    setMesAtual(new Date(agora.getFullYear(), agora.getMonth(), 1))
    setDiaSelecionado(hoje)
  }

  return (
    <main className="p-3 p-md-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0 me-auto">{t('menu.calendario')}</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={irParaHoje}>
          {t('calendario.hoje')}
        </button>
        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-secondary"
            onClick={() => mudarMes(-1)}
            aria-label={t('calendario.anterior')}
          >
            <i className="bi bi-chevron-left" />
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => mudarMes(1)}
            aria-label={t('calendario.proximo')}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* ===== GRADE DO MÊS ===== */}
        <div className="col-lg-8">
          <div className="painel p-2 p-md-3">
            <h2 className="h5 text-center mb-3">{tituloMes}</h2>

            <div className="grade-calendario">
              {nomesSemana.map((nome) => (
                <div key={nome} className="dia-semana">{nome}</div>
              ))}

              {dias.map((data) => {
                const iso = paraISO(data)
                const doDia = porDia[iso] || []
                const classes = [
                  'dia',
                  data.getMonth() !== mes && 'fora',
                  iso === hoje && 'hoje',
                  iso === diaSelecionado && 'selecionado',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <button
                    key={iso}
                    type="button"
                    className={classes}
                    onClick={() => setDiaSelecionado(iso)}
                    aria-pressed={iso === diaSelecionado}
                    aria-label={data.toLocaleDateString(local, { day: 'numeric', month: 'long' })}
                  >
                    <span className="numero-dia">{data.getDate()}</span>

                    {/* Computador: títulos das tarefas */}
                    <span className="d-none d-md-flex flex-column gap-1 w-100">
                      {doDia.slice(0, 2).map((tarefa) => (
                        <span
                          key={tarefa.id}
                          className={`mini-tarefa ${tarefa.prioridad} ${tarefa.status === 'feito' ? 'feita' : ''}`}
                        >
                          {tarefa.titulo}
                        </span>
                      ))}
                      {doDia.length > 2 && <span className="mais-tarefas">+{doDia.length - 2}</span>}
                    </span>

                    {/* Celular: só bolinhas coloridas */}
                    {doDia.length > 0 && (
                      <span className="d-flex d-md-none gap-1">
                        {doDia.slice(0, 3).map((tarefa) => (
                          <span key={tarefa.id} className={`ponto ${tarefa.prioridad}`} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ===== DIA SELECIONADO ===== */}
        <div className="col-lg-4">
          <div className="painel p-3 mb-3">
            <h2 className="h6 mb-3">{tituloDia}</h2>

            {tarefasDoDia.length === 0 ? (
              <p className="vazio">{t('calendario.diaVazio')}</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {tarefasDoDia.map((tarefa) => (
                  <Card key={tarefa.id} tarefa={tarefa} equipe={equipe} onEditar={onEditar} />
                ))}
              </div>
            )}

            <button
              className="btn btn-add w-100 text-start mt-2"
              onClick={() => onAdicionar(diaSelecionado)}
            >
              <i className="bi bi-plus-lg me-1" />
              {t('coluna.adicionar')}
            </button>
          </div>

          {semData.length > 0 && (
            <div className="painel p-3">
              <h2 className="h6 mb-3">{t('calendario.semData')}</h2>
              <div className="d-flex flex-column gap-2">
                {semData.map((tarefa) => (
                  <Card key={tarefa.id} tarefa={tarefa} equipe={equipe} onEditar={onEditar} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Calendario
