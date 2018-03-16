import { DocumentAdapter, CellAdapter } from '../shared/DocumentAdapter'

/*
  Connects Engine and Article.
*/
export default class ArticleAdapter extends DocumentAdapter {

  _initialize() {
    // find all
    const docId = this._getDocId()
    const doc = this.doc
    const engine = this.engine
    let nodeAdapters = doc.findAll('cell').map(node => this.adaptNode(node))
    let docAdapter = engine.addDocument({
      id: docId,
      name: this.name,
      // default language
      lang: 'mini',
      cells: nodeAdapters
    })
    // TODO: register the 'natural' order of cells (i.e. cell.prev/next) enabling support reactive updates for cells with side-effects.

    // use the Engine's cell data as state of the Article's node
    // NOTE: we can do this as long as we run the Engine in the same thread
    // Otherwise we would need to keep a local version of the state
    docAdapter.getCells().forEach((cell,idx) => {
      nodeAdapters[idx].node.state = cell
    })
    // Engine's Document API allowing for easier updates
    this.docAdapter = docAdapter

    this.editorSession.on('render', this._onDocumentChange, this, { resource: 'document' })
    this.engine.on('update', this._onEngineUpdate, this)
  }

  _onDocumentChange(change) {
    const doc = this.doc
    const ops = change.ops
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i]
      switch (op.type) {
        case 'create': {
          let node = doc.get(op.path[0])
          if (node) {
            this._onCreate(node)
          }
          break
        }
        case 'delete': {
          this._onDelete(op.val)
          break
        }
        case 'set':
        case 'update': {
          let node = doc.get(op.path[0])
          if (node) {
            this._onChange(node, op)
          }
          break
        }
        default:
          throw new Error('Invalid state')
      }
    }
  }

  _onCreate(node) { // eslint-disable-line
    // const engine = this.engine
    // if (CELL_TYPES[node.type]) {
    //   let adapter = new CellAdapter(this.editorSession, node)
    //   engine.registerCell(adapter)
    // } else if (INPUT_TYPES[node.type]) {
    //   let adapter = new InputAdapter(this.editorSession, node)
    //   engine.registerCell(adapter)
    //   return true
    // }
    // return false
  }

  _onDelete(node) { // eslint-disable-line
    // const engine = this.engine
    // if (CELL_TYPES[node.type] || INPUT_TYPES[node.type]) {
    //   engine.removeCell(`${this.doc.UUID}#${node.id}`)
    //   return true
    // }
    // return false
  }

  _onChange(node) {
    const engine = this.engine
    if (node.type === 'source-code') {
      let cell = node.parentNode
      // TODO: we should use a helper to access these
      let cellState = cell.state
      let adapter = cell._engineAdapter
      if (cellState && adapter) {
        engine._updateCell(cellState.id, {
          source: adapter.source,
          lang: adapter.lang
        })
      }
      return true
    }
    return false
  }

  _adaptNode(node) {
    return new DocumentCellAdapter(node)
  }

  static connect(engine, editorSession, name) {
    return new ArticleAdapter(engine, editorSession, name)
  }
}

class DocumentCellAdapter extends CellAdapter {

  _getSourceElement() {
    if (!this._sourceEl) {
      this._sourceEl = this.node.find('source-code')
    }
    return this._sourceEl
  }

}
