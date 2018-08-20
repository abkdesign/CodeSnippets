data={
  expiresIn: "3600",
  idToken: "sdfsdf",
  userId: "12",
  companyId: "12as"
}
// SIGN_IN -> AUTHORIZE -> REFRESH* -> SIGN_OUT
expDAte = new Date(new Date().getTime() + data.expiresIn*1000);
const authSuccess = (state, action)=>{
  return updateObject(state, {error:null, loading: true})
}
localStorage.setItem('token', data.idToken);
localStorage.setItem('expirationDate', expirationDate);

export const validateToken  = (expDate) =>{
  if (expDate < Date.now() / 1000 ){
    localStorage.clear();
  }
}
export const 
export const loadState = () => {
  //  use try to get state from  localstorage
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  }
  catch (err) {
    return undefined;
  }
}

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);

  } catch (err) {
    //ignore write errors
  }
};
// Side effects Services
function getAuthToken() {
  return JSON.parse(localStorage.getItem('authToken'))
}

function setAuthToken(token) {
  localStorage.setItem('authToken', JSON.stringify(token))
}

function removeAuthToken() {
  localStorage.removeItem('authToken')
}


function* authFlowSaga() {
  while (true) {
    // first expect a SIGN_IN
    const { credentials } = yield take(SIGN_IN)
    const token = yield call(authorize, credentials)

    // followed by a SIGN_OUT
    yield take(SIGN_OUT)
    yield call(signout)
  }
}

// reusable subroutines. Avoid duplicating code inside the main Saga
function* authorize(credentialsOrToken) {
  // call the remote authorization service
  const token = yield call(authService, credentialsOrToken)
  yield call(setAuthToken, token) // save to local storage
  yield put(authSuccess, token) // notify the store
  return token
  // alternative
  const { response } = yield race({
    response: call(authService, credentialsOrToken),
    signout: take(SIGN_OUT)
  })

  // server responded (with Success) before user signed out
  if (response && response.token) {
    yield call(setAuthToken, response.token) // save to local storage
    yield put(authSuccess, response.token)
    return response.token
  }
  // user signed out before server response OR server responded first but with error
  else {
    yield call(signout, response ? response.error : 'User signed out')
    return null
  }
}

function* signout(error) {
  yield call(removeAuthToken) // remove the token from localStorage
  yield put(actions.signout(error)) // notify th store
}


const reducer = (state, action) =>{
  switch (action.type) {
    case actionTypes.AUTH_START:
        return updateObject(state, {error: null, loading:true})
      break;
    case actionTypes.AUTH_SUCESS:
    default:
    return state
      break;
  }
}

const initialState = loadState();
// Create history object
export const browserHistory = createHistory();
const routermiddleware = routerMiddleware(
  //browserHistory
);
const Store = createStore(
  rootReducer,
  initialState,
  // compose wraps around the middleware.
  composeWithDevTools(
    applyMiddleware(
      thunk,
      routermiddleware
    ),
    // other store enhancers if any

  ));


function* authorize(refresh) {
  try {
    const token = yield call(auth.authorize, refresh);
    yield call(auth.storeToken, token);
    yield put(authorizeSuccess(token));
    return token;
  } catch (e) {
    yield call(auth.storeToken, null);
    yield put(authorizeFailure(e));
    return null;
  }
}

function* authorizeLoop(token) {
  try {
    while (true) {
      const refresh = token != null;
      token = yield call(authorize, refresh);
      if (token == null)
        return;

      yield call(delay, token.expires_in);
    }
  } catch (e) {
    if (e instanceof InterruptedError)
      return;

    throw e;
  }
}