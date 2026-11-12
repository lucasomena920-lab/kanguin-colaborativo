import { useTranslation } from 'react-i18next'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

// Aviso que aparece embaixo da tela depois de excluir algo,
// com o botão "Desfazer". Some sozinho depois de alguns segundos.
function AvisoDesfazer({ aviso, onFechar }) {
  const { t } = useTranslation()

  function desfazer() {
    aviso.aoDesfazer()
    onFechar()
  }

  return (
    <ToastContainer position="bottom-center" className="p-3 position-fixed">
      <Toast show={aviso !== null} onClose={onFechar} autohide delay={10000} className="aviso-desfazer">
        {aviso && (
          <Toast.Body className="d-flex align-items-center gap-3">
            <i className={`bi ${aviso.icone}`} />
            <span className="me-auto">{aviso.mensagem}</span>
            <button type="button" className="btn btn-sm btn-desfazer" onClick={desfazer}>
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
        )}
      </Toast>
    </ToastContainer>
  )
}

export default AvisoDesfazer
