import { useTranslation } from 'react-i18next'

// Aparece por um instante enquanto uma página é baixada
function Carregando() {
  const { t } = useTranslation()

  return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t('carregando')}</span>
      </div>
    </div>
  )
}

export default Carregando
