import { useTranslation } from 'react-i18next'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

// Aviso que aparece embaixo da tela depois de limpar o quadro,
// com o botão "Desfazer". Some sozinho depois de alguns segundos.
function AvisoDesfazer({ mensagem, onDesfazer, onFechar }) {
  const { t } = useTranslation()

  return (
    <ToastContainer position="bottom-center" className="p-3 position-fixed">
      <Toast show={mensagem !== null} onClose={onFechar} autohide delay={10000} className="aviso-desfazer">
        <Toast.Body className="d-flex align-items-center gap-3">
          <i className="bi bi-trash3" />
          <span className="me-auto">{mensagem}</span>
          <button type="button" className="btn btn-sm btn-desfazer" onClick={onDesfazer}>
            <i className="bi bi-arrow-counterclockwise me-1" />
            {t('aviso.desfazer')}
          </button>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onFechar}
            aria-label={t('aviso.fechar')}
          />
        </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default AvisoDesfazer
