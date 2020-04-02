import React from 'react'
import { useRouteMatch, Link } from 'react-router-dom'
import cn from 'classnames'

import * as utils from './utils'

export const Loading = () => <progress className="loading" />

export const SearchInput = ({ onChange, defaultValue, className }) => {
  const inputRef = React.useRef()
  const search = React.useCallback(
    utils.debounced(() => onChange(inputRef.current.value), 500),
    []
  )

  return (
    <input
      ref={inputRef}
      className={cn('input', className)}
      placeholder="Please, enter your query..."
      defaultValue={defaultValue}
      onChange={search}
    />
  )
}

export const Menu = ({ small = false, className, children }) => (
  <ul className={cn(className, 'menu', small && 'menu--small')}>{children}</ul>
)

export const MenuLink = props => {
  const match = useRouteMatch(props.to)
  const exact = match && match.isExact

  return (
    <li
      className={cn(
        'menu-link',
        match && 'menu-link--active',
        exact && 'menu-link--exact'
      )}
    >
      <Link {...props} />
    </li>
  )
}

export const Icon = ({ name, category = 'fas' }) => (
  <span className="icon">
    <i className={`${category} fa-${name}`} />
  </span>
)

export const Pager = ({ page, totalPages, getUrl, className }) => (
  <nav className={cn('pager', className)}>
    <Link to={getUrl(page - 1)} disabled={page === 1} className="pager__prev">
      Previous
    </Link>

    <span className="pager__text">
      Page {page} of {totalPages}
    </span>

    <Link
      to={getUrl(page + 1)}
      disabled={page === totalPages}
      className="pager__next"
    >
      Next
    </Link>
  </nav>
)

export const ImageModal = ({ src, onClose }) => {
  const [active, setActive] = React.useState()
  const [closing, setClosing] = React.useState()
  React.useEffect(() => setActive(true), [])
  React.useEffect(() => {
    closing && setTimeout(onClose, 500)
  }, [closing])

  return (
    <div
      className={cn(
        'image-modal',
        active && 'image-modal--active',
        closing && 'image-modal--closing'
      )}
      onClick={() => setClosing(true)}
    >
      <img src={src} />
    </div>
  )
}
