import { useTranslation } from 'react-i18next'

function EmBreve({ titulo, icone }) {
  const { t } = useTranslation()

  return (
    <main className="p-4">
      <h1 className="h3 mb-4">{titulo}</h1>

      <div className="vazio py-5">
        <i className={`bi ${icone} fs-1 d-block mb-2`} />
        {t('emBreve')}
      </div>
    </main>
  )
}

export default EmBreve