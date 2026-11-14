import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

// Pergunta, no primeiro login, se a pessoa quer levar as tarefas do navegador para a conta
function ModalMigracao({ total, onLevar, onAgoraNao }) {
  const { t } = useTranslation()

  return (
    <Modal show centered backdrop="static" onHide={onAgoraNao}>
      <Modal.Header>
        <Modal.Title as="h2" className="h5">
          <i className="bi bi-cloud-upload me-2 text-primary" />
          {t('migracao.titulo')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{t('migracao.texto', { count: total })}</p>
        <p className="small text-body-secondary mb-0">{t('migracao.nota')}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onAgoraNao}>
          {t('migracao.agoraNao')}
        </Button>
        <Button variant="primary" onClick={onLevar}>
          {t('migracao.levar')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalMigracao
