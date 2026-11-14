import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'

// Ícone de cada situação da nuvem
const iconesNuvem = {
  carregando: 'bi-cloud-arrow-down',
  salvando: 'bi-arrow-repeat',
  sincronizado: 'bi-cloud-check',
  erro: 'bi-cloud-slash',
}

// Cartão da conta no rodapé do menu: avatar, nome e situação da nuvem.
// Ao clicar, abre um menu com o email completo e o botão de sair.
function CartaoConta({ usuario, statusNuvem, onSair }) {
  const { t } = useTranslation()

  // "lucas.omena@gmail.com" -> "lucas.omena"
  const nome = usuario.email.split('@')[0]

  return (
    <Dropdown drop="up" className="w-100">
      <Dropdown.Toggle bsPrefix="cartao-conta" variant="" className="w-100">
        <span className="avatar-conta">
          {nome[0].toUpperCase()}
          <span className={`ponto-status ${statusNuvem}`} />
        </span>

        <span className="flex-grow-1 min-w-0 text-start">
          <span className="d-block fw-semibold text-truncate">{nome}</span>
          <span className={`status-nuvem ${statusNuvem} d-block text-truncate`}>
            <i className={`bi ${iconesNuvem[statusNuvem]} me-1`} />
            {t(`auth.nuvem.${statusNuvem}`)}
          </span>
        </span>

        <i className="bi bi-chevron-expand text-body-secondary" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="menu-conta shadow">
        <div className="px-3 py-2">
          <div className="small text-body-secondary">{t('auth.conectadoComo')}</div>
          <div className="small fw-semibold text-truncate" title={usuario.email}>
            {usuario.email}
          </div>
        </div>
        <Dropdown.Divider />
        <Dropdown.Item as="button" onClick={onSair} className="text-danger">
          <i className="bi bi-box-arrow-right me-2" />
          {t('auth.sair')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default CartaoConta
