import axios from 'axios';
import { GET_POST, GET_POSTS, GET_ERRORS, POST_LOADING, DELETE_POST, ADD_POST } from './types';

//Add post
export const addPost = postData => dispatch => {
  axios.post('/api/posts', postData)
    .then(res => dispatch({
      type: ADD_POST,
      payload: res.data
    }))
    .catch(err => dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    }));
}

//Get posts

export const getPosts = () => dispatch => {
  dispatch(setPostLoading());
  axios.get('/api/posts')
    .then(res => dispatch({
      type: GET_POSTS,
      payload: res.data
    }))
    .catch(err => dispatch({
      type: GET_POSTS,
      payload: null
    }))
}

//Set loding state
export const setPostLoading = () => {
  return {
    type: POST_LOADING
  }
}