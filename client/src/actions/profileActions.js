import axios from 'axios';
import { GET_PROFILE, PROFILE_LOADING, CLEAR_CURRENT_PROFILE, GET_ERRORS, SET_CURRENT_USER } from './types';

//Get current profile
export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios.get('/api/profile')
    .then(res => dispatch({
      type: GET_PROFILE,
      payload: res.data
    }))
    .catch(err => dispatch({
      type: GET_PROFILE,
      payload: {}
    }));
}

//Create Profile
export const createUserProfile = (profileData, history) => dispatch => {
  axios.post('/api/profile', profileData)
    .then(res => history.push('/dashboard'))
    .catch(err => dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    }));
};

//Delete Account & Profile
export const deleteAccount = () => dispatch => {
  if (window.confirm('Are you sure? This can Not be undone'))
    axios.delete('/api/profile')
      .then(res => dispatch({
        type: SET_CURRENT_USER,
        payload: {}
      }))
      .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      }))
};

//Pofile loading
export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  }
}

//Pofile loading
export const clearProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  }
}