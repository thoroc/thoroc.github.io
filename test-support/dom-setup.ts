import { GlobalRegistrator } from '@happy-dom/global-registrator'

// A real http(s) base URL is required so window.history.pushState/
// replaceState and window.location.search actually resolve — happy-dom's
// default `about:blank` document silently no-ops relative-URL history
// mutations (needed by useStarsStore's URL-query-string sync functions).
GlobalRegistrator.register({ url: 'http://localhost/' })
