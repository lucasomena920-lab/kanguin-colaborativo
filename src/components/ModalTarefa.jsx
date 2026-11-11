import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const prioridades = ['alta', 'media', 'baja']

function ModalTarefa({ tarefa, statusInicial, colunas, equipe, onSalvar, onExcluir, onFechar }) {
  const { t } = useTranslation()
  const editando = tarefa !== null

  const [form, setForm] = useState({
    titulo: tarefa?.titulo ?? '',
    descripcion: tarefa?.descripcion ?? '',
    status: tarefa?.status ?? statusInicial,
    prioridad: tarefa?.prioridad ?? 'media',
    responsable: tarefa?.responsable ?? equipe[0].nome,
    fecha_limite: tarefa?.fecha_limite ?? '',
  })

  function mudarCampo(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function enviar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) return

    onSalvar({
      ...form,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
    })
  }

  return (
    <Modal show onHide={onFechar} centered>
      <Form onSubmit={enviar}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">
            {editando ? t('modal.editar') : t('modal.nova')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="fTitulo">
            <Form.Label>{t('modal.titulo')}</Form.Label>
            <Form.Control
              name="titulo"
              value={form.titulo}
              onChange={mudarCampo}
              placeholder={t('modal.tituloPlaceholder')}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="fDescricao">
            <Form.Label>{t('modal.descricao')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={form.descripcion}
              onChange={mudarCampo}
              placeholder={t('modal.descricaoPlaceholder')}
            />
          </Form.Group>

          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="fStatus">
                <Form.Label>{t('modal.coluna')}</Form.Label>
                <Form.Select name="status" value={form.status} onChange={mudarCampo}>
                  {colunas.map((c) => (
                    <option key={c.id} value={c.id}>{t(`colunas.${c.id}`)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group controlId="fPrioridade">
                <Form.Label>{t('modal.prioridade')}</Form.Label>
                <Form.Select name="prioridad" value={form.prioridad} onChange={mudarCampo}>
                  {prioridades.map((p) => (
                    <option key={p} value={p}>{t(`prioridade.${p}`)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group controlId="fResponsavel">
                <Form.Label>{t('modal.responsavel')}</Form.Label>
                <Form.Select name="responsable" value={form.responsable} onChange={mudarCampo}>
                  {equipe.map((m) => (
                    <option key={m.nome} value={m.nome}>{m.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group controlId="fData">
                <Form.Label>{t('modal.dataLimite')}</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_limite"
                  value={form.fecha_limite}
                  onChange={mudarCampo}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          {editando && (
            <Button
              variant="link"
              className="text-danger me-auto text-decoration-none"
              onClick={() => onExcluir(tarefa)}
            >
              <i className="bi bi-trash3 me-1" />
              {t('modal.excluir')}
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onFechar}>
            {t('modal.cancelar')}
          </Button>
          <Button type="submit" variant="primary">
            {t('modal.salvar')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ModalTarefa