import { Component } from 'substance'

export default
class ValueComponent extends Component {

  render($$) {
    const registry = this.context.componentRegistry
    let el = $$('div').addClass('sc-cell-value')
    
    let valueType = this.props.type
    let ValueDisplay = registry.get('value:'+valueType)
    if (ValueDisplay) {
      let value = this.props
      let pointer = false
      if (!value.data && value.preview) {
        pointer = true
        value = {
          type: value.type,
          data: value.preview
        }
      }

      let valueEl = $$(ValueDisplay, {value, pointer}).ref('value')
      el.append(valueEl)
    }
    return el
  }

}
