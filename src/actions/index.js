import * as api from '../api'
import { normalize } from 'normalizr'
import * as schema from './schema'
import { getIsFetching } from '../reducers'

export const toggleAddToDo = () => ({
    type: 'TOGGLE_ADD_TODO'
})

export const toggleSideBar = () => ({
    type: 'TOGGLE_SIDEBAR'
})

export const login = (username, password) => (dispatch) => {
     if ( !username || !password ) {
         dispatch({
             type: 'USER_LOGIN_FAILURE',
             error: { clientErr: '请确保已经输入账号密码' }
         })
         return
     }
     dispatch({
         type: 'USER_LOGIN_REQUEST'
     })

     api.login(username, password)
        .then(loginedUser => {
            dispatch({
                type: 'USER_LOGIN_SUCCESS',
                loginedUser
            })
        })
        .catch(res=> {
            if(res.code === 211) {
                 console.log('无法找到用户，我们将为您注册，请注意您将会使用输入的用户名登录。')
                 return api.signUp(username, password)
                        .then(signedUser => {
                            dispatch({
                                type: 'USER_LOGIN_SUCCESS',
                                loginedUser: signedUser
                            })
                        }) 
            }
            dispatch({
                type: 'USER_LOGIN_FAILURE',
                error: res
            })
        })

}


export const logOut = () => (dispatch) => {
    api.logOut().then(() => {
        dispatch({
            type: 'USER_LOGOUT_SUCCESS'
        })
    })
    .catch(res => {
        dispatch({
            type: 'USER_LOGOUT_FAILURE',
            error: res
        })
    })
}


export const addTodo = (text, due) => (dispatch) => {
    api.addTo(text, due).then((response) => {
        const receivedTodo = {
            ...response.attributes,
            id: response.id
        }
       /* console.log('response: ', response)
        console.log('receivedTodo: ', receivedTodo)
        console.log('schema.todo: ', schema.todo)*/
        console.log('normalize(receivedTodo, schema.todo): ', 
        normalize(receivedTodo, schema.todo))
        dispatch({
            type: 'ADD_TODO_SUCCESS',
            response: normalize(receivedTodo, schema.todo)
        })
    }, (error) => {
        dispatch({
        type: 'ADD_TODO_FAILURE',
        filter: 'all',
        message: error.message || '添加失败，请重新尝试'
        }
    )
  })
}

export const editTodo = (id, text) => (dispatch) => {
  console.log('text: ', text);
  api.editTodo(id, text).then((response) => {
    const receivedTodo = {
      ...response.attributes,
      id: response.id
    }
    dispatch({
      type: 'EDIT_TODO_SUCCESS',
      response: normalize(receivedTodo, schema.todo)
    })
  },
  error => {
    dispatch({
      type: 'EDIT_TODO_FAILURE',
      filter: 'all',
      message: error.message || '编辑失败，请重新尝试'
    })
  })
}

export const toggleTodo = (id) => (dispatch) => {
  api.toggleTodo(id).then((response) => {
    const receivedTodo = {
      ...response.attributes,
      id: response.id
    }
    dispatch({
      type: 'TOGGLE_TODO_SUCCESS',
      response: normalize(receivedTodo, schema.todo)
    })
  },
  error => {
    dispatch({
      type: 'TOGGLE_TODO_FAILURE',
      filter: 'all',
      message: error.message
    })
  })
}

export const deleteTodo = (id) => (dispatch) => {
  api.deleteTodo(id)
    .then( (res) => {
      if (res.results.length) {
        dispatch({
          type: 'DELETE_TODO_SUCCESS',
          id: id
        })
      }
    },
    error => {
      dispatch({
        type: 'DELETE_TODO_FAILURE',
        filter: 'all',
        message: error.message
      })
    })
}


export const fetchTodos = (filter) => (dispatch, getState) => {
  if (getIsFetching(getState(), filter)) {
    return Promise.resolve()
  }
  dispatch({
    type: 'FETCH_TODOS_REQUEST',
    filter
  })
  return api.fetchTodos(filter).then(
    response => {
      const receivedTodos = response.map(todo => {
        return {
          ...todo.attributes,
          id: todo.id
        }
      })
      console.log('receivedTodos: ', receivedTodos)
      console.log('schema.arrayOfTodos: ', schema.arrayOfTodos)
      console.log('normalize(receivedTodos, schema.arrayOfTodos): ',
      normalize(receivedTodos, schema.arrayOfTodos))
      return dispatch({
        type: 'FETCH_TODOS_SUCCESS',
        filter,
        response: normalize(receivedTodos, schema.arrayOfTodos)
      })
    },
    error => {
      dispatch({
        type: 'FETCH_TODOS_FAILURE',
        filter,
        message: error.message || '获取数据出错'
      })
    }
  )
}

