import 'regenerator-runtime/runtime'

import React from 'react'
import { render } from 'react-dom'
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom'
import cn from 'classnames'
import * as hooks from '@dhmk/hooks'
import { useRelativeRoute } from '@dhmk/hooks/lib/router'

import Masonry from './mas-virtual'
import { IntervalPartialSensor as PartialSensor } from './visibility-sensor'
import fetchPhotos from './fetch-photos'
import * as utils from './utils'
import * as C from './Comps'
import logo from '../logo.jpg'

const App = () => {
  const { url, path } = useRelativeRoute()

  return (
    <div className="container">
      <header className="header">
        <a href="/" className="header__brand">
          <img src={logo} className="header__image" />
        </a>
        <h1 className="header__title">Meow!!</h1>
      </header>

      <C.Menu className="site-menu">
        <C.MenuLink to={url('cats')}>
          <C.Icon name="image" />
          Cats
        </C.MenuLink>
        <C.MenuLink to={url('mices')}>
          <C.Icon name="music" />
          Mices
        </C.MenuLink>
        <C.MenuLink to={url('custom')}>
          <C.Icon name="search" />
          Other
        </C.MenuLink>
      </C.Menu>

      {/* Just a demo */}
      <Route
        render={({ location }) =>
          location.pathname.endsWith('/') ? null : (
            // TODO: pass state & query
            <Redirect to={location.pathname + '/'} />
          )
        }
      />

      <main className="main">
        <Switch>
          <Route path={path('cats')}>
            <CatsPage />
          </Route>
          <Route path={path('mices')}>
            <MicesPage />
          </Route>
          <Route path={path('custom')}>
            <CustomSearch />
          </Route>
          <Route path="/" exact>
            <p className="main__info">Select menu item to get started</p>
          </Route>
          <Redirect to="/" />
        </Switch>
      </main>

      <footer className="footer">
        <p>Pixabay images search &copy; 2020 - dhmk</p>
      </footer>
    </div>
  )
}

const CatsPage = () => {
  const { url, path } = useRelativeRoute()

  return (
    <div>
      <C.Menu small className="cats__menu center-m">
        <C.MenuLink to={url('/brown')}>Brown</C.MenuLink>
        <C.MenuLink to={url('striped')}>Striped</C.MenuLink>
        <C.MenuLink to={url('spotted')}>Spotted</C.MenuLink>
      </C.Menu>

      <Switch>
        <Route
          path={path(':kind')}
          render={({ match }) => <Images q={`${match.params.kind} cat`} />}
        />
        <Route>
          <p className="cats__info">Please, select a sub-category</p>
        </Route>
      </Switch>
    </div>
  )
}

const MicesPage = () => {
  const [page, setPage] = React.useState(1)

  return (
    <>
      <Images q="mouse" page={page} keepOld />
      <PartialSensor>{() => setPage(p => p + 1)}</PartialSensor>
    </>
  )
}

const CustomSearch = () => {
  const location = useLocation()
  const history = useHistory()

  const { q, page } = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      q: params.get('q') || '',
      page: Number(params.get('page')) || 1,
    }
  }, [location])

  const getParams = hooks.useGetter({ q, page })
  const buildUrl = obj => `?${utils.encodeQuery({ ...getParams(), ...obj })}`
  const getUrl = React.useCallback(page => buildUrl({ page }), [])
  const setQ = React.useCallback(q => history.push(buildUrl({ q })), [])

  const [
    { isLoading, totalItems, totalPages },
    { setLoading, setResults },
  ] = hooks.useLogic(
    ({ merge }) => ({
      setLoading: x => merge({ isLoading: x }),
      setResults: x =>
        merge({
          isLoading: false,
          totalPages: x ? x.totalPages : 0,
          totalItems: x ? x.totalItems : 0,
        }),
    }),
    { isLoading: false, totalPages: 0, totalItems: -1 },
  )

  React.useEffect(() => setLoading(!!q), [q, page])

  return (
    <div>
      <div
        className={cn('search__input', isLoading && 'search__input--loading')}
      >
        <C.SearchInput onChange={setQ} defaultValue={q} />
      </div>
      {!isLoading && totalItems >= 0 && (
        <p className="search__count">Found: {totalItems}</p>
      )}
      <Images q={q} page={page} onLoad={setResults} />
      {!isLoading && totalPages > 1 && (
        <C.Pager {...{ page, totalPages, getUrl }} className="search__pager" />
      )}
    </div>
  )
}

const Images = ({ q, page = 1, onLoad = null, keepOld = false }) => {
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [active, setActive] = React.useState()
  const getParams = hooks.useGetter({ onLoad, keepOld })

  React.useEffect(() => {
    if (!q) return

    let disposed = false
    let info

    setActive(null)
    setLoading(true)
    !getParams().keepOld && setItems([])

    fetchPhotos({ q, page })
      .then(x => {
        if (!disposed) {
          setItems(old =>
            old.concat(
              x.hits.map(q => ({
                key: q.id,
                src: q.largeImageURL,
                width: q.imageWidth,
                height: q.imageHeight,
              })),
            ),
          )

          info = {
            totalItems: x.totalHits,
            totalPages: Math.ceil(x.totalHits / x.hits.length),
          }
        }
      })
      .finally(() => {
        if (!disposed) {
          setLoading(false)
          const { onLoad } = getParams()
          onLoad && onLoad(info)
        }
      })

    return () => (disposed = true)
  }, [q, page])

  return (
    <div>
      <Masonry count={items.length} overscanByPixels={200}>
        {({ index, columnWidth }) => {
          const item = items[index]
          if (!item) return null

          const height = (columnWidth / item.width) * item.height

          return (
            <img
              src={item.src}
              style={{ height }}
              onClick={() => setActive(item.src)}
            />
          )
        }}
      </Masonry>
      {loading && <C.Loading />}
      {active && <C.ImageModal src={active} onClose={() => setActive(null)} />}
    </div>
  )
}

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('app'),
)
