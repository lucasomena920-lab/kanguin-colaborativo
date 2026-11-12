import { useTranslation } from 'react-i18next'
import { formatarHoras } from '../utils/formatar.js'

const PASSO = 0.25 // 15 minutos
const MINIMO = 0.25
const MAXIMO = 24
const atalhos = [0.25, 0.5, 1, 2, 4, 8]

function InputHoras({ valor, onChange }) {
  const { t } = useTranslation()

  // Garante que o valor fica entre o mínimo e o máximo
  function mudar(novo) {
    onChange(Math.min(MAXIMO, Math.max(MINIMO, novo)))
  }

  return (
    <div className="input-horas">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-horas"
          onClick={() => mudar(valor - PASSO)}
          disabled={valor <= MINIMO}
          aria-label={t('modal.menosTempo')}
        >
          <i className="bi bi-dash-lg" />
        </button>

        <output className="valor-horas flex-grow-1 text-center fw-semibold" aria-live="polite">
          {formatarHoras(valor)}
        </output>

        <button
          type="button"
          className="btn btn-outline-secondary btn-horas"
          onClick={() => mudar(valor + PASSO)}
          disabled={valor >= MAXIMO}
          aria-label={t('modal.maisTempo')}
        >
          <i className="bi bi-plus-lg" />
        </button>
      </div>

      <div className="d-flex flex-wrap gap-1 mt-2">
        {atalhos.map((horas) => (
          <button
            key={horas}
            type="button"
            className={`btn btn-sm atalho-horas ${valor === horas ? 'ativo' : ''}`}
            onClick={() => mudar(horas)}
          >
            {formatarHoras(horas)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default InputHoras
