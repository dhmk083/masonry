import React from 'react'
import {
  createMasonryCellPositioner,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
  WindowScroller,
  Masonry,
} from 'react-virtualized'

export default class extends React.Component {
  constructor(...args) {
    super(...args)

    this._params = {
      columnWidth: 200,
      gutterSize: 10,
    }

    this._cache = new CellMeasurerCache({
      fixedWidth: true,
    })

    this._cellRenderer = this._cellRenderer.bind(this)
    this._onResize = this._onResize.bind(this)
    this._masonry = React.createRef()
  }

  componentDidUpdate() {
    if (!this.props.count) {
      this._resetList()
    }
  }

  render() {
    return <WindowScroller>{p => this._renderAutoSizer(p)}</WindowScroller>
  }

  _autoColumnWidth() {
    this._changeColumnWidth(
      (this._width - (this._columnCount - 1) * this._params.gutterSize) /
        this._columnCount
    )
  }

  _changeColumnWidth(x) {
    this._cache.clearAll()
    this._params.columnWidth = x

    this._calculateColumnCount()
    this._resetCellPositioner()
    this._masonry.current.clearCellPositions()
  }

  _calculateColumnCount() {
    const w = this._width
    this._columnCount = w < 300 ? 1 : w < 600 ? 2 : 3
  }

  _cellRenderer({ index, key, parent, style }) {
    const { children } = this.props
    const { columnWidth, gutterSize } = this._params

    const item = children({ columnWidth, gutterSize, index })
    if (!item) return null

    return (
      <CellMeasurer cache={this._cache} index={index} key={key} parent={parent}>
        <div
          style={{
            ...style,
            width: columnWidth,
          }}
        >
          {item}
        </div>
      </CellMeasurer>
    )
  }

  _initCellPositioner() {
    if (!this._cellPositioner) {
      const { columnWidth, gutterSize } = this._params

      this._cellPositioner = createMasonryCellPositioner({
        cellMeasurerCache: this._cache,
        columnCount: this._columnCount,
        columnWidth,
        spacer: gutterSize,
      })
    }
  }

  _onResize({ width }) {
    this._width = width

    this._calculateColumnCount()
    this._resetCellPositioner()
    this._masonry.current.recomputeCellPositions()

    this._autoColumnWidth()
  }

  _renderAutoSizer({ height, scrollTop }) {
    this._height = height
    this._scrollTop = scrollTop

    return (
      <AutoSizer
        disableHeight
        height={height}
        onResize={this._onResize}
        scrollTop={this._scrollTop}
      >
        {p => this._renderMasonry(p)}
      </AutoSizer>
    )
  }

  _renderMasonry({ width }) {
    this._width = width

    this._calculateColumnCount()
    this._initCellPositioner()

    const { count, overscanByPixels } = this.props

    return (
      <Masonry
        ref={this._masonry}
        style={{ outline: 'none' }}
        cellCount={count}
        cellMeasurerCache={this._cache}
        cellPositioner={this._cellPositioner}
        cellRenderer={this._cellRenderer}
        overscanByPixels={overscanByPixels}
        scrollTop={this._scrollTop}
        width={width}
        height={this._height}
        autoHeight
      />
    )
  }

  _resetList() {
    this._cache.clearAll()
    this._resetCellPositioner()
    this._masonry.current.clearCellPositions()
  }

  _resetCellPositioner() {
    const { columnWidth, gutterSize } = this._params

    this._cellPositioner.reset({
      columnCount: this._columnCount,
      columnWidth,
      spacer: gutterSize,
    })
  }
}
